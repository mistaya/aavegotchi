<template>
  <section>
    <h2>Fetch auctions</h2>

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

    <h3>All Auctions Data</h3>

    <textarea
      :value="auctionsJson"
      style="width: 100%; min-height: 100px;"
    />

    Most recent auction fetched: {{ mostRecentAuction?.lastBidTime }}
  </section>
</template>

<script>
import { computed } from 'vue'
import useAuctions from '@/data/useAuctions'

export default {
  setup () {
    const {
      auctionsByParcelId,
      mostRecentAuction,
      canSubmitFetch,
      fetchStatus,
      fetchAuctions
    } = useAuctions()
    const auctionsJson = computed(() => JSON.stringify(auctionsByParcelId.value, null, 4))

    return {
      canSubmitFetch,
      fetchAuctions,
      fetchStatus,
      auctionsJson,
      mostRecentAuction
    }
  }
}
</script>

<style scoped>
</style>
