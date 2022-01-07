<template>
  <div>
    <h1>Config Data (Gotchi Pockets)</h1>

    <ConfigDataGotchis />
    <ConfigDataGotchiRewards />
  </div>
</template>

<script>
import ConfigDataGotchis from './ConfigDataGotchis.vue'
import ConfigDataGotchiRewards from './ConfigDataGotchiRewards.vue'

export default {
  components: {
    ConfigDataGotchis,
    ConfigDataGotchiRewards
  }
}
</script>

<style scoped>
</style>
