<template>
  <div>
    <RarityFarmingInfo
      :key="`${season}_${round}`"
      :season="season"
      :round="round"
    />
    <RarityFarmingWinners
      :key="`${season}_${round}`"
      :season="season"
      :round="round"
    />
  </div>
</template>

<script>
import RarityFarmingInfo from './RarityFarmingInfo.vue'
import RarityFarmingWinners from './RarityFarmingWinners.vue'

export default {
  components: {
    RarityFarmingInfo,
    RarityFarmingWinners
  },
  props: {
    season: { type: String, default: '3' },
    round: { type: String, default: '2' }
  }
}
</script>

<style scoped>
</style>
