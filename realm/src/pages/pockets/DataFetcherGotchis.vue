<template>
  <DataFetcher
    subject="gotchis and their collateral"
    :use="useGotchis"
    fetchProperty="fetchGotchis"
    resultProperty="gotchis"
  >
    <template #loaded="{ result, lastFetchDate }">
      <NumberDisplay :number="result.length" />
      gotchis and their collateral fetched
      <DateFriendly :date="lastFetchDate" />
    </template>
  </DataFetcher>
</template>

<script>
import useGotchis from '@/data/useGotchis'
import DateFriendly from '@/common/DateFriendly.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import DataFetcher from '@/common/DataFetcher.vue'

export default {
  components: {
    DataFetcher,
    DateFriendly,
    NumberDisplay
  },
  setup (props) {
    return {
      useGotchis
    }
  }
}
</script>

<style scoped>
</style>
