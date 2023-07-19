import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'
import apis from '@/data/apis'

// We need to fetch all listings in full to get accurate info.

const listingsByParcelId = ref({})
const salesByParcelId = ref({})

const SUBGRAPH_URL = apis.GBM_AUCTIONS_SUBGRAPH
const FETCH_PAGE_SIZE = 1000
const REALM_CONTRACT_ADDRESS = '0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11'

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

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const fetchListings = function () {
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
