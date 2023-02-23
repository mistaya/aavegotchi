import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'

const SUBGRAPH_URL = apis.CORE_MATIC_SUBGRAPH

export default function useParcelBaazaarListingSingle (id) {
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
