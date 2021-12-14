<template>
  <section style="margin: 15px; border: 1px solid #ccc; padding: 5px 10px">
    <h2>Parcel Prices</h2>
    <p>
      Prices for {{ numParcels }} parcels are derived from
      the cached auction records (1: {{ numAuction1 }}, 2: {{ numAuction2 }}),
      combined with the latest completed baazaar listings.
    </p>
    <p>These final auction prices are separately stored as JSON for quick reference as initial cached data.</p>
    <div style="margin-bottom: 10px;">
      <button
        type="button"
        :aria-pressed="`${showJson}`"
        @click="showJson = !showJson"
      >
        {{ showJson ? 'Hide' : 'Show' }}
        JSON
      </button>
    </div>

    <textarea
      v-if="showJson"
      :value="pricesJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useParcels from '@/data/useParcels'
import useAuctions from '@/data/useAuctions'

export default {
  setup () {
    const { parcelsById } = useParcels()
    const { auctionsByParcelId: auctions1ByParcelId } = useAuctions(1)
    const { auctionsByParcelId: auctions2ByParcelId } = useAuctions(2)

    const showJson = ref(false)
    const pricesJson = computed(() => {
      const pricesByParcel = Object.fromEntries(
        Object.keys(parcelsById.value).map(parcelId => {
          const lastPrice = auctions2ByParcelId.value[parcelId]?.highestBidGhst ||
            auctions1ByParcelId.value[parcelId]?.highestBidGhst ||
            null
          return [parcelId, lastPrice]
        })
      )
      return JSON.stringify(pricesByParcel, null, 4)
    })

    const numParcels = computed(() => Object.keys(parcelsById.value).length)
    const numAuction1 = computed(() => Object.keys(auctions1ByParcelId.value).length)
    const numAuction2 = computed(() => Object.keys(auctions2ByParcelId.value).length)

    return {
      numParcels,
      numAuction1,
      numAuction2,
      showJson,
      pricesJson
    }
  }
}
</script>

<style scoped>
</style>
