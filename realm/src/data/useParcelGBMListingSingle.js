import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import apis from '@/data/apis'
import addresses from '@/data/addresses'
import useNetwork from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'

const { selectedNetwork, NETWORKS } = useNetwork()

// Polygon no longer has live GBM auctions, only historical
// So we only need to fetch listings when on Base

const useParcelGBMListingSingleForBase = function (id) {
  const SUBGRAPH_URL = apis.base.GBM_AUCTIONS_SUBGRAPH
  const PARCELS_CONTRACT_ADDRESS = addresses.base.REALM_PARCELS

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
              contractAddress: "${PARCELS_CONTRACT_ADDRESS}"
              endsAt_gt: "${Math.ceil(Date.now() / 1000)}"
              cancelled: false
            }) {
            id
            tokenId
            seller
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
            network: NETWORKS.base,
            seller: auction.seller,
            highestBidGhst,
            highestBidGhstJsNum: highestBidGhst.toNumber(),
            dateCreated: new Date(auction.createdAt * 1000),
            dateEnds: new Date(auction.endsAt * 1000),
            dateLastBid: new Date(auction.lastBidTime * 1000),
            contractAddress: PARCELS_CONTRACT_ADDRESS
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

export default function useParcelGBMListingSingle (id) {
  // do not globally cache, as this is parameterised with parcel id
  const itemForBase = useParcelGBMListingSingleForBase(id)

  // use the currently selected network, which can change over time
  const parcelListing = computed(() => {
    if (selectedNetwork.value === NETWORKS.polygon) {
      return null
    }
    return itemForBase.parcelListing.value
  })
  const fetchStatus = computed(() => {
    if (selectedNetwork.value === NETWORKS.polygon) {
      return {
        error: false,
        loaded: true
      }
    }
    return {
      error: itemForBase.fetchStatus.value.error,
      loaded: itemForBase.fetchStatus.value.loaded
    }
  })
  const fetchListing = computed(() => {
    if (selectedNetwork.value === NETWORKS.polygon) {
      return () => {}
    }
    return itemForBase.fetchListing
  })

  return {
    parcelListing,
    fetchStatus,
    fetchListing
  }
}
