import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import polygonOwnersUrl from './parcels/assetPolygonOwners.json'

const { selectedNetwork, NETWORKS } = useNetwork()

// We need to fetch all parcels in full to get accurate info.

const useParcelOwnersForNetwork = function (network) {
  const ownersByParcelId = ref({})

  const GOTCHIVERSE_SUBGRAPH_URL = apis[network].GOTCHIVERSE_SUBGRAPH
  const FETCH_PAGE_SIZE = 1000

  const resetOwners = function () {
    ownersByParcelId.value = {}
    lastFetchDate.value = null
  }

  const setOwners = function (parcels) {
    for (const parcel of parcels) {
      ownersByParcelId.value[parcel.tokenId] = parcel.owner
    }
  }
  const setOwnersFromAsset = function (parcelsMap) {
    ownersByParcelId.value = parcelsMap
  }

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const fetchOwners = function (forceFetch) {
    // Polygon data is cached as an asset, and only needs to be fetched once.
    // (set forceFetch=true to bypass this and fetch it from the subgraph)
    if (network === NETWORKS.polygon && !forceFetch) {
      if (!lastFetchDate.value) {
        const [isStale, setLoaded, setError] = setLoading()
        fetch(polygonOwnersUrl)
          .then(response => response.json())
          .then(json => {
            if (isStale()) { return }
            resetOwners()
            setOwnersFromAsset(json)
            lastFetchDate.value = new Date()
            setLoaded()
          }).catch(error => {
            console.error(error)
            setError('Error loading cached polygon parcel owners')
          })
      }
    } else {
      // Either on base, or on polygon+forceFetch: fetch data from subgraph
      const [isStale, setLoaded, setError] = setLoading()
      let lastIdNum = 0
      let parcels = []
      const fetchOwnersFromSubgraph = function () {
        fetch(GOTCHIVERSE_SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query: `{
              parcels(first: ${FETCH_PAGE_SIZE}, orderBy: tokenId, where: { tokenId_gt: ${lastIdNum} }) {
                tokenId
                owner
              }
            }`
          })
        }).then(async response => {
          if (isStale()) { console.log('Stale request, ignoring'); return }
          if (!response.ok) {
            setError('There was an error fetching parcel owners')
            return
          }
          const responseJson = await response.json()
          if (responseJson.data?.parcels) {
            parcels = parcels.concat(responseJson.data.parcels)
            if (responseJson.data.parcels.length < FETCH_PAGE_SIZE) {
              // finished fetching all pages
              resetOwners()
              setOwners(parcels)
              lastFetchDate.value = new Date()
              setLoaded()
              return
            }
            // fetch the next page of results
            lastIdNum = responseJson.data.parcels[responseJson.data.parcels.length - 1].tokenId - 0
            fetchOwnersFromSubgraph()
          } else {
            setError('Unexpected response')
          }
        }).catch(error => {
          console.error(error)
          setError('There was an error fetching parcel owners')
        })
      }

      fetchOwnersFromSubgraph()
    }
  }

  const forceFetchOwners = function () {
    fetchOwners(true)
  }

  return {
    ownersByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchOwners,
    forceFetchOwners,
    lastFetchDate
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelOwnersForNetwork(network) })

export default function useParcelOwners () {
  // use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const ownersByParcelId = computed(() => resultToUse.value.ownersByParcelId.value)
  const canSubmitFetch = computed(() => resultToUse.value.canSubmitFetch.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchOwners = computed(() => resultToUse.value.fetchOwners)
  const forceFetchOwners = computed(() => resultToUse.value.forceFetchOwners)
  const lastFetchDate = computed(() => resultToUse.value.lastFetchDate.value)

  return {
    ownersByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchOwners,
    forceFetchOwners,
    lastFetchDate
  }
}
