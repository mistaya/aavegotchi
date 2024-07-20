<template>
  <div>
    <h1>Config Data (Gotchi Pockets)</h1>

    <ConfigDataGotchis />
    <ConfigDataGotchiRewards />
    <ConfigDataGotchiGhst />
    <ConfigDataEthereumGotchiOwners />
  </div>
</template>

<script>
import ConfigDataGotchis from './ConfigDataGotchis.vue'
import ConfigDataGotchiRewards from './ConfigDataGotchiRewards.vue'
import ConfigDataGotchiGhst from './ConfigDataGotchiGhst.vue'
import ConfigDataEthereumGotchiOwners from './ConfigDataEthereumGotchiOwners.vue'

export default {
  components: {
    ConfigDataGotchis,
    ConfigDataGotchiRewards,
    ConfigDataGotchiGhst,
    ConfigDataEthereumGotchiOwners
  }
}
</script>

<style scoped>
</style>
