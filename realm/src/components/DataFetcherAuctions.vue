<template>
  <DataFetcher
    subject="auctions"
    :use="useAuctions"
    fetchProperty="fetchAuctions"
    resultProperty="mostRecentAuction"
    :disableFetch="auctionEnded"
  >
    <template #loaded="{ result, lastFetchDate }">
      <template v-if="result">
        Last auction fetched: parcel #{{ result.tokenId }},
      </template>
      <template v-else>
        Last auction data fetched
      </template>
      <DatePrecise
        v-if="auctionEnded"
        :date="lastFetchDate"
      />
      <DateFriendly
        v-else
        :date="lastFetchDate"
      />
    </template>
  </DataFetcher>
</template>

<script>
import useAuctions from '@/data/useAuctions'
import DateFriendly from '@/common/DateFriendly.vue'
import DatePrecise from '@/common/DatePrecise.vue'
import DataFetcher from './DataFetcher.vue'

export default {
  components: {
    DataFetcher,
    DateFriendly,
    DatePrecise
  },
  props: {
    auctionId: { type: String, required: true }
  },
  setup (props) {
    const { auctionEnded } = useAuctions(props.auctionId)
    return {
      auctionEnded,
      useAuctions: () => useAuctions(props.auctionId)
    }
  }
}
</script>

<style scoped>
</style>
