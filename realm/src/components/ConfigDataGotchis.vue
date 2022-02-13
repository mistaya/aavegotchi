<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2>Gotchis</h2>

    <form @submit.prevent="fetchGotchis">
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

    <h3>All Gotchis Data ({{ numGotchis }} gotchis)</h3>

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
      :value="gotchisJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useGotchis from '@/data/useGotchis'

export default {
  setup (props) {
    const {
      gotchis,
      canSubmitFetch,
      fetchStatus,
      fetchGotchis
    } = useGotchis()
    const numGotchis = computed(() => gotchis.value.length)
    const showJson = ref(false)
    const gotchisJson = computed(() => JSON.stringify(gotchis.value, null, 4))
    return {
      numGotchis,
      canSubmitFetch,
      fetchGotchis,
      fetchStatus,
      showJson,
      gotchisJson
    }
  }
}
</script>

<style scoped>
</style>
