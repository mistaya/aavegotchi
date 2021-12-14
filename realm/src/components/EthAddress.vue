<template>
  <span>
    <span
      class="eth-address"
      :title="address"
    >
      {{ shortAddress }}
    </span>
    <CopyToClipboard :text="address" />
  </span>
</template>

<script>
import CopyToClipboard from './CopyToClipboard.vue'

export default {
  components: {
    CopyToClipboard
  },
  props: {
    address: { type: String, required: true }
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
