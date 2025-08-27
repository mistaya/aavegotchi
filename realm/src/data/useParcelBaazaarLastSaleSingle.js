import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'

const { selectedNetwork, NETWORKS } = useNetwork()

const useParcelBaazaarLastSaleSingleForNetwork = function (network, id) {
  const SUBGRAPH_URL = apis[network].CORE_SUBGRAPH

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
          erc721Listings(
            first: 1,
            orderBy: timePurchased,
            orderDirection:desc,
            where:{
              tokenId: "${id}",
              category: "4",
              cancelled: false,
              timePurchased_not: "0"
            }) {
            id
            timePurchased
            priceInWei
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching the parcel baazaar last sale')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.erc721Listings) {
        const listing = responseJson.data?.erc721Listings[0]
        resetLastSale()
        if (listing) {
          const priceInGhst = (new BigNumber(listing.priceInWei)).dividedBy(10e17)
          setLastSale({
            id: listing.id,
            network,
            priceInGhst,
            priceInGhstJsNum: priceInGhst.toNumber(),
            datePurchased: new Date(listing.timePurchased * 1000)
          })
        }
        lastFetchDate.value = new Date()
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching the parcel baazaar last sale')
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

export default function useParcelBaazaarLastSaleSingle (id) {
  // do not globally cache, as this is parameterised with parcel id
  const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelBaazaarLastSaleSingleForNetwork(network, id) })

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
