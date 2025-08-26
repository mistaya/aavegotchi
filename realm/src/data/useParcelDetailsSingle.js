import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import { annotateParcelDetails } from './parcelUtils'

const { selectedNetwork, NETWORKS } = useNetwork()

const useParcelDetailsForNetwork = function (network, id) {
  const GOTCHIVERSE_SUBGRAPH_URL = network === NETWORKS.polygon ? apis.GOTCHIVERSE_SUBGRAPH : apis.GOTCHIVERSE_BASE_SUBGRAPH

  const parcelDetails = ref({})

  const resetDetails = function () {
    parcelDetails.value = {}
    lastFetchDate.value = null
  }

  const setDetails = function (details) {
    parcelDetails.value = details
  }

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const fetchDetails = function () {
    const [isStale, setLoaded, setError] = setLoading()

    fetch(GOTCHIVERSE_SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          parcel(id: "${id}") {
            id
            owner
            coordinateX
            coordinateY
            district
            parcelHash
            fudBoost
            fomoBoost
            alphaBoost
            kekBoost
            size
            accessRights {
              actionRight
              accessRight
              whitelistId
            }
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching the parcel details')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.parcel) {
        const parcel = responseJson.data.parcel
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
        // https://github.com/aavegotchi/aavegotchi-realm-diamond/blob/master/contracts/libraries/LibRealm.sol#L197
        const accessRightIdToName = [
          'owner',
          'borrower',
          'whitelist',
          'anyone', // reserved for blacklist, but unimplemented, so in practice acts as anyone
          'anyone'
        ]
        const accessRights = {
          channeling: parcel.accessRights?.find(r => r.actionRight === 0) || { accessRight: 0, whitelistId: null },
          reservoir: parcel.accessRights?.find(r => r.actionRight === 1) || { accessRight: 0, whitelistId: null }
        }
        for (const action in accessRights) {
          const item = accessRights[action]
          item.accessRightName = accessRightIdToName[item.accessRight]
          item.accessRightByName = {
            owner: false,
            borrower: false,
            whitelist: false,
            blacklist: false,
            anyone: false
          }
          item.accessRightByName[accessRightIdToName[item.accessRight]] = true
        }

        const details = annotateParcelDetails({
          ...parcel,
          owner: parcel.owner || null,
          accessRights
        })
        resetDetails()
        setDetails(details)
        lastFetchDate.value = new Date()
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching the parcel details')
    })
  }

  return {
    parcelDetails,
    canSubmitFetch,
    fetchStatus,
    fetchDetails,
    lastFetchDate
  }
}

export default function useParcelDetailsSingle (id) {
  // do not globally cache, as this is parameterised with parcel id
  const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelDetailsForNetwork(network, id) })

  // by default, use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const parcelDetails = computed(() => resultToUse.value.parcelDetails.value)
  const canSubmitFetch = computed(() => resultToUse.value.canSubmitFetch.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchDetails = computed(() => resultToUse.value.fetchDetails)
  const lastFetchDate = computed(() => resultToUse.value.lastFetchDate.value)

  return {
    parcelDetails,
    canSubmitFetch,
    fetchStatus,
    fetchDetails,
    lastFetchDate
  }
}
