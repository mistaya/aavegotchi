<template>
  <div>
    <div style="margin-bottom: 10px;">
      <h2 style="display: inline; margin-right: 15px; margin-bottom: 20px">
        Land Owner
        <EthAddress
          :address="address"
          icon
        />
      </h2>
      (<router-link :to="{ name: 'lending-lands'}">
        Use another address
      </router-link>)
    </div>
    <div v-if="!hasValidAddress">
      Invalid address
    </div>
    <LendingLandsOverview
      v-else
      :key="address"
      :address="address"
    />
  </div>
</template>

<script>
import { computed } from 'vue'
import EthAddress from '@/common/EthAddress.vue'
import LendingLandsOverview from './LendingLandsOverview.vue'

const ensureAddressRoute = function (to, next) {
  if (!to.params?.address) {
    next({
      name: 'lending-lands'
    })
  } else {
    next()
  }
}

export default {
  beforeRouteEnter (to, from, next) {
    ensureAddressRoute(to, next)
  },
  beforeRouteUpdate (to, from, next) {
    ensureAddressRoute(to, next)
  },
  components: {
    EthAddress,
    LendingLandsOverview
  },
  props: {
    address: { type: String, required: true }
  },
  setup (props) {
    const hasValidAddress = computed(() => props.address.length === 42)
    return {
      hasValidAddress
    }
  }
}
</script>

<style scoped>
</style>
