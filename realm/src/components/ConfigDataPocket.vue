<template>
  <div>
    <h1>Config Data (Gotchi Pockets)</h1>

    <ConfigDataGotchis />
    <ConfigDataGotchiRewards />
    <ConfigDataGotchiGhst />
    <ConfigDataVaultOwners />
  </div>
</template>

<script>
import ConfigDataGotchis from './ConfigDataGotchis.vue'
import ConfigDataGotchiRewards from './ConfigDataGotchiRewards.vue'
import ConfigDataGotchiGhst from './ConfigDataGotchiGhst.vue'
import ConfigDataVaultOwners from './ConfigDataVaultOwners.vue'

export default {
  components: {
    ConfigDataGotchis,
    ConfigDataGotchiRewards,
    ConfigDataGotchiGhst,
    ConfigDataVaultOwners
  }
}
</script>

<style scoped>
</style>
