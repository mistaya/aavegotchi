<template>
  <DataFetcher
    subject="vault gotchi owners"
    :use="useVaultOwners"
    fetchProperty="fetchOwners"
    resultProperty="ownersByGotchi"
  >
    <template #loaded="{ result, lastFetchDate }">
      <NumberDisplay :number="getNumGotchis(result)" />
      vault gotchis' owners fetched
      <DateFriendly :date="lastFetchDate" />
    </template>
  </DataFetcher>
</template>

<script>
import useVaultOwners from '@/data/useVaultOwners'
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
      useVaultOwners,
      getNumGotchis
    }
  }
}
</script>

<style scoped>
</style>
