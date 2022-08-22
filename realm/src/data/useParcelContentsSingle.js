import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import INSTALLATIONS from './parcels/installations.json'
import TILES from './parcels/tiles.json'

const GOTCHIVERSE_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
const FETCH_PAGE_SIZE = 1000

export default function () {
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
