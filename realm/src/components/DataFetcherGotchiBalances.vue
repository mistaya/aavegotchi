<template>
  <DataFetcher
    subject="gotchi balances"
    :use="useGotchiBalances"
    fetchProperty="fetchBalances"
    resultProperty="loadedBalancesDetails"
  >
    <template #loaded="{ result, lastFetchDate }">
      <NumberDisplay :number="result.numBalancesFetched" />
      gotchi balances fetched
      <DateFriendly :date="lastFetchDate" />
    </template>
  </DataFetcher>
</template>

<script>
import useGotchiBalances from '@/data/useGotchiBalances'
import DateFriendly from './DateFriendly'
import NumberDisplay from './NumberDisplay'
import DataFetcher from './DataFetcher.vue'

export default {
  components: {
    DataFetcher,
    DateFriendly,
    NumberDisplay
  },
  setup (props) {
    return {
      useGotchiBalances
    }
  }
}
</script>

<style scoped>
</style>
