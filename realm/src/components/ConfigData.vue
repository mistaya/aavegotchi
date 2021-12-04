<template>
  <div>
    <h1>Config Data</h1>

    <router-link :to="{ name: 'home' }">Back to Home</router-link>

    <ConfigDataParcels />

    <ConfigDataAuctions />
  </div>
</template>

<script>
import ConfigDataParcels from './ConfigDataParcels.vue'
import ConfigDataAuctions from './ConfigDataAuctions.vue'

export default {
  components: {
    ConfigDataParcels,
    ConfigDataAuctions
  }
}
</script>

<style scoped>
</style>
