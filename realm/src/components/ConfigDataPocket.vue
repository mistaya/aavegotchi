<template>
  <div>
    <h1>Config Data (Gotchi Pockets)</h1>

    <ConfigDataGotchis />
    <ConfigDataGotchiRewards />
    <ConfigDataGotchiGhst />
    <ConfigDataVaultOwners />
    <ConfigDataEthereumGotchiOwners />
  </div>
</template>

<script>
import ConfigDataGotchis from './ConfigDataGotchis.vue'
import ConfigDataGotchiRewards from './ConfigDataGotchiRewards.vue'
import ConfigDataGotchiGhst from './ConfigDataGotchiGhst.vue'
import ConfigDataVaultOwners from './ConfigDataVaultOwners.vue'
import ConfigDataEthereumGotchiOwners from './ConfigDataEthereumGotchiOwners.vue'

export default {
  components: {
    ConfigDataGotchis,
    ConfigDataGotchiRewards,
    ConfigDataGotchiGhst,
    ConfigDataVaultOwners,
    ConfigDataEthereumGotchiOwners
  }
}
</script>

<style scoped>
</style>
