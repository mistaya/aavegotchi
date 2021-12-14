<template>
  <div>
    <div
      v-if="fetchStatus.loaded"
      style="margin-bottom: 10px; font-style: italic; font-size: 0.95em;"
    >
      Parcel owners fetched at {{ lastFetchDate }}
    </div>

    <div>
      <button
        type="button"
        :disabled="!canSubmitFetch"
        @click="fetchOwners"
      >
        Get Latest Parcel Owners
      </button>
      <div style="margin-top: 5px;">
        <span v-if="fetchStatus.loading">
          <LoadingSpinner style="position: relative; top: 2px; margin-right: 2px;" />
          loading owners...
        </span>
        <span v-if="fetchStatus.error">
          Error loading owners: {{ fetchStatus.errorMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import useParcelOwners from '@/data/useParcelOwners'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  components: {
    LoadingSpinner
  },
  setup (props) {
    const {
      canSubmitFetch,
      fetchStatus,
      fetchOwners,
      lastFetchDate
    } = useParcelOwners()

    return {
      canSubmitFetch,
      fetchStatus,
      fetchOwners,
      lastFetchDate
    }
  }
}
</script>

<style scoped>
</style>
