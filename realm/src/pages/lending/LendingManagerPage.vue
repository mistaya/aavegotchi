<template>
  <div>
    <div style="margin-bottom: 10px;">
      <h2 style="display: inline; margin-right: 15px;">
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
        <template v-else-if="originalOwnerAddress">
          for "Original Owner"
          <EthAddress
            :address="originalOwnerAddress"
            icon
          />
        </template>
      </h2>
      <template v-if="address">
        (<a
            :href="urlNoAddress"
            @click.prevent="clearAddress"
          >Use another address</a>)
      </template>
    </div>
    <template v-if="address || thirdPartyAddress || originalOwnerAddress">
      <div v-if="!hasValidAddress">
        Invalid address
      </div>
      <div
        v-else
        style="line-height: 2em;"
      >
        <a
          :href="isPolygonNetwork ? `https://polygon.aavegotchi.com/u/${encodeURIComponent(address)}/inventory?itemType=aavegotchis` : `https://dapp.aavegotchi.com/u/${encodeURIComponent(address)}/inventory?itemType=aavegotchis`"
          rel="noopener"
          target="_blank"
          style="white-space: nowrap; margin-right: 20px;"
        >
          View gotchis on aavegotchi.com
          <SiteIcon name="open-window" />
        </a>

        <router-link
          v-if="address"
          :to="{ name: 'lending-lands', query: { address } }"
          style="white-space: nowrap;"
        >
          <SiteIcon name="home" style="margin-right: 2px" />
          View lands belonging to
          {{ address.substring(0, 5) }}
        </router-link>
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

      <div style="margin: 15px 0 15px 40px">
        -- OR --
      </div>

      <form
        style="display: flex; flex-wrap: wrap; column-gap: 10px;"
        @submit.prevent="enterOriginalOwnerAddress"
      >
        <label>
          "Original Owner" in lending contract:
          <input
            v-model="inputOriginalOwnerAddress"
            type="text"
          />
        </label>
        <SiteButton
          type="submit"
          :disabled="!inputOriginalOwnerAddress"
        >
          Use this address
        </SiteButton>
      </form>
    </template>
    <div
      v-if="hasValidAddress"
      style="margin-top: 20px;"
    >
      <LendingManagerGotchis
        :key="address"
        :address="address"
        :thirdPartyAddress="thirdPartyAddress"
        :originalOwnerAddress="originalOwnerAddress"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import useNetwork from '@/environment/useNetwork'
import EthAddress from '@/common/EthAddress.vue'
import LendingManagerGotchis from './LendingManagerGotchis.vue'

export default {
  components: {
    EthAddress,
    LendingManagerGotchis
  },
  props: {
    address: { type: String, default: null },
    thirdPartyAddress: { type: String, default: null },
    originalOwnerAddress: { type: String, default: null }
  },
  setup (props) {
    const { isPolygonNetwork } = useNetwork()

    const router = useRouter()
    const urlNoAddress = router.resolve({ name: 'lending-manager' }).href

    const inputAddress = ref('')
    const inputThirdPartyAddress = ref('')
    const inputOriginalOwnerAddress = ref('')

    const validAddress = computed(() => props.address?.length === 42)
    const validThirdPartyAddress = computed(() => props.thirdPartyAddress?.length === 42)
    const validOriginalOwnerAddress = computed(() => props.originalOwnerAddress?.length === 42)

    const hasValidAddress = computed(() => validAddress.value || validThirdPartyAddress.value || validOriginalOwnerAddress.value)

    const navigate = function (query) {
      router.push({
        name: 'lending-manager',
        query
      })
    }

    const clearAddress = () => {
      navigate()
    }

    const enterAddress = () => {
      navigate({
        address: inputAddress.value
      })
    }

    const enterThirdPartyAddress = () => {
      navigate({
        thirdPartyAddress: inputThirdPartyAddress.value
      })
    }

    const enterOriginalOwnerAddress = () => {
      navigate({
        originalOwnerAddress: inputOriginalOwnerAddress.value
      })
    }

    return {
      isPolygonNetwork,
      urlNoAddress,
      clearAddress,
      inputAddress,
      inputThirdPartyAddress,
      inputOriginalOwnerAddress,
      enterAddress,
      enterThirdPartyAddress,
      enterOriginalOwnerAddress,
      hasValidAddress
    }
  }
}
</script>

<style scoped>
</style>
