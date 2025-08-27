<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2>Parcel Contents</h2>

    <form @submit.prevent="forceFetchContents">
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

    <div style="margin-top: 10px;">
      Polygon parcels are frozen so can be cached.
    </div>

    <h3>All Parcel Contents Data ({{ numParcels }} parcels)</h3>

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
      :value="contentsJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useParcelContents from '@/data/useParcelContents'

export default {
  setup (props) {
    const {
      installationsByParcelId,
      tilesByParcelId,
      canSubmitFetch,
      fetchStatus,
      forceFetchContents
    } = useParcelContents()
    const numParcels = computed(() => Object.keys(installationsByParcelId.value).length)
    const showJson = ref(false)
    const contentsJson = computed(() => JSON.stringify({
      installations: installationsByParcelId.value,
      tiles: tilesByParcelId.value
    }, null, 4))
    return {
      numParcels,
      canSubmitFetch,
      forceFetchContents,
      fetchStatus,
      showJson,
      contentsJson
    }
  }
}
</script>

<style scoped>
</style>
