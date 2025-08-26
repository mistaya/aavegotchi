import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import apis from '@/data/apis'
import addresses from '@/data/addresses'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'

const { selectedNetwork, NETWORKS } = useNetwork()

const useParcelGBMLastSaleSingleForNetwork = function (network, id) {
  const SUBGRAPH_URL = network === NETWORKS.polygon ? apis.GBM_AUCTIONS_SUBGRAPH : apis.GBM_AUCTIONS_BASE_SUBGRAPH
  const REALM_CONTRACT_ADDRESS = network === NETWORKS.polygon ? addresses.POLYGON.REALM_PARCELS : addresses.BASE.REALM_PARCELS

  const parcelLastSale = ref(null)

  const resetLastSale = function () {
    parcelLastSale.value = null
    lastFetchDate.value = null
  }

  const setLastSale = function (listing) {
    parcelLastSale.value = listing
  }

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const fetchLastSale = function () {
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
              endsAt_lt: "${Math.ceil(Date.now() / 1000)}"
              cancelled: false
              totalBids_gt: "0"
            }) {
            id
            tokenId
            highestBid
            endsAt
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching the parcel GBM last sale')
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
            network,
            highestBidGhst,
            highestBidGhstJsNum: highestBidGhst.toNumber(),
            datePurchased: new Date(auction.endsAt * 1000),
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
      setError('There was an error fetching the parcel GBM last sale')
    })
  }

  return {
    parcelLastSale,
    canSubmitFetch,
    fetchStatus,
    fetchLastSale,
    lastFetchDate
  }
}

export default function useParcelGBMLastSaleSingle (id) {
  // do not globally cache, as this is parameterised with parcel id
  const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelGBMLastSaleSingleForNetwork(network, id) })

  // If current network is polygon, just return that.
  // if current network is base, fetch BOTH base and polygon;
  //  when both have been fetched, if there is a base sale return that result, otherwise polygon's.
  // Expose the network of the last sale that is returned.

  const polygonItem = getItemForNetwork(NETWORKS.polygon)
  const baseItem = getItemForNetwork(NETWORKS.base)

  // use the currently selected network, which can change over time

  const fetchStatus = computed(() => {
    if (selectedNetwork.value === NETWORKS.polygon) {
      return {
        error: polygonItem.fetchStatus.value.error,
        loaded: polygonItem.fetchStatus.value.loaded
      }
    }
    return {
      error: baseItem.fetchStatus.value.error || polygonItem.fetchStatus.value.error,
      loaded: baseItem.fetchStatus.value.loaded && polygonItem.fetchStatus.value.loaded
    }
  })

  const parcelLastSale = computed(() => {
    if (!fetchStatus.value.loaded) {
      return null
    }
    if (selectedNetwork.value === NETWORKS.polygon) {
      return polygonItem.parcelLastSale.value
    }
    return baseItem.parcelLastSale.value || polygonItem.parcelLastSale.value || null
  })

  const fetchLastSale = function () {
    if (selectedNetwork.value === NETWORKS.polygon) {
      polygonItem.fetchLastSale()
      return
    }
    baseItem.fetchLastSale()
    polygonItem.fetchLastSale()
  }

  return {
    parcelLastSale,
    fetchStatus,
    fetchLastSale
  }
}
