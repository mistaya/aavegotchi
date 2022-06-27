<template>
  <DataFetcher
    subject="gotchi AAVE rewards"
    :use="useGotchiAaveRewards"
    fetchProperty="fetchRewards"
    resultProperty="loadedRewardsDetails"
  >
    <template #loaded="{ result, lastFetchDate }">
      <NumberDisplay :number="result.numRewardsFetched" />
      gotchi AAVE rewards fetched
      <DateFriendly :date="lastFetchDate" />
      <template v-if="result.numRewardsFetched < result.numPolygonGotchis">
        (but expected <NumberDisplay :number="result.numPolygonGotchis" />?)
      </template>
    </template>
  </DataFetcher>
</template>

<script>
import useGotchiAaveRewards from '@/data/useGotchiAaveRewards'
import DateFriendly from '@/common/DateFriendly.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import DataFetcher from './DataFetcher.vue'

export default {
  components: {
    DataFetcher,
    DateFriendly,
    NumberDisplay
  },
  setup (props) {
    return {
      useGotchiAaveRewards
    }
  }
}
</script>

<style scoped>
</style>
