<template>
  <div>
    <h1>Config Data (Wearable Sets)</h1>

    <ConfigDataWearables />
    <ConfigDataWearableSets />
  </div>
</template>

<script>
import ConfigDataWearables from './ConfigDataWearables.vue'
import ConfigDataWearableSets from './ConfigDataWearableSets.vue'

export default {
  components: {
    ConfigDataWearables,
    ConfigDataWearableSets
  }
}
</script>

<style scoped>
</style>
