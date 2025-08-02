<template>
  <div>
    <div style="margin-bottom: 10px;">
      <h2 style="display: inline; margin-right: 15px;">
        Borrower
        <EthAddress
          v-if="address"
          :address="address"
          icon
        />
      </h2>
      <template v-if="address">
        (<a
          :href="urlNoAddress"
          @click.prevent="clearAddress"
        >Use another address</a>)
      </template>
    </div>
    <template v-if="address">
      <div v-if="!hasValidAddress">
        Invalid address
      </div>
      <div>
        <a
          v-if="hasValidAddress"
          :href="isPolygonNetwork ? `https://polygon.aavegotchi.com/u/${encodeURIComponent(address)}/inventory?itemType=aavegotchis` : `https://dapp.aavegotchi.com/u/${encodeURIComponent(address)}/inventory?itemType=aavegotchis`"
          rel="noopener"
          target="_blank"
        >
          View on aavegotchi.com
          <SiteIcon name="open-window" />
        </a>
      </div>
    </template>
    <template v-else>
      <form
        style="display: flex; flex-wrap: wrap; column-gap: 10px;"
        @submit.prevent="enterAddress"
      >
        <label>
          Address borrowing gotchis:
          <input
            v-model="inputAddress"
            type="text"
          />
        </label>
        <SiteButton
          type="submit"
          :disabled="!inputAddress"
        >
          Use this address
        </SiteButton>
      </form>
    </template>
    <div
      v-if="hasValidAddress"
      style="margin-top: 20px;"
    >
      <LendingBorrowerGotchis
        :key="address"
        :address="address"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useNetwork from '@/environment/useNetwork'
import EthAddress from '@/common/EthAddress.vue'
import LendingBorrowerGotchis from './LendingBorrowerGotchis.vue'

export default {
  components: {
    EthAddress,
    LendingBorrowerGotchis
  },
  props: {
    address: { type: String, default: null }
  },
  setup (props) {
    const { isPolygonNetwork } = useNetwork()

    const router = useRouter()
    const urlNoAddress = router.resolve({ name: 'lending-borrower' }).href

    const inputAddress = ref('')

    const hasValidAddress = computed(() => props.address?.length === 42)

    const clearAddress = () => {
      router.push({
        name: 'lending-borrower'
      })
    }

    const enterAddress = () => {
      router.push({
        name: 'lending-borrower',
        query: {
          address: inputAddress.value
        }
      })
    }

    return {
      isPolygonNetwork,
      urlNoAddress,
      clearAddress,
      inputAddress,
      enterAddress,
      hasValidAddress
    }
  }
}
</script>

<style scoped>
</style>
