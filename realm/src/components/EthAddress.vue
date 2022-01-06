<template>
  <span>
    <span
      class="eth-address"
      :title="address"
    >
      {{ shortAddress }}
    </span>
    <CopyToClipboard :text="address" />
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

export default {
  components: {
    CopyToClipboard
  },
  props: {
    address: { type: String, required: true },
    polygonscan: { type: Boolean, default: false }
  },
  computed: {
    shortAddress () {
      return `${this.address.substring(0, 5)}...${this.address.substring(this.address.length - 5)}`
    }
  }
}
</script>

<style scoped>
  .eth-address {
    font-family: monospace;
  }
</style>
