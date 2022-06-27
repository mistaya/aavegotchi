<template>
  <DataFetcher
    subject="parcel installations"
    :use="useParcelContents"
    fetchProperty="fetchContents"
  />
</template>

<script>
import useParcelContents from '@/data/useParcelContents'
import DataFetcher from '@/common/DataFetcher.vue'

export default {
  components: {
    DataFetcher
  },
  setup (props) {
    return {
      useParcelContents
    }
  }
}
</script>

<style scoped>
</style>
