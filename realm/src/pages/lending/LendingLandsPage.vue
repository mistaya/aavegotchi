<template>
  <div>
    <div style="margin-bottom: 10px;">
      <h2 style="display: inline; margin-right: 15px;">
        Land Owner
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
    </template>
    <template v-else>
      <form
        style="display: flex; flex-wrap: wrap; column-gap: 10px;"
        @submit.prevent="enterAddress"
      >
        <label>
          Address that owns lands:
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

      <router-link
        :to="{ name: 'lending-lands-public' }"
        class="site-banner__link"
      >
        Lands that allow anyone to channel or empty reservoirs
      </router-link>
    </template>
    <div
      v-if="hasValidAddress"
      style="margin-top: 20px;"
    >
      <LendingLandsOverview
        :key="address"
        :address="address"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import EthAddress from '@/common/EthAddress.vue'
import LendingLandsOverview from './LendingLandsOverview.vue'

export default {
  components: {
    EthAddress,
    LendingLandsOverview
  },
  props: {
    address: { type: String, default: null }
  },
  setup (props) {
    const router = useRouter()
    const urlNoAddress = router.resolve({ name: 'lending-lands' }).href

    const inputAddress = ref('')

    const hasValidAddress = computed(() => props.address?.length === 42)

    const clearAddress = () => {
      router.push({
        name: 'lending-lands'
      })
    }

    const enterAddress = () => {
      router.push({
        name: 'lending-lands',
        query: {
          address: inputAddress.value
        }
      })
    }

    return {
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
