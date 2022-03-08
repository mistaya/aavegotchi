<template>
  <DataFetcher
    subject="ethereum gotchi owners"
    :use="useEthereumGotchiOwners"
    fetchProperty="fetchOwners"
    resultProperty="ownersByGotchi"
  >
    <template #loaded="{ result, lastFetchDate }">
      <NumberDisplay :number="getNumGotchis(result)" />
      ethereum gotchis' owners fetched
      <DateFriendly :date="lastFetchDate" />
    </template>
  </DataFetcher>
</template>

<script>
import useEthereumGotchiOwners from '@/data/useEthereumGotchiOwners'
import DateFriendly from './DateFriendly'
import NumberDisplay from './NumberDisplay'
import DataFetcher from './DataFetcher'

export default {
  components: {
    DateFriendly,
    NumberDisplay,
    DataFetcher
  },
  setup (props) {
    const getNumGotchis = function (ownersByGotchi) {
      return Object.keys(ownersByGotchi).length
    }
    return {
      useEthereumGotchiOwners,
      getNumGotchis
    }
  }
}
</script>

<style scoped>
</style>
