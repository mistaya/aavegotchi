import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'
import apis from '@/data/apis'
import addresses from '@/data/addresses'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'

// We need to fetch all listings in full to get accurate info.

const { selectedNetwork, NETWORKS } = useNetwork()

const useParcelBaazaarListingsForNetwork = function (network) {
  const listingsByParcelId = ref({})
  const salesByParcelId = ref({})

  const SUBGRAPH_URL = apis[network].GBM_AUCTIONS_SUBGRAPH
  const FETCH_PAGE_SIZE = 1000
  const REALM_CONTRACT_ADDRESS = addresses[network].REALM_PARCELS

  const resetListings = function () {
    listingsByParcelId.value = {}
    salesByParcelId.value = {}
    lastFetchDate.value = null
  }

  const setListings = function (listings, timeNow) {
    for (const listing of listings) {
      const highestBidGhst = (new BigNumber(listing.highestBid)).dividedBy(10e17)
      if (listing.endsAt < timeNow) {
        // Auction has finished
        if (listing.totalBids !== '0') {
          salesByParcelId.value[listing.tokenId] = {
            id: listing.id,
            network,
            seller: listing.seller,
            contractAddress: REALM_CONTRACT_ADDRESS,
            highestBidGhst,
            highestBidGhstJsNum: highestBidGhst.toNumber(),
            datePurchased: new Date(listing.endsAt * 1000)
          }
        } else {
          console.log('GBM auction finished without any bids', listing)
        }
      } else {
        // Auction is still ongoing
        // (We assume there will only be one active, non-cancelled auction per parcel)
        listingsByParcelId.value[listing.tokenId] = {
          id: listing.id,
          network,
          seller: listing.seller,
          contractAddress: REALM_CONTRACT_ADDRESS,
          highestBidGhst,
          highestBidGhstJsNum: highestBidGhst.toNumber(),
          dateCreated: new Date(listing.createdAt * 1000),
          dateEnds: new Date(listing.endsAt * 1000),
          lastBidTime: listing.lastBidTime - 0,
          dateLastBid: new Date(listing.lastBidTime * 1000)
        }
      }
    }
  }

  const setListingsFromAsset = function (data) {
    listingsByParcelId.value = Object.fromEntries(
      Object.entries(data.listings).map(
        ([id, listing]) => {
          const highestBidGhst = new BigNumber(listing.highestBidGhst)
          return [
            id,
            {
              ...listing,
              highestBidGhst,
              highestBidGhstJsNum: highestBidGhst.toNumber(),
              dateCreated: new Date(listing.dateCreated),
              dateEnds: new Date(listing.dateEnds),
              dateLastBid: new Date(listing.dateLastBid)
            }
          ]
        }
      )
    )
    salesByParcelId.value = Object.fromEntries(
      Object.entries(data.sales).map(
        ([id, sale]) => {
          const highestBidGhst = new BigNumber(sale.highestBidGhst)
          return [
            id,
            {
              ...sale,
              highestBidGhst,
              highestBidGhstJsNum: highestBidGhst.toNumber(),
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
        import(/* webpackChunkName: "assetPolygonGBMListings" */ '@/data/parcels/assetPolygonGBMListings.json')
          .then(({ default: json }) => {
            if (isStale()) { return }
            resetListings()
            setListingsFromAsset(json)
            lastFetchDate.value = new Date()
            setLoaded()
          })
          .catch((error) => {
            console.error(error)
            setError('Error loading cached polygon GBM listings')
          })
      }
    } else {
      // Either on base, or on polygon+forceFetch: fetch data from subgraph
      const [isStale, setLoaded, setError] = setLoading()
      let listings = []
      let lastCreatedAt = 0
      const timeNow = Math.ceil(Date.now() / 1000)
      const fetchListingsFromSubgraph = function () {
        fetch(SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query: `{
              auctions(
                first: ${FETCH_PAGE_SIZE},
                orderBy: endsAt,
                where: {
                  createdAt_gte: ${lastCreatedAt},
                  type: "erc721"
                  contractAddress: "${REALM_CONTRACT_ADDRESS}"
                  cancelled: false
                }) {
                id
                tokenId
                seller
                createdAt
                endsAt
                highestBid
                totalBids
                lastBidTime
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
          if (responseJson.data?.auctions) {
            listings = listings.concat(responseJson.data.auctions)
            if (responseJson.data.auctions.length < FETCH_PAGE_SIZE) {
              // finished fetching all pages
              resetListings()
              setListings(listings, timeNow)
              lastFetchDate.value = new Date()
              setLoaded()
              return
            }
            // fetch the next page of results
            lastCreatedAt = listings[listings.length - 1].createdAt
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

export default function useParcelGBMListings () {
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
