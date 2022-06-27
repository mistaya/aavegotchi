<template>
  <div>
    <h1>Config Data</h1>

    <PrereqParcels>
      <ConfigDataParcels />
      <ConfigDataAuctions />
      <ConfigDataBaazaarListings />
      <ConfigDataParcelPrices />
      <ConfigDataParcelOwners />
    </PrereqParcels>
  </div>
</template>

<script>
import PrereqParcels from './PrereqParcels.vue'
import ConfigDataParcels from './ConfigDataParcels.vue'
import ConfigDataAuctions from './ConfigDataAuctions.vue'
import ConfigDataBaazaarListings from './ConfigDataBaazaarListings.vue'
import ConfigDataParcelPrices from './ConfigDataParcelPrices.vue'
import ConfigDataParcelOwners from './ConfigDataParcelOwners.vue'

export default {
  components: {
    PrereqParcels,
    ConfigDataParcels,
    ConfigDataAuctions,
    ConfigDataBaazaarListings,
    ConfigDataParcelPrices,
    ConfigDataParcelOwners
  }
}
</script>

<style scoped>
</style>
