import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import INSTALLATIONS from './parcels/installations.json'
import TILES from './parcels/tiles.json'

const FETCH_PAGE_SIZE = 1000

const { selectedNetwork, NETWORKS } = useNetwork()

const useParcelContentsSingleForNetwork = function (network) {
  const GOTCHIVERSE_SUBGRAPH_URL = network === NETWORKS.polygon ? apis.GOTCHIVERSE_SUBGRAPH : apis.GOTCHIVERSE_BASE_SUBGRAPH

  const aaltar = ref(null)
  const installations = ref([])
  const tiles = ref([])
  const lastActivity = ref(null)

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const resetContents = function () {
    aaltar.value = null
    installations.value = []
    tiles.value = []
    lastActivity.value = null
    lastFetchDate.value = null
  }

  const fetchContents = function (parcelId) {
    // console.log('useParcelContentsSingle fetchContents', parcelId, network)
    resetContents()
    const [isStale, setLoaded, setError] = setLoading()

    let parcelQuery = `
      parcel(id: "${parcelId}") {
        lastClaimedAlchemica
        lastChanneledAlchemica
      }
    `
    let lastIdTiles = null
    let lastIdInstallations = null
    let fetchedTiles = []
    let fetchedInstallations = []
    let fetchedActivity = null

    const fetchFromSubgraph = function () {
      const idTilesQuery = lastIdTiles ? `, id_gt: "${lastIdTiles}"` : ''
      const idInstallationsQuery = lastIdInstallations ? `, id_gt: "${lastIdInstallations}"` : ''
      fetch(GOTCHIVERSE_SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            ${parcelQuery}
            tiles(
              first: ${FETCH_PAGE_SIZE},
              orderBy: id,
              orderDirection: "asc",
              where: {
                equipped: true,
                parcel: "${parcelId}"
                ${idTilesQuery}
              }
            ) {
              id
              type {
                id
              }
              x
              y
            }
            installations(
              first: ${FETCH_PAGE_SIZE},
              orderBy: id,
              orderDirection: "asc",
              where: {
                equipped: true,
                parcel: "${parcelId}"
                ${idInstallationsQuery}
              }
            ) {
              id
              type {
                id
              }
              x
              y
            }
          }`
        })
      }).then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          setError('There was an error fetching parcel contents')
          return
        }
        const responseJson = await response.json()
        if (responseJson.data?.tiles && responseJson.data?.installations) {
          if (responseJson.data.parcel) {
            const lastChanneledTimestamp = responseJson.data.parcel.lastChanneledAlchemica * 1000
            const lastChanneledDate = lastChanneledTimestamp && new Date(lastChanneledTimestamp)
            const lastClaimedTimestamp = responseJson.data.parcel.lastClaimedAlchemica * 1000
            const lastClaimedDate = lastClaimedTimestamp && new Date(lastClaimedTimestamp)
            fetchedActivity = {
              lastChanneledTimestamp,
              lastChanneledDate,
              lastClaimedTimestamp,
              lastClaimedDate
            }
            // we only need to fetch the parcel details in the first request
            parcelQuery = ''
          }
          const { tiles: responseTiles, installations: responseInstallations } = responseJson.data
          fetchedTiles = fetchedTiles.concat(responseTiles)
          fetchedInstallations = fetchedInstallations.concat(responseInstallations)
          if (responseTiles.length < FETCH_PAGE_SIZE && responseInstallations.length < FETCH_PAGE_SIZE) {
            // finished fetching all pages

            // store parcel activity
            lastActivity.value = fetchedActivity

            const annotateItems = function (items, itemTypes) {
              return items.map(item => {
                const typeId = item.type?.id
                const type = itemTypes[`${typeId}`]
                if (!type) {
                  console.error('Unknown item type ID', typeId)
                  return null
                }
                return {
                  type,
                  grid: {
                    x: item.x - 0,
                    y: item.y - 0
                  }
                }
              }).filter(item => !!item)
            }
            // annotate and store tiles
            tiles.value = annotateItems(fetchedTiles, TILES)

            // annotate installations
            const allInstallations = annotateItems(fetchedInstallations, INSTALLATIONS)

            // store aaltar separately: assume there is only one
            aaltar.value = allInstallations.find(item => item.type.installationType === 'aaltar')

            // store installations without aaltar
            installations.value = allInstallations.filter(item => item.type.installationType !== 'aaltar')

            setLoaded()
            return
          }
          // Fetch the next page of results
          if (responseTiles.length) {
            lastIdTiles = responseTiles[responseTiles.length - 1].id
          }
          if (responseInstallations.length) {
            lastIdInstallations = responseInstallations[responseInstallations.length - 1].id
          }
          fetchFromSubgraph()
        } else {
          setError('Unexpected response')
        }
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching parcel contents')
      })
    }

    fetchFromSubgraph()
  }

  return {
    aaltar,
    installations,
    tiles,
    lastActivity,
    canSubmitFetch,
    fetchStatus,
    fetchContents,
    lastFetchDate
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelContentsSingleForNetwork(network) })

export default function useParcelContentsSingle (network = null) {
  // use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const aaltar = computed(() => resultToUse.value.aaltar.value)
  const installations = computed(() => resultToUse.value.installations.value)
  const tiles = computed(() => resultToUse.value.tiles.value)
  const lastActivity = computed(() => resultToUse.value.lastActivity.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchContents = computed(() => resultToUse.value.fetchContents)

  return {
    fetchStatus,
    aaltar,
    installations,
    tiles,
    lastActivity,
    fetchContents
  }
}
