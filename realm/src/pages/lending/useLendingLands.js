import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import INSTALLATIONS from '@/data/parcels/installations.json'

const { selectedNetwork, NETWORKS } = useNetwork()

const FETCH_PAGE_SIZE = 1000

const PARCEL_SIZE_LABELS = {
  '0': 'humble',
  '1': 'reasonable',
  '2': 'spacious',
  '3': 'spacious',
  '4': 'partner'
}

const useLendingLandsForNetwork = function (network) {
  const GOTCHIVERSE_SUBGRAPH_URL = network === NETWORKS.polygon ? apis.GOTCHIVERSE_SUBGRAPH : apis.GOTCHIVERSE_BASE_SUBGRAPH

  let landsQueryWhere = null

  const initLandsQuery = function (computedQuery) {
    if (computedQuery && !landsQueryWhere) {
      landsQueryWhere = computedQuery
    }
  }

  const { status, setLoading, reset } = useStatus()
  const lands = ref(null)

  const resetLands = function () {
    reset()
    lands.value = null
  }

  const fetchLands = function () {
    const [isStale, setLoaded, setError] = setLoading()
    let lastIdNum = 0
    let parcels = []
    const fetchLandsFromSubgraph = function () {
      // console.log('fetchLandsFromSubgraph', landsQueryWhere?.value)
      if (!landsQueryWhere) {
        console.error('landsQueryWhere is not set, cannot fetch lands')
        return
      }
      fetch(GOTCHIVERSE_SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            parcels(
              first: ${FETCH_PAGE_SIZE},
              orderBy: tokenId,
              where: {
                tokenId_gt: ${lastIdNum},
                ${landsQueryWhere.value}
              }
            ) {
              id
              parcelHash
              district
              size
              accessRights {
                actionRight
                accessRight
                whitelistId
              }
              equippedInstallations {
                id
              }
              lastChanneledAlchemica
              lastClaimedAlchemica
            }
          }`
        })
      }).then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          setError('There was an error fetching parcels')
          return
        }
        const responseJson = await response.json()
        if (responseJson.data?.parcels) {
          parcels = parcels.concat(responseJson.data.parcels)
          if (responseJson.data.parcels.length < FETCH_PAGE_SIZE) {
            // finished fetching all pages
            lands.value = parcels.map(p => {
              // accessRights will only be present if they have been set explicitly at some point
              // default to 0
              // actions (actionRight):
              //   0 Alchemical Channeling
              //   1 Emptying Reservoirs
              // permissions (accessRight):
              //   0 Owner only
              //   1 Owner + Borrowed Gotchis
              //   2 Whitelist
              //   3 Blacklist (not implemented)
              //   4 Any Gotchi
              const accessRights = {
                channeling: p.accessRights?.find(r => r.actionRight === 0) || { accessRight: 0, whitelistId: null },
                reservoir: p.accessRights?.find(r => r.actionRight === 1) || { accessRight: 0, whitelistId: null }
              }

              let lastChanneledTimestamp = p.lastChanneledAlchemica * 1000
              let lastClaimedTimestamp = p.lastClaimedAlchemica * 1000
              const equippedInstallations = p.equippedInstallations?.map(({ id }) => INSTALLATIONS[id])
              const aaltar = equippedInstallations.find(installation => installation?.installationType === 'aaltar')
              let cooldownTimestamp
              let cooldownDate
              let reservoirCooldownTimestamp
              let reservoirCooldownDate
              if (aaltar) {
                // Channeling
                if (lastChanneledTimestamp) {
                  cooldownTimestamp = lastChanneledTimestamp + (aaltar.cooldownHours * 60 * 60 * 1000)
                  cooldownDate = new Date(cooldownTimestamp)
                } else {
                  // there is an altar but it hasn't been channeled yet, so it's available
                  cooldownTimestamp = 0
                }
                // Reservoir emptying
                if (lastClaimedTimestamp) {
                  // reservoir cooldown is always 8h
                  reservoirCooldownTimestamp = lastClaimedTimestamp + (8 * 60 * 60 * 1000)
                  reservoirCooldownDate = new Date(reservoirCooldownTimestamp)
                } else {
                  // there is an altar but it hasn't been emptied yet, so it's available
                  reservoirCooldownTimestamp = 0
                }
              } else {
                // If there's no aaltar, can't channel or empty reservoirs.
                lastChanneledTimestamp = undefined
                lastClaimedTimestamp = undefined
              }

              return {
                ...p,
                // convert to number for sorting
                district: p.district - 0,
                size: p.size - 0,
                sizeLabel: PARCEL_SIZE_LABELS[p.size],
                accessRights,
                equippedInstallations,
                aaltar,
                lastChanneledTimestamp,
                lastChanneledDate: lastChanneledTimestamp && new Date(lastChanneledTimestamp),
                cooldownTimestamp,
                cooldownDate,
                lastClaimedTimestamp,
                lastClaimedDate: lastClaimedTimestamp && new Date(lastClaimedTimestamp),
                reservoirCooldownTimestamp,
                reservoirCooldownDate
              }
            })
            setLoaded()
            return
          }
          // fetch the next page of results
          lastIdNum = responseJson.data.parcels[responseJson.data.parcels.length - 1].id - 0
          fetchLandsFromSubgraph()
        } else {
          setError('Unexpected response')
        }
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching lands')
      })
    }

    fetchLandsFromSubgraph()
  }

  return {
    initLandsQuery,
    fetchLands,
    status,
    lands,
    resetLands
  }
}

export default function useLendingLands ({ network = null, landsQueryWhere }) {
  // We don't want a global cache of lending lands, because this is used on pages with different landsQueryWhere
  // instead just cache network-specific versions for the current page/useLendingLands invocation

  const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useLendingLandsForNetwork(network) })
  const getLendingLandsForNetwork = function ({ network, landsQueryWhere }) {
    const item = getItemForNetwork(selectedNetwork.value)
    item.initLandsQuery(landsQueryWhere)
    return item
  }

  // if network is specified, only return that one
  if (network) {
    return getLendingLandsForNetwork({ network, landsQueryWhere })
  }

  // by default, use the currently selected network, which can change over time
  const resultToUse = computed(() => getLendingLandsForNetwork({ network: selectedNetwork.value, landsQueryWhere }))
  const lands = computed(() => resultToUse.value.lands.value)
  const status = computed(() => resultToUse.value.status.value)
  const fetchLands = computed(() => resultToUse.value.fetchLands)
  const resetLands = computed(() => resultToUse.value.resetLands)

  return {
    fetchLands,
    status,
    lands,
    resetLands
  }
}
