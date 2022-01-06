<template>
  <span>
    <div class="address-row">
      <EthIcon
        v-if="icon"
        style="width: 15px"
        :address="address"
      />
      <span
        class="eth-address"
        :title="address"
      >
        {{ shortAddress }}
      </span>
      <CopyToClipboard :text="address" />
    </div>
    <a
      v-if="polygonscan"
      :href="`https://polygonscan.com/address/${address}`"
      target="_blank"
      rel="nofollow noopener noreferrer"
      style="margin-left: 5px"
    >
      polygonscan
    </a>
  </span>
</template>

<script>
import CopyToClipboard from './CopyToClipboard.vue'
import EthIcon from './EthIcon.vue'

export default {
  components: {
    CopyToClipboard,
    EthIcon
  },
  props: {
    address: { type: String, required: true },
    polygonscan: { type: Boolean, default: false },
    icon: { type: Boolean, default: false }
  },
  computed: {
    shortAddress () {
      return `${this.address.substring(0, 5)}...${this.address.substring(this.address.length - 5)}`
    }
  }
}
</script>

<style scoped>
  .address-row {
    display: inline-flex;
    align-items: center;
  }
  .eth-address {
    margin: 0 3px 0 5px;
    font-family: monospace;
  }
</style>
