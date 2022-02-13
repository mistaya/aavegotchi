<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2>Gotchi GHST Balances</h2>

    <p>
      The GHST balance has to be queried directly from the GHST token contract, it's not available in the subgraph.
      So this needs to do a contract call for <i>every</i> gotchi.
      <br>To reduce rpc requests, these are batched using multicall - but this can result in errors during execution, so watch the console.
      It may help to fetch the latest gotchi list before fetching this.
    </p>

    <form @submit.prevent="fetchBalances">
      <div style="margin-top: 10px">
        <SiteButton
          type="submit"
          :disabled="!canSubmitFetch"
        >
          Fetch
        </SiteButton>
        <span v-if="fetchStatus.loading">
          loading...
        </span>
        <span v-if="fetchStatus.error">
          Error: {{ fetchStatus.errorMessage }}
        </span>
      </div>
    </form>

    <h3>All Gotchi GHST Data</h3>

    <p>
      {{ loadedBalancesDetails.numBalancesFetched }} balances fetched out of {{ loadedBalancesDetails.numGotchis }} gotchis
    </p>

    <div style="margin-bottom: 10px;">
      <SiteButton
        type="button"
        :aria-pressed="`${showJson}`"
        @click="showJson = !showJson"
      >
        {{ showJson ? 'Hide' : 'Show' }}
        JSON
      </SiteButton>
    </div>

    <textarea
      v-if="showJson"
      :value="balancesJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useGotchiGhst from '@/data/useGotchiGhst'

export default {
  setup (props) {
    const {
      balances,
      canSubmitFetch,
      fetchStatus,
      fetchBalances,
      loadedBalancesDetails
    } = useGotchiGhst()

    const numBalances = computed(() => Object.keys(balances.value).length)
    const showJson = ref(false)

    const balancesJson = computed(() => JSON.stringify(balances.value, null, 4))
    return {
      numBalances,
      canSubmitFetch,
      fetchBalances,
      fetchStatus,
      loadedBalancesDetails,
      showJson,
      balancesJson
    }
  }
}
</script>

<style scoped>
</style>
