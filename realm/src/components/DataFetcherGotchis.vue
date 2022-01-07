<template>
  <div>
    <div
      v-if="fetchStatus.loaded"
      style="margin-bottom: 5px; font-style: italic; font-size: 0.95em;"
    >
      <NumberDisplay :number="gotchis.length" />
      Gotchis and their collateral fetched
      <DateFriendly :date="lastFetchDate" />
    </div>

    <div>
      <button
        type="button"
        :disabled="!canSubmitFetch"
        @click="fetchGotchis"
      >
        Re-fetch latest Gotchi Data
      </button>
      <div style="margin-top: 5px;">
        <span v-if="fetchStatus.loading">
          <LoadingSpinner style="position: relative; top: 2px; margin-right: 2px;" />
          loading gotchis and their current collateral...
        </span>
        <span v-if="fetchStatus.error">
          Error loading gotchis: {{ fetchStatus.errorMessage }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import useGotchis from '@/data/useGotchis'
import DateFriendly from './DateFriendly'
import NumberDisplay from './NumberDisplay'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  components: {
    DateFriendly,
    NumberDisplay,
    LoadingSpinner
  },
  setup (props) {
    const {
      gotchis,
      canSubmitFetch,
      fetchStatus,
      fetchGotchis,
      lastFetchDate
    } = useGotchis()

    return {
      gotchis,
      canSubmitFetch,
      fetchStatus,
      fetchGotchis,
      lastFetchDate
    }
  }
}
</script>

<style scoped>
</style>
