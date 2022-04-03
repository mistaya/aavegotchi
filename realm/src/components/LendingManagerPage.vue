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
    </h2>
    <template v-if="address">
      <div v-if="invalidAddress">
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
    </template>
    <div
      v-if="!invalidAddress"
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
    address: { type: String, default: null }
  },
  setup (props) {
    const router = useRouter()
    const inputAddress = ref('')
    const urlNoAddress = router.resolve({ name: 'lending-manager' }).href
    const invalidAddress = computed(() => !props.address || props.address.length !== 42)

    const enterAddress = () => {
      router.push({
        name: 'lending-manager',
        query: {
          address: inputAddress.value
        }
      })
    }

    const clearAddress = () => {
      router.push({
        name: 'lending-manager'
      })
    }

    return {
      inputAddress,
      urlNoAddress,
      invalidAddress,
      enterAddress,
      clearAddress
    }
  }
}
</script>

<style scoped>
</style>
