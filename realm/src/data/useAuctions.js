import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'
import apis from '@/data/apis'
import auction1JsonUrl from './auctions/assetAuction1.json'
import auction2JsonUrl from './auctions/assetAuction2.json'

// no replacement subgraph available, was originally used for Land Auctions 1 and 2
const REALM_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-realm-matic'
const FETCH_PAGE_SIZE = 1000

// startTime and endTime are compatible with JS Date; divide by 1000 before using in graph query
const AUCTIONS = {
  '1': {
    id: 1,
    jsonUrl: auction1JsonUrl,
    days: '28 - 31 Oct 2021',
    startTime: 1635418800000, // before auction start time
    endTime: 1635710400000, // after last hammer-time parcel auction ends
    districts: ['1', '2', '3', '4', '5', '14', '15', '16', '17', '18', '19', '20', '21', '22', '39', '40', '41', '42', '43'],
    district1Bounds: {
      minX: 3160,
      maxX: 4235
    },
    hasOldDistricts: false,
    display: {
      viewBox: '0 0 5000 5500',
      aspectRatio: 10 / 8
    }
  },
  '2': {
    id: 2,
    jsonUrl: auction2JsonUrl,
    days: '2-5 Dec 2021',
    startTime: 1638446400000, // before auction start time
    endTime: 1638734400000, // after last hammer-time parcel auction ends
    districts: ['1', '7', '8', '9', '10', '11', '12', '27', '28', '29', '30'],
    district1Bounds: {
      minX: 5200,
      maxX: 6336
    },
    hasOldDistricts: false,
    display: {
      viewBox: '6600 1000 2500 4400',
      aspectRatio: 10 / 8
    }
  },
  '3': {
    id: 3,
    jsonUrl: auction2JsonUrl,
    days: '2-5 Dec 2021 (TODO)',
    startTime: 1638446400000, // before auction start time
    endTime: 1638734400000, // after last hammer-time parcel auction ends
    districts: ['1', '7', '8', '9', '10', '11', '12', '27', '28', '29', '30'],
    district1Bounds: {
      minX: 5200,
      maxX: 6336
    },
    hasOldDistricts: true,
    display: {
      viewBox: '6600 1000 2500 4400',
      aspectRatio: 10 / 8
    }
  }
}

const resultByAuctionId = {}

export default function useAuctions (auctionId) {
  if (resultByAuctionId[auctionId]) { return resultByAuctionId[auctionId] }

  const auctionInfo = AUCTIONS[auctionId]
  if (!auctionInfo) {
    console.error('Invalid auctionId provided to useAuctions')
    return
  }

  const auctionsByParcelId = ref({})

  const lastFetchDate = ref(null)
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

  const fetchInitialAuctions = function () {
    const [isStale, setLoaded, setError] = setLoading()
    fetch(auctionInfo.jsonUrl)
      .then(response => response.json())
      .then(json => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        auctionsByParcelId.value = json
        const mostRecentAuctionTime = mostRecentAuction.value?.lastBidTime
        lastFetchDate.value = mostRecentAuctionTime ? new Date(mostRecentAuctionTime * 1000) : new Date()
        setLoaded()
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching auction parcels')
      })
  }

  const fetchAuctions = function () {
    const [isStale, setLoaded, setError] = setLoading()

    const fetchAuctionsFromSubgraph = function () {
      const lastBidTime = mostRecentAuction.value?.lastBidTime || 0
      const startTimeForQuery = auctionInfo.startTime / 1000
      const endTimeForQuery = auctionInfo.endTime / 1000
      // WARNING: this old subgraph is no longer supported, would need to change this code for any future auctions
      fetch(REALM_SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            auctions(first: ${FETCH_PAGE_SIZE}, orderBy: lastBidTime, where: { startTime_gt: "${startTimeForQuery}", endTime_lt: "${endTimeForQuery}", lastBidTime_gte: "${lastBidTime}" }) {
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
              claimed
            }
          }`
        })
      }).then(async response => {
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
            lastFetchDate.value = new Date()
            setLoaded()
            return
          }
          // fetch the next page of results
          fetchAuctionsFromSubgraph()
        } else {
          setError('Unexpected response')
        }
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching parcels')
      })
    }

    fetchAuctionsFromSubgraph()
  }

  const auctionEnded = computed(() => Date.now() > auctionInfo.endTime)

  resultByAuctionId[auctionId] = {
    auctionInfo,
    auctionsByParcelId,
    mostRecentAuction,
    canSubmitFetch,
    fetchStatus,
    fetchAuctions,
    lastFetchDate,
    auctionEnded
  }

  fetchInitialAuctions()

  return resultByAuctionId[auctionId]
}
