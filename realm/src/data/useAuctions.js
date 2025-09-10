import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'

// no replacement subgraph available, was originally used for Land Auctions 1 and 2
const REALM_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-realm-matic'
const FETCH_PAGE_SIZE = 1000

// startTime and endTime are compatible with JS Date; divide by 1000 before using in graph query
const AUCTIONS = {
  '1': {
    id: 1,
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

    const handleInitialResult = function ({ default: json }) {
      if (isStale()) { return }
      auctionsByParcelId.value = json
      const mostRecentAuctionTime = mostRecentAuction.value?.lastBidTime
      lastFetchDate.value = mostRecentAuctionTime ? new Date(mostRecentAuctionTime * 1000) : new Date()
      setLoaded()
    }

    const handleInitialError = function (error) {
      console.error(error)
      setError('There was an error fetching auction parcels')
    }

    if (auctionInfo.id === 1) {
      import(/* webpackChunkName: "assetAuction1" */ '@/data/auctions/assetAuction1.json')
        .then(handleInitialResult)
        .catch(handleInitialError)
    } else if (auctionInfo.id === 2) {
      import(/* webpackChunkName: "assetAuction2" */ '@/data/auctions/assetAuction2.json')
        .then(handleInitialResult)
        .catch(handleInitialError)
    }
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
