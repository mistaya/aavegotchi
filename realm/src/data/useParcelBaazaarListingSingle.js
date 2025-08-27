import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'

const { selectedNetwork } = useNetwork()

const useParcelBaazaarListingSingleForNetwork = function (network, id) {
  const SUBGRAPH_URL = apis[network].CORE_SUBGRAPH

  const parcelListing = ref(null)

  const resetListing = function () {
    parcelListing.value = null
    lastFetchDate.value = null
  }

  const setListing = function (listing) {
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
          erc721Listings(
            first: 1,
            orderBy: timeCreated,
            orderDirection:desc,
            where:{
              tokenId: "${id}",
              category: "4",
              cancelled: false,
              timePurchased: 0
            }) {
            id
            timeCreated
            priceInWei
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching the parcel baazaar listing')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.erc721Listings) {
        const listing = responseJson.data?.erc721Listings[0]
        resetListing()
        if (listing) {
          const priceInGhst = (new BigNumber(listing.priceInWei)).dividedBy(10e17)
          setListing({
            id: listing.id,
            network,
            priceInGhst,
            priceInGhstJsNum: priceInGhst.toNumber(),
            dateCreated: new Date(listing.timeCreated * 1000)
          })
        }
        lastFetchDate.value = new Date()
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching the parcel baazaar listing')
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

export default function useParcelBaazaarListingSingle (id) {
  // do not globally cache, as this is parameterised with parcel id
  const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelBaazaarListingSingleForNetwork(network, id) })

  // by default, use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const parcelListing = computed(() => resultToUse.value.parcelListing.value)
  const canSubmitFetch = computed(() => resultToUse.value.canSubmitFetch.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchListing = computed(() => resultToUse.value.fetchListing)
  const lastFetchDate = computed(() => resultToUse.value.lastFetchDate.value)

  return {
    parcelListing,
    canSubmitFetch,
    fetchStatus,
    fetchListing,
    lastFetchDate
  }
}
