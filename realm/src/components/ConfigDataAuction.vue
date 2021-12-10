<template>
  <section style="margin: 15px; border: 1px solid #ccc; padding: 5px 10px">
    <h2>Auction #{{ auctionId }}</h2>

    <form @submit.prevent="fetchAuctions">
      <div style="margin-top: 10px">
        <button
          type="submit"
          :disabled="!canSubmitFetch"
        >
          Fetch
        </button>
        <span v-if="fetchStatus.loading">
          loading...
        </span>
        <span v-if="fetchStatus.error">
          Error: {{ fetchStatus.errorMessage }}
        </span>
      </div>
    </form>

    <h3>All Auctions Data ({{ numAuctions }} parcels)</h3>

    <div style="margin-bottom: 10px;">
      <button
        type="button"
        :aria-pressed="`${showAuctionsJson}`"
        @click="showAuctionsJson = !showAuctionsJson"
      >
        {{ showAuctionsJson ? 'Hide' : 'Show' }}
        JSON
      </button>
    </div>

    <textarea
      v-if="showAuctionsJson"
      :value="auctionsJson"
      style="width: 100%; min-height: 100px;"
    />

    Most recent auction fetched:
    <template v-if="mostRecentAuction">
      {{ mostRecentAuction.lastBidTime }} / {{ new Date(mostRecentAuction.lastBidTime * 1000) }}
    </template>
    <template v-else>
      none
    </template>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useAuctions from '@/data/useAuctions'

export default {
  props: {
    auctionId: { type: Number, default: 1 }
  },
  setup (props) {
    const {
      auctionsByParcelId,
      mostRecentAuction,
      canSubmitFetch,
      fetchStatus,
      fetchAuctions
    } = useAuctions(props.auctionId)
    const numAuctions = computed(() => Object.keys(auctionsByParcelId.value).length)
    const showAuctionsJson = ref(false)
    const auctionsJson = computed(() => JSON.stringify(auctionsByParcelId.value, null, 4))
    return {
      numAuctions,
      canSubmitFetch,
      fetchAuctions,
      fetchStatus,
      showAuctionsJson,
      auctionsJson,
      mostRecentAuction
    }
  }
}
</script>

<style scoped>
</style>
