<template>
  <section style="margin: 15px; border: 1px solid #ccc; padding: 5px 10px">
    <h2>Gotchi AAVE Rewards</h2>

    <p>
      The unclaimed AAVE rewards balance has to be queried directly from the AAVE contract, it's not available in the subgraph.
      <br>So this needs to do a separate polygon-rpc call for EVERY polygon gotchi - be considerate calling this! And watch the console for errors.
    </p>

    <form @submit.prevent="fetchRewards">
      <div style="margin-top: 10px">
        <button
          type="submit"
          :disabled="!canSubmitFetch"
        >
          Fetch
        </button>
        <span v-if="fetchStatus.loading">
          loading...
        </span>
        <span v-if="fetchStatus.error">
          Error: {{ fetchStatus.errorMessage }}
        </span>
      </div>
    </form>

    <h3>All Gotchi Rewards Data</h3>

    <p>
      {{ loadedRewardsDetails.numRewardsFetched }} rewards fetched out of {{ loadedRewardsDetails.numPolygonGotchis }} polygon gotchis
    </p>

    <div style="margin-bottom: 10px;">
      <button
        type="button"
        :aria-pressed="`${showJson}`"
        @click="showJson = !showJson"
      >
        {{ showJson ? 'Hide' : 'Show' }}
        JSON
      </button>
    </div>

    <textarea
      v-if="showJson"
      :value="rewardsJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useGotchiAaveRewards from '@/data/useGotchiAaveRewards'

export default {
  setup (props) {
    const {
      rewards,
      canSubmitFetch,
      fetchStatus,
      fetchRewards,
      loadedRewardsDetails
    } = useGotchiAaveRewards()

    const numRewards = computed(() => Object.keys(rewards.value).length)
    const showJson = ref(false)

    const rewardsJson = computed(() => JSON.stringify(rewards.value, null, 4))
    return {
      numRewards,
      canSubmitFetch,
      fetchRewards,
      fetchStatus,
      loadedRewardsDetails,
      showJson,
      rewardsJson
    }
  }
}
</script>

<style scoped>
</style>
