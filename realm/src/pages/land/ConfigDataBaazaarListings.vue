<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2>Baazaar Listings</h2>

    <form @submit.prevent="fetchListings">
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

    <h3>All Baazaar Listings Data ({{ numListings }} parcels currently listed, {{ numSales }} parcels with sold prices)</h3>

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

    <template v-if="showJson">
      Listings:
      <textarea
        :value="listingsJson"
        style="width: 100%; min-height: 100px;"
      />

      Sales:
      <textarea
        :value="salesJson"
        style="width: 100%; min-height: 100px;"
      />
    </template>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useBaazaarListings from '@/data/useBaazaarListings'

export default {
  setup (props) {
    const {
      listingsByParcelId,
      salesByParcelId,
      canSubmitFetch,
      fetchStatus,
      fetchListings
    } = useBaazaarListings()
    const numListings = computed(() => Object.keys(listingsByParcelId.value).length)
    const numSales = computed(() => Object.keys(salesByParcelId.value).length)
    const showJson = ref(false)
    const listingsJson = computed(() => JSON.stringify(listingsByParcelId.value, null, 4))
    const salesJson = computed(() => JSON.stringify(salesByParcelId.value, null, 4))
    return {
      numListings,
      numSales,
      canSubmitFetch,
      fetchListings,
      fetchStatus,
      showJson,
      listingsJson,
      salesJson
    }
  }
}
</script>

<style scoped>
</style>
