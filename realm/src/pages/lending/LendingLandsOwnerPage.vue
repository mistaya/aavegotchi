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

    <div v-else>
      <div style="margin-bottom: 20px;">
        <div class="site-alertbox site-alertbox--info site-alertbox--compact">
          <SiteIcon name="info" />
          <div>
            If you've borrowed a gotchi and have looked up its owner's address from the main Aavegotchi site, note that this might not be the correct address to use here. For example, if the gotchi came from the Vault, then the main site shows the <i>original</i> owner, but in the Gotchiverse you'll have access to the Vault's lands, not the original owners' lands.
            <br>To be sure, go to your
            <router-link :to="{ name: 'lending-borrower' }">Borrower page</router-link>
            and look for the gotchi's Owner reported there.
          </div>
        </div>
      </div>

      <LendingLandsOverview
        :key="address"
        :address="address"
      />
    </div>
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
