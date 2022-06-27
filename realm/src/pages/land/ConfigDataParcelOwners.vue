<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2>Parcel Owners</h2>

    <form @submit.prevent="fetchOwners">
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

    <h3>All Parcel Owners Data ({{ numParcels }} parcels)</h3>

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
      :value="ownersJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useParcelOwners from '@/data/useParcelOwners'

export default {
  setup (props) {
    const {
      ownersByParcelId,
      canSubmitFetch,
      fetchStatus,
      fetchOwners
    } = useParcelOwners()
    const numParcels = computed(() => Object.keys(ownersByParcelId.value).length)
    const showJson = ref(false)
    const ownersJson = computed(() => JSON.stringify(ownersByParcelId.value, null, 4))
    return {
      numParcels,
      canSubmitFetch,
      fetchOwners,
      fetchStatus,
      showJson,
      ownersJson
    }
  }
}
</script>

<style scoped>
</style>
