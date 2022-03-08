<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2>Ethereum Gotchi Owners</h2>

    <form @submit.prevent="fetchOwners">
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

    <h3>All Ethereum-bridged Gotchi Owners Data</h3>

    <p>
      Owners of {{ numGotchis }} gotchis fetched
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
      :value="ownersJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useEthereumGotchiOwners from '@/data/useEthereumGotchiOwners'

export default {
  setup (props) {
    const {
      ownersByGotchi,
      canSubmitFetch,
      fetchStatus,
      fetchOwners
    } = useEthereumGotchiOwners()

    const numGotchis = computed(() => Object.keys(ownersByGotchi.value).length)
    const showJson = ref(false)

    const ownersJson = computed(() => JSON.stringify(ownersByGotchi.value, null, 4))
    return {
      numGotchis,
      canSubmitFetch,
      fetchOwners,
      fetchStatus,
      showJson,
      ownersJson
    }
  }
}
</script>

<style scoped>
</style>
