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
          rel="nofollow noopener"
          target="_blank"
        >
          View on aavegotchi.com
          <SiteIcon name="open-window" />
        </a>
      </div>
      <div>
        TODO Fetch gotchis and display table of lending status
      </div>
    </div>
  </div>
</template>

<script>
import EthAddress from './EthAddress.vue'

export default {
  components: {
    EthAddress
  },
  props: {
    address: { type: String, default: null }
  },
  data () {
    return {
      inputAddress: ''
    }
  },
  computed: {
    urlNoAddress () {
      return this.$router.resolve({ name: 'lending-manager' }).href
    },
    invalidAddress () {
      return !this.address || this.address.length !== 42
    }
  },
  methods: {
    enterAddress () {
      this.$router.push({
        name: 'lending-manager',
        query: {
          address: this.inputAddress
        }
      })
    },
    clearAddress () {
      this.$router.push({
        name: 'lending-manager'
      })
    }
  }
}
</script>

<style scoped>
</style>
