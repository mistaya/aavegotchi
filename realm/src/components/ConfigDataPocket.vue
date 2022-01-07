<template>
  <div>
    <h1>Config Data (Gotchi Pockets)</h1>

    <ConfigDataGotchis />
    <ConfigDataGotchiRewards />
    <ConfigDataGotchiGhst />
  </div>
</template>

<script>
import ConfigDataGotchis from './ConfigDataGotchis.vue'
import ConfigDataGotchiRewards from './ConfigDataGotchiRewards.vue'
import ConfigDataGotchiGhst from './ConfigDataGotchiGhst.vue'

export default {
  components: {
    ConfigDataGotchis,
    ConfigDataGotchiRewards,
    ConfigDataGotchiGhst
  }
}
</script>

<style scoped>
</style>
