<template>
  <div>
    <h2>
      Lending Manager
      <template v-if="address">
        for
        <EthAddress
          :address="address"
          icon
        />
      </template>
      <template v-else-if="thirdPartyAddress">
        for Third-Party
        <EthAddress
          :address="thirdPartyAddress"
          icon
        />
      </template>
    </h2>
    <template v-if="address || thirdPartyAddress">
      <div v-if="!hasValidAddress">
        Invalid address
      </div>
      <div>(<a :href="urlNoAddress" @click.prevent="clearAddress">Use another address</a>)
      </div>
    </template>
    <template v-else>
      <form
        style="display: flex; flex-wrap: wrap; column-gap: 10px;"
        @submit.prevent="enterAddress"
      >
        <label>
          Address that owns gotchis:
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

      <div style="margin: 15px 0 15px 40px">
        -- OR --
      </div>

      <form
        style="display: flex; flex-wrap: wrap; column-gap: 10px;"
        @submit.prevent="enterThirdPartyAddress"
      >
        <label>
          Third-Party receiving share:
          <input
            v-model="inputThirdPartyAddress"
            type="text"
          />
        </label>
        <SiteButton
          type="submit"
          :disabled="!inputThirdPartyAddress"
        >
          Use this address
        </SiteButton>
      </form>
    </template>
    <div
      v-if="hasValidAddress"
      style="margin-top: 20px;"
    >
      <div style="margin-bottom: 20px;">
        <a
          :href="`https://app.aavegotchi.com/aavegotchis/${encodeURIComponent(address)}`"
          rel="noopener"
          target="_blank"
        >
          View on aavegotchi.com
          <SiteIcon name="open-window" />
        </a>
      </div>
      <LendingManagerGotchis
        :key="address"
        :address="address"
        :thirdPartyAddress="thirdPartyAddress"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import EthAddress from './EthAddress.vue'
import LendingManagerGotchis from './LendingManagerGotchis.vue'

export default {
  components: {
    EthAddress,
    LendingManagerGotchis
  },
  props: {
    address: { type: String, default: null },
    thirdPartyAddress: { type: String, default: null }
  },
  setup (props) {
    const router = useRouter()
    const urlNoAddress = router.resolve({ name: 'lending-manager' }).href

    const inputAddress = ref('')
    const inputThirdPartyAddress = ref('')

    const validAddress = computed(() => props.address?.length === 42)
    const validThirdPartyAddress = computed(() => props.thirdPartyAddress?.length === 42)

    const hasValidAddress = computed(() => validAddress.value || validThirdPartyAddress.value)

    const clearAddress = () => {
      router.push({
        name: 'lending-manager'
      })
    }

    const enterAddress = () => {
      router.push({
        name: 'lending-manager',
        query: {
          address: inputAddress.value
        }
      })
    }

    const enterThirdPartyAddress = () => {
      router.push({
        name: 'lending-manager',
        query: {
          thirdPartyAddress: inputThirdPartyAddress.value
        }
      })
    }

    return {
      urlNoAddress,
      clearAddress,
      inputAddress,
      inputThirdPartyAddress,
      enterAddress,
      enterThirdPartyAddress,
      hasValidAddress
    }
  }
}
</script>

<style scoped>
</style>
