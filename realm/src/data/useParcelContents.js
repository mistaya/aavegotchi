import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import polygonContentsUrl from './parcels/assetPolygonContents.json'

const { selectedNetwork, NETWORKS } = useNetwork()

const useParcelContentsForNetwork = function (network) {
  const installationsByParcelId = ref({})
  const tilesByParcelId = ref({})

  const SUBGRAPH_URL = apis[network].GOTCHIVERSE_SUBGRAPH
  const FETCH_PAGE_SIZE = 1000

  const resetContents = function () {
    installationsByParcelId.value = {}
    tilesByParcelId.value = {}
    lastFetchDate.value = null
  }

  const setContents = function (parcels) {
    for (const parcel of parcels) {
      if (parcel.equippedInstallations) {
        installationsByParcelId.value[parcel.id] = parcel.equippedInstallations
      }
      if (parcel.equippedTiles) {
        tilesByParcelId.value[parcel.id] = parcel.equippedTiles
      }
    }
  }
  const setContentsFromAsset = function (json) {
    installationsByParcelId.value = json.installations
    tilesByParcelId.value = json.tiles
  }

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const fetchContents = function (forceFetch) {
    // Polygon data is cached as an asset, and only needs to be fetched once.
    // (set forceFetch=true to bypass this and fetch it from the subgraph)
    if (network === NETWORKS.polygon && !forceFetch) {
      if (!lastFetchDate.value) {
        const [isStale, setLoaded, setError] = setLoading()
        fetch(polygonContentsUrl)
          .then(response => response.json())
          .then(json => {
            if (isStale()) { return }
            resetContents()
            setContentsFromAsset(json)
            lastFetchDate.value = new Date()
            setLoaded()
          }).catch(error => {
            console.error(error)
            setError('Error loading cached polygon parcel contents')
          })
      }
    } else {
      // Either on base, or on polygon+forceFetch: fetch data from subgraph
      const [isStale, setLoaded, setError] = setLoading()
      let lastIdNumInstallations = 0
      let lastIdNumTiles = 0
      let parcels = []
      const fetchFromSubgraph = function () {
        fetch(SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query: `{
              parcelsInstallations: parcels(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: {
                id_gt: ${lastIdNumInstallations},
                equippedInstallations_not: []
              }) {
                id
                equippedInstallations {
                  id
                }
              }
              parcelsTiles: parcels(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: {
                id_gt: ${lastIdNumTiles},
                equippedTiles_not: []
              }) {
                id
                equippedTiles{
                  id
                }
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
          if (responseJson.data?.parcelsInstallations && responseJson.data?.parcelsTiles) {
            const { parcelsInstallations, parcelsTiles } = responseJson.data
            parcels = parcels.concat(parcelsInstallations).concat(parcelsTiles)
            if (parcelsInstallations.length < FETCH_PAGE_SIZE && parcelsTiles.length < FETCH_PAGE_SIZE) {
              // finished fetching all pages
              parcels = parcels.map(parcel => {
                if (parcel.equippedInstallations) {
                  return {
                    id: parcel.id,
                    equippedInstallations: Object.fromEntries(
                      parcel.equippedInstallations.map(({ id }) => [id, true])
                    )
                  }
                }
                if (parcel.equippedTiles) {
                  return {
                    id: parcel.id,
                    equippedTiles: Object.fromEntries(
                      parcel.equippedTiles.map(({ id }) => [id, true])
                    )
                  }
                }
              })
              resetContents()
              setContents(parcels)
              lastFetchDate.value = new Date()
              setLoaded()
              return
            }
            // fetch the next page of results
            if (parcelsInstallations.length) {
              lastIdNumInstallations = parcelsInstallations[parcelsInstallations.length - 1].id - 0
            }
            if (parcelsTiles.length) {
              lastIdNumTiles = parcelsTiles[parcelsTiles.length - 1].id - 0
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
  }

  const forceFetchContents = function () {
    fetchContents(true)
  }

  return {
    installationsByParcelId,
    tilesByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchContents,
    forceFetchContents,
    lastFetchDate
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelContentsForNetwork(network) })

export default function useParcelContents () {
  // use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const installationsByParcelId = computed(() => resultToUse.value.installationsByParcelId.value)
  const tilesByParcelId = computed(() => resultToUse.value.tilesByParcelId.value)
  const canSubmitFetch = computed(() => resultToUse.value.canSubmitFetch.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchContents = computed(() => resultToUse.value.fetchContents)
  const forceFetchContents = computed(() => resultToUse.value.forceFetchContents)
  const lastFetchDate = computed(() => resultToUse.value.lastFetchDate.value)

  return {
    installationsByParcelId,
    tilesByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchContents,
    forceFetchContents,
    lastFetchDate
  }
}
