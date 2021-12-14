<template>
  <div>
    <h1>Config Data</h1>

    <router-link :to="{ name: 'home' }">Back to Home</router-link>

    <ConfigDataParcels />
    <ConfigDataAuctions />
    <ConfigDataBaazaarListings />
    <ConfigDataParcelPrices />
  </div>
</template>

<script>
import ConfigDataParcels from './ConfigDataParcels.vue'
import ConfigDataAuctions from './ConfigDataAuctions.vue'
import ConfigDataBaazaarListings from './ConfigDataBaazaarListings.vue'
import ConfigDataParcelPrices from './ConfigDataParcelPrices.vue'

export default {
  components: {
    ConfigDataParcels,
    ConfigDataAuctions,
    ConfigDataBaazaarListings,
    ConfigDataParcelPrices
  }
}
</script>

<style scoped>
</style>
