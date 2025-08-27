import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import polygonListingsUrl from './parcels/assetPolygonBaazaarListings.json'

// We need to fetch all listings in full to get accurate info.

const { selectedNetwork, NETWORKS } = useNetwork()

const useParcelBaazaarListingsForNetwork = function (network) {
  const listingsByParcelId = ref({})
  const salesByParcelId = ref({})

  const SUBGRAPH_URL = network === NETWORKS.polygon ? apis.CORE_MATIC_SUBGRAPH : apis.CORE_BASE_SUBGRAPH
  const FETCH_PAGE_SIZE = 1000

  const resetListings = function () {
    listingsByParcelId.value = {}
    salesByParcelId.value = {}
    lastFetchDate.value = null
  }

  const setListings = function (listings) {
    for (const listing of listings) {
      const priceInGhst = (new BigNumber(listing.priceInWei)).dividedBy(10e17)
      if (listing.timePurchased !== '0') {
        salesByParcelId.value[listing.tokenId] = {
          network,
          id: listing.id,
          seller: listing.seller,
          priceInGhst,
          priceInGhstJsNum: priceInGhst.toNumber(),
          datePurchased: new Date(listing.timePurchased * 1000)
        }
      } else {
        listingsByParcelId.value[listing.tokenId] = {
          network,
          id: listing.id,
          seller: listing.seller,
          priceInGhst,
          priceInGhstJsNum: priceInGhst.toNumber(),
          dateCreated: new Date(listing.timeCreated * 1000)
        }
      }
    }
  }

  const setListingsFromAsset = function (data) {
    listingsByParcelId.value = Object.fromEntries(
      Object.entries(data.listings).map(
        ([id, listing]) => {
          const priceInGhst = new BigNumber(listing.priceInGhst)
          return [
            id,
            {
              ...listing,
              priceInGhst,
              priceInGhstJsNum: priceInGhst.toNumber(),
              dateCreated: new Date(listing.dateCreated)
            }
          ]
        }
      )
    )
    salesByParcelId.value = Object.fromEntries(
      Object.entries(data.sales).map(
        ([id, sale]) => {
          const priceInGhst = new BigNumber(sale.priceInGhst)
          return [
            id,
            {
              ...sale,
              priceInGhst,
              priceInGhstJsNum: priceInGhst.toNumber(),
              datePurchased: new Date(sale.datePurchased)
            }
          ]
        }
      )
    )
  }

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const fetchListings = function (forceFetch) {
    // Polygon data is cached as an asset, and only needs to be fetched once.
    // (set forceFetch=true to bypass this and fetch it from the subgraph)
    if (network === NETWORKS.polygon && !forceFetch) {
      if (!lastFetchDate.value) {
        const [isStale, setLoaded, setError] = setLoading()
        fetch(polygonListingsUrl)
          .then(response => response.json())
          .then(json => {
            if (isStale()) { return }
            resetListings()
            setListingsFromAsset(json)
            lastFetchDate.value = new Date()
            setLoaded()
          }).catch(error => {
            console.error(error)
            setError('Error loading cached polygon baazaar listings')
          })
      }
    } else {
      // Either on base, or on polygon+forceFetch: fetch data from subgraph
      const [isStale, setLoaded, setError] = setLoading()
      let listings = []
      let lastTimeCreated = 0
      const fetchListingsFromSubgraph = function () {
        fetch(SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query: `{
              erc721Listings(first: ${FETCH_PAGE_SIZE}, orderBy: timeCreated, where: { timeCreated_gte: ${lastTimeCreated}, category: "4", cancelled: false }) {
                id
                tokenId
                seller
                timeCreated
                timePurchased
                priceInWei
              }
            }`
          })
        }).then(async response => {
          if (isStale()) { console.log('Stale request, ignoring'); return }
          if (!response.ok) {
            setError('There was an error fetching listings')
            return
          }
          const responseJson = await response.json()
          if (responseJson.data?.erc721Listings) {
            listings = listings.concat(responseJson.data.erc721Listings)
            if (responseJson.data.erc721Listings.length < FETCH_PAGE_SIZE) {
              // finished fetching all pages
              resetListings()
              setListings(listings)
              lastFetchDate.value = new Date()
              setLoaded()
              return
            }
            // fetch the next page of results
            lastTimeCreated = listings[listings.length - 1].timeCreated
            fetchListingsFromSubgraph()
          } else {
            setError('Unexpected response')
          }
        }).catch(error => {
          console.error(error)
          setError('There was an error fetching listings')
        })
      }

      fetchListingsFromSubgraph()
    }
  }

  const forceFetchListings = function () {
    fetchListings(true)
  }

  return {
    listingsByParcelId,
    salesByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchListings,
    forceFetchListings,
    lastFetchDate
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelBaazaarListingsForNetwork(network) })

export default function useParcelBaazaarListings () {
  // If current network is polygon, just return that.
  // if current network is base, fetch BOTH base and polygon;
  //  when both have been fetched:
  //    listingsByParcelId: use the base version only
  //    salesByParcelId: most recent sale, so use base's sale if present, otherwise polygon's sale
  // Store the network in each listing/sale object.

  const polygonItem = getItemForNetwork(NETWORKS.polygon)
  const baseItem = getItemForNetwork(NETWORKS.base)

  // use the currently selected network, which can change over time

  const fetchStatus = computed(() => {
    if (selectedNetwork.value === NETWORKS.polygon) {
      return polygonItem.fetchStatus.value
    }
    return {
      loading: baseItem.fetchStatus.value.loading || polygonItem.fetchStatus.value.loading,
      error: baseItem.fetchStatus.value.error || polygonItem.fetchStatus.value.error,
      errorMessage: baseItem.fetchStatus.value.errorMessage || polygonItem.fetchStatus.value.errorMessage,
      loaded: baseItem.fetchStatus.value.loaded && polygonItem.fetchStatus.value.loaded
    }
  })

  const listingsByParcelId = computed(() => {
    if (!fetchStatus.value.loaded) {
      return {}
    }
    if (selectedNetwork.value === NETWORKS.polygon) {
      return polygonItem.listingsByParcelId.value
    }
    return baseItem.listingsByParcelId.value
  })

  const salesByParcelId = computed(() => {
    if (!fetchStatus.value.loaded) {
      return {}
    }
    if (selectedNetwork.value === NETWORKS.polygon) {
      return polygonItem.salesByParcelId.value
    }
    return {
      ...polygonItem.salesByParcelId.value,
      ...baseItem.salesByParcelId.value
    }
  })

  const canSubmitFetch = computed(() => {
    if (selectedNetwork.value === NETWORKS.polygon) {
      return polygonItem.canSubmitFetch.value
    }
    return baseItem.canSubmitFetch.value && polygonItem.canSubmitFetch.value
  })

  const fetchListings = function () {
    if (selectedNetwork.value === NETWORKS.polygon) {
      polygonItem.fetchListings()
      return
    }
    baseItem.fetchListings()
    polygonItem.fetchListings()
  }

  const forceFetchListings = function () {
    if (selectedNetwork.value === NETWORKS.polygon) {
      polygonItem.forceFetchListings()
      return
    }
    baseItem.forceFetchListings()
    polygonItem.forceFetchListings()
  }

  const lastFetchDate = computed(() => {
    if (selectedNetwork.value === NETWORKS.polygon) {
      return polygonItem.lastFetchDate.value
    }
    return baseItem.lastFetchDate.value
  })

  return {
    listingsByParcelId,
    salesByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchListings,
    forceFetchListings,
    lastFetchDate
  }
}
