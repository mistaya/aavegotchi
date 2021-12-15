import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'

// We need to fetch all listings in full to get accurate info.
// Use cached results just for development
// import initialListings from './baazaar/listings.json'
// import initialSales from './baazaar/sales.json'
// Object.values(initialListings).map(item => {
//   item.priceInGhst = new BigNumber(item.priceInGhst)
//   item.dateCreated = new Date(item.dateCreated)
// })
// Object.values(initialSales).map(item => {
//   item.priceInGhst = new BigNumber(item.priceInGhst)
//   item.datePurchased = new Date(item.datePurchased)
// })
// const listingsByParcelId = ref(initialListings)
// const salesByParcelId = ref(initialSales)

const listingsByParcelId = ref({})
const salesByParcelId = ref({})

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
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
        id: listing.id,
        priceInGhst,
        datePurchased: new Date(listing.timePurchased * 1000)
      }
    } else {
      listingsByParcelId.value[listing.tokenId] = {
        id: listing.id,
        priceInGhst,
        dateCreated: new Date(listing.timeCreated * 1000)
      }
    }
  }
}

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const fetchListings = function () {
  const [isStale, setLoaded, setError] = setLoading()
  let skip = 0
  let listings = []
  const fetchListingsFromSubgraph = function () {
    fetch(SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          erc721Listings(first: ${FETCH_PAGE_SIZE}, skip: ${skip}, orderBy: timeCreated, where: { category: "4", cancelled: false }) {
            id
            tokenId
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
        skip += FETCH_PAGE_SIZE
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

export default function useBaazaarListings () {
  return {
    listingsByParcelId,
    salesByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchListings,
    lastFetchDate
  }
}
