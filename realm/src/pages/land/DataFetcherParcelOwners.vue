<template>
  <DataFetcher
    subject="parcel owners"
    :use="useParcelOwners"
    fetchProperty="fetchOwners"
  />
</template>

<script>
import useParcelOwners from '@/data/useParcelOwners'
import DataFetcher from '@/common/DataFetcher.vue'

export default {
  components: {
    DataFetcher
  },
  setup (props) {
    return {
      useParcelOwners
    }
  }
}
</script>

<style scoped>
</style>
