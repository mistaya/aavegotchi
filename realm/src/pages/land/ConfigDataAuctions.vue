<template>
  <section style="margin-left: 20px;">
    <h2>Auction data</h2>

    <ConfigDataAuction
      v-for="auctionId in [1, 2]"
      :key="auctionId"
      :auctionId="auctionId"
    />
  </section>
</template>

<script>
import ConfigDataAuction from './ConfigDataAuction.vue'

export default {
  components: { ConfigDataAuction }
}
</script>

<style scoped>
</style>
