import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import initialAuctions from './auctions.json'
import BigNumber from 'bignumber.js'

const REALM_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-realm-matic'
const FETCH_PAGE_SIZE = 1000
// date of auction
const AUCTION_START_AFTER = 1638446400

const auctionsByParcelId = ref(initialAuctions)

const setAuctions = function (auctions) {
  for (const auction of auctions) {
    auctionsByParcelId.value[auction.tokenId] = {
      ...auction,
      highestBidGhst: (new BigNumber(auction.highestBid)).dividedBy(10e17).toString()
    }
  }
}

const mostRecentAuction = computed(() => {
  let mostRecent = null
  for (const auction of Object.values(auctionsByParcelId.value)) {
    if (!mostRecent) {
      mostRecent = auction
    } else {
      if ((auction.lastBidTime - 0) > (mostRecent.lastBidTime - 0)) {
        mostRecent = auction
      }
    }
  }
  return mostRecent
})

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const fetchAuctions = function () {
  const [isStale, setLoaded, setError] = setLoading()

  const fetchAuctionsFromSubgraph = function () {
    const lastBidTime = mostRecentAuction.value?.lastBidTime || 0
    fetch(REALM_SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          auctions(first: ${FETCH_PAGE_SIZE}, orderBy: lastBidTime, where: { startTime_gt: "${AUCTION_START_AFTER}", lastBidTime_gte: "${lastBidTime}" }) {
            id
            orderId
            type
            tokenId
            highestBid
            highestBidder
            lastBidTime
            totalBids
            startTime
            endTime
          }
        }`
      })
    })
      // .then(response => response.json())
      .then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          setError('There was an error fetching auctions')
          return
        }
        const responseJson = await response.json()
        if (responseJson.data?.auctions) {
          setAuctions(responseJson.data.auctions)
          if (responseJson.data.auctions.length < FETCH_PAGE_SIZE) {
            // finished fetching all pages
            setLoaded()
            return
          }
          // fetch the next page of results
          fetchAuctionsFromSubgraph()
        } else {
          setError('Unexpected response')
        }
      })
      .catch(error => {
        console.error(error)
        setError('There was an error fetching parcels')
      })
  }

  fetchAuctionsFromSubgraph()
}

export default function useAuctions () {
  return {
    auctionsByParcelId,
    mostRecentAuction,
    canSubmitFetch,
    fetchStatus,
    fetchAuctions
  }
}
