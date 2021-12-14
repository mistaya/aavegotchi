<template>
  <section style="margin: 15px; border: 1px solid #ccc; padding: 5px 10px">
    <h2>Parcel Owners</h2>

    <form @submit.prevent="fetchOwners">
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

    <h3>All Parcel Owners Data ({{ numParcels }} parcels)</h3>

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
