<template>
  <DataFetcher
    subject="gotchi GHST balances"
    :use="useGotchiGhst"
    fetchProperty="fetchBalances"
    resultProperty="loadedBalancesDetails"
  >
    <template #loaded="{ result, lastFetchDate }">
      <NumberDisplay :number="result.numBalancesFetched" />
      gotchi GHST balances fetched
      <DateFriendly :date="lastFetchDate" />
    </template>
  </DataFetcher>
</template>

<script>
import useGotchiGhst from '@/data/useGotchiGhst'
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
      useGotchiGhst
    }
  }
}
</script>

<style scoped>
</style>
