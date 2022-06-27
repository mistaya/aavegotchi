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
      useGotchiBalances
    }
  }
}
</script>

<style scoped>
</style>
