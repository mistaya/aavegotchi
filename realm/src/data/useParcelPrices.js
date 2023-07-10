import { computed } from 'vue'
import useStatus from '@/data/useStatus'
import useParcels from './useParcels'
import useBaazaarListings from './useBaazaarListings'
import useParcelGBMListings from './useParcelGBMListings'

const { parcelsById, fetchStatus: fetchParcelsStatus } = useParcels()
const { salesByParcelId } = useBaazaarListings()
const { salesByParcelId: gbmSalesByParcelId } = useParcelGBMListings()

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
    let lastPrice = auctionPricesById[parcelId] || null
    const lastBaazaarSale = salesByParcelId.value[parcelId]
    const lastGBMSale = gbmSalesByParcelId.value[parcelId]
    if (lastBaazaarSale && lastGBMSale) {
      if (lastBaazaarSale.datePurchased > lastGBMSale.datePurchased) {
        lastPrice = lastBaazaarSale.priceInGhst.toString()
      } else {
        lastPrice = lastGBMSale.highestBidGhst.toString()
      }
    } else if (lastBaazaarSale) {
      lastPrice = lastBaazaarSale.priceInGhst.toString()
    } else if (lastGBMSale) {
      lastPrice = lastGBMSale.highestBidGhst.toString()
    }

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
