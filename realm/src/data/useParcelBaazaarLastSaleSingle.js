import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'

const SUBGRAPH_URL = apis.CORE_MATIC_SUBGRAPH

export default function useParcelBaazaarLastSaleSingle (id) {
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
