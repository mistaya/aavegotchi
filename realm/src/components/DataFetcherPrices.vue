<template>
  <DataFetcher
    subject="coingecko prices"
    :use="useCollateralPrices"
    fetchProperty="fetchPrices"
  />
</template>

<script>
import useCollateralPrices from '@/data/useCollateralPrices'
import DataFetcher from './DataFetcher.vue'

export default {
  components: {
    DataFetcher
  },
  setup (props) {
    return {
      useCollateralPrices
    }
  }
}
</script>

<style scoped>
</style>
