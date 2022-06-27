<template>
  <div>
    <div v-if="!foundInfo">
      Sorry, that Season/Round info isn't available.
    </div>
    <template v-else>
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
    </template>
  </div>
</template>

<script>
import useRarityFarming, { latestSeason, latestRound } from '@/data/useRarityFarming'
import RarityFarmingInfo from './RarityFarmingInfo.vue'
import RarityFarmingWinners from './RarityFarmingWinners.vue'

export default {
  components: {
    RarityFarmingInfo,
    RarityFarmingWinners
  },
  props: {
    season: { type: String, default: latestSeason },
    round: { type: String, default: latestRound }
  },
  setup (props) {
    // The router-view that loads this uses a key with the season and round,
    // so a new instance of this component will be created when they change.
    const foundInfo = useRarityFarming(props.season, props.round)
    return {
      foundInfo
    }
  }
}
</script>

<style scoped>
</style>
