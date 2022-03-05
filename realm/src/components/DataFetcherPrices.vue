<template>
  <DataFetcher
    subject="prices from coingecko &amp; quickswap"
    :use="useTokenPrices"
    fetchProperty="fetchPrices"
    resultProperty="usdPrices"
    hasMore
  >
    <template #loaded="{ lastFetchDate, showingMore, toggleMore }">
      prices fetched
      <DateFriendly :date="lastFetchDate" />
      <SiteButton
        type="button"
        style="margin-left: 10px; margin-right: 10px;"
        @click="toggleMore"
      >
        {{ showingMore ? 'Hide' : 'View' }}
      </SiteButton>
    </template>
    <template #more="{ result }">
      from coingecko, quickswap (for maTokens) &amp; the current vGHST token exchange rate
      <ul>
        <li
          v-for="[tokenId, usdPrice] in Object.entries(result)"
          :key="tokenId"
        >
          {{ tokens[tokenId]?.label || tokenId }}
          <NumberDisplay
            :number="usdPrice"
            usd
          />
        </li>
      </ul>
    </template>
  </DataFetcher>
</template>

<script>
import useTokenPrices from '@/data/useTokenPrices'
import DataFetcher from './DataFetcher.vue'
import DateFriendly from './DateFriendly.vue'
import NumberDisplay from './NumberDisplay.vue'

export default {
  components: {
    DataFetcher,
    DateFriendly,
    NumberDisplay
  },
  setup (props) {
    const { tokens } = useTokenPrices()

    return {
      useTokenPrices,
      tokens
    }
  }
}
</script>

<style scoped>
  .data-fetcher-prices {
  }
</style>
