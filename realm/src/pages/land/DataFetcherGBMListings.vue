<template>
  <DataFetcher
    subject="GBM auctions"
    :use="useParcelGBMListings"
    fetchProperty="fetchListings"
  />
</template>

<script>
import useParcelGBMListings from '@/data/useParcelGBMListings'
import DataFetcher from '@/common/DataFetcher.vue'

export default {
  components: {
    DataFetcher
  },
  setup (props) {
    return {
      useParcelGBMListings
    }
  }
}
</script>

<style scoped>
</style>
