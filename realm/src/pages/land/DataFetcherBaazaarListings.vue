<template>
  <DataFetcher
    subject="baazaar listings"
    :use="useBaazaarListings"
    fetchProperty="fetchListings"
  />
</template>

<script>
import useBaazaarListings from '@/data/useBaazaarListings'
import DataFetcher from '@/common/DataFetcher.vue'

export default {
  components: {
    DataFetcher
  },
  setup (props) {
    return {
      useBaazaarListings
    }
  }
}
</script>

<style scoped>
</style>
