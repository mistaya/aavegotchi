<template>
  <div>
    <h1>Config Data</h1>

    <PrereqParcels>
      <ConfigDataParcels />
      <ConfigDataAuctions />
      <ConfigDataBaazaarListings />
      <ConfigDataGBMListings />
      <ConfigDataParcelPrices />
      <ConfigDataParcelOwners />
      <ConfigDataParcelContents />
    </PrereqParcels>
  </div>
</template>

<script>
import PrereqParcels from './PrereqParcels.vue'
import ConfigDataParcels from './ConfigDataParcels.vue'
import ConfigDataAuctions from './ConfigDataAuctions.vue'
import ConfigDataBaazaarListings from './ConfigDataBaazaarListings.vue'
import ConfigDataGBMListings from './ConfigDataGBMListings.vue'
import ConfigDataParcelPrices from './ConfigDataParcelPrices.vue'
import ConfigDataParcelOwners from './ConfigDataParcelOwners.vue'
import ConfigDataParcelContents from './ConfigDataParcelContents.vue'

export default {
  components: {
    PrereqParcels,
    ConfigDataParcels,
    ConfigDataAuctions,
    ConfigDataBaazaarListings,
    ConfigDataGBMListings,
    ConfigDataParcelPrices,
    ConfigDataParcelOwners,
    ConfigDataParcelContents
  }
}
</script>

<style scoped>
</style>
