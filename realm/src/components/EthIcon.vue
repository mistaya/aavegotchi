<template>
  <img
    :key="address"
    :src="imgDataUrl"
    class="eth-icon"
  />
</template>

<script>
import blockies from 'ethereum-blockies'

export default {
  props: {
    address: { type: String, required: true }
  },
  computed: {
    imgDataUrl () {
      const canvas = blockies.create({ // All options are optional
        seed: this.address.toLowerCase(), // seed used to generate icon data, default: random
        size: 10 // width/height of the icon in blocks, default: 8
      })
      return canvas.toDataURL()
    }
  }
}
</script>

<style scoped>
  .eth-icon {
    max-width: 100%;
    border-radius: 50%;
    border: 1px solid rgba(33,33,33,0.2);
  }
</style>
