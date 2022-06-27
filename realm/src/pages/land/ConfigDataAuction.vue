<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2>Auction #{{ auctionId }}</h2>

    <form @submit.prevent="fetchAuctions">
      <div style="margin-top: 10px">
        <SiteButton
          type="submit"
          :disabled="!canSubmitFetch"
        >
          Fetch
        </SiteButton>
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
      <SiteButton
        type="button"
        :aria-pressed="`${showAuctionsJson}`"
        @click="showAuctionsJson = !showAuctionsJson"
      >
        {{ showAuctionsJson ? 'Hide' : 'Show' }}
        JSON
      </SiteButton>
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
