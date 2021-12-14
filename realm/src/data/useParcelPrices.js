import { computed } from 'vue'
import auctionPricesById from './auctions/parcelAuctionPrices.json'
import useParcels from './useParcels'
import useBaazaarListings from './useBaazaarListings'

const { parcelsById } = useParcels()
const { salesByParcelId } = useBaazaarListings()

const pricesByParcelId = computed(() => {
  const prices = {}
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
