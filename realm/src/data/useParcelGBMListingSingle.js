import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'

const SUBGRAPH_URL = apis.GBM_AUCTIONS_SUBGRAPH
const REALM_CONTRACT_ADDRESS = '0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11'

export default function useParcelGBMLastSaleSingle (id) {
  const parcelListing = ref(null)

  const resetLastSale = function () {
    parcelListing.value = null
    lastFetchDate.value = null
  }

  const setLastSale = function (listing) {
    parcelListing.value = listing
  }

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const fetchListing = function () {
    const [isStale, setLoaded, setError] = setLoading()

    fetch(SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          auctions(
            first: 1,
            orderBy: endsAt,
            orderDirection: desc,
            where:{
              tokenId: "${id}"
              type: "erc721"
              contractAddress: "${REALM_CONTRACT_ADDRESS}"
              endsAt_gt: "${Math.ceil(Date.now() / 1000)}"
              cancelled: false
            }) {
            id
            tokenId
            highestBid
            createdAt
            endsAt
            lastBidTime
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching the parcel GBM active listing')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.auctions) {
        const auction = responseJson.data?.auctions[0]
        resetLastSale()
        if (auction) {
          const highestBidGhst = (new BigNumber(auction.highestBid)).dividedBy(10e17)
          setLastSale({
            id: auction.id,
            highestBidGhst,
            highestBidGhstJsNum: highestBidGhst.toNumber(),
            dateCreated: new Date(auction.createdAt * 1000),
            dateEnds: new Date(auction.endsAt * 1000),
            dateLastBid: new Date(auction.lastBidTime * 1000),
            contractAddress: REALM_CONTRACT_ADDRESS
          })
        }
        lastFetchDate.value = new Date()
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching the parcel GBM active listing')
    })
  }

  return {
    parcelListing,
    canSubmitFetch,
    fetchStatus,
    fetchListing,
    lastFetchDate
  }
}
