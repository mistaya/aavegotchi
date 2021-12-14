<template>
  <div>
    <div
      v-if="fetchStatus.loaded"
      style="margin-bottom: 10px; font-style: italic; font-size: 0.95em;"
    >
      Baazaar listings fetched at {{ lastFetchDate }}
    </div>

    <div>
      <button
        type="button"
        :disabled="!canSubmitFetch"
        @click="fetchListings"
      >
        Get Latest Baazaar Listings
      </button>
      <div style="margin-top: 5px;">
        <span v-if="fetchStatus.loading">
          <LoadingSpinner style="position: relative; top: 2px; margin-right: 2px;" />
          loading listings...
        </span>
        <span v-if="fetchStatus.error">
          Error loading listings: {{ fetchStatus.errorMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import useBaazaarListings from '@/data/useBaazaarListings'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  components: {
    LoadingSpinner
  },
  setup (props) {
    const {
      canSubmitFetch,
      fetchStatus,
      fetchListings,
      lastFetchDate
    } = useBaazaarListings()

    return {
      canSubmitFetch,
      fetchStatus,
      fetchListings,
      lastFetchDate
    }
  }
}
</script>

<style scoped>
</style>
