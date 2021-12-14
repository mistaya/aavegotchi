import { computed } from 'vue'
import useStatus from '@/data/useStatus'
import useParcels from './useParcels'
import useBaazaarListings from './useBaazaarListings'

const { parcelsById, fetchStatus: fetchParcelsStatus } = useParcels()
const { salesByParcelId } = useBaazaarListings()

const { status: fetchAuctionPricesStatus, setLoading } = useStatus()
let auctionPricesById = {} // doesn't need to be reactive
const [isStale, setLoaded, setError] = setLoading()
import(
  /* webpackChunkName: "auctionpricesjson" */
  './auctions/parcelAuctionPrices.json'
).then(({ default: json }) => {
  if (isStale()) { return }
  auctionPricesById = json
  setLoaded()
}).catch(error => {
  console.error(error)
  setError('Error loading auction prices')
})

const pricesByParcelId = computed(() => {
  const prices = {}
  if (!fetchParcelsStatus.value.loaded || !fetchAuctionPricesStatus.value.loaded) {
    return prices
  }
  for (const parcelId in parcelsById.value) {
    const lastPrice = salesByParcelId.value[parcelId]?.priceInGhst.toString() ||
      auctionPricesById[parcelId] ||
      null
    prices[parcelId] = {
      lastPrice: lastPrice ? lastPrice - 0 : null,
      auctionPrice: auctionPricesById[parcelId]
    }
  }
  return prices
})

export default function useParcelPrices () {
  return {
    pricesByParcelId
  }
}
