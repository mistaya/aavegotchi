<template>
  <LandAuction
    :key="auctionId"
    :auctionId="auctionId"
  />
</template>

<script>
import LandAuction from './LandAuction.vue'

export default {
  components: {
    LandAuction
  },
  props: {
    auctionId: { type: String, default: '1' }
  }
}
</script>

<style scoped>
</style>
