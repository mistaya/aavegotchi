<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2>Wearable Sets</h2>

    <form @submit.prevent="fetchWearableSets">
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

    <h3>All Wearable Sets ({{ numWearableSets }})</h3>

    <div style="margin-bottom: 10px;">
      <SiteButton
        type="button"
        :aria-pressed="`${showJson}`"
        @click="showJson = !showJson"
      >
        {{ showJson ? 'Hide' : 'Show' }}
        JSON
      </SiteButton>
    </div>

    <textarea
      v-if="showJson"
      :value="wearableSetsJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useFetchWearableSets from '@/data/useFetchWearableSets'

export default {
  setup (props) {
    const {
      wearableSets,
      canSubmitFetch,
      fetchStatus,
      fetchWearableSets
    } = useFetchWearableSets()
    const numWearableSets = computed(() => wearableSets.value.length)
    const showJson = ref(false)
    const wearableSetsJson = computed(() => JSON.stringify(wearableSets.value, null, 4))
    return {
      numWearableSets,
      canSubmitFetch,
      fetchWearableSets,
      fetchStatus,
      showJson,
      wearableSetsJson
    }
  }
}
</script>

<style scoped>
</style>
