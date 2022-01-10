<template>
  <section style="margin: 15px; border: 1px solid #ccc; padding: 5px 10px">
    <h2>Wearables</h2>

    <form @submit.prevent="fetchWearables">
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

    <h3>All Wearables ({{ numWearables }})</h3>

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
      :value="wearablesJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useFetchWearables from '@/data/useFetchWearables'

export default {
  setup (props) {
    const {
      wearables,
      canSubmitFetch,
      fetchStatus,
      fetchWearables
    } = useFetchWearables()
    const numWearables = computed(() => wearables.value.length)
    const showJson = ref(false)
    const wearablesJson = computed(() => JSON.stringify(wearables.value, null, 4))
    return {
      numWearables,
      canSubmitFetch,
      fetchWearables,
      fetchStatus,
      showJson,
      wearablesJson
    }
  }
}
</script>

<style scoped>
</style>
