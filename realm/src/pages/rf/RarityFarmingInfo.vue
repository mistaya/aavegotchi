<template>
  <div>
    <h1>Rarity Farming Season {{ season }} Round {{ round }}</h1>

    <p>
      Snapshot was taken <DatePrecise :date="roundInfo.endDate" />
      at block {{ roundInfo.blockNumber }}.
      <br>
      In this round, <NumberDisplay :number="seasonInfo.ghstTotalPerRound" /> GHST was shared
      between the top <NumberDisplay :number="seasonInfo.numWinners" /> gotchis in each leaderboard
      (<template
        v-for="(leaderboard, index) in seasonInfo.leaderboards"
        :key="leaderboard.id"
      >
        {{ leaderboard.label }}: {{ leaderboard.percent }}%<template v-if="index !== seasonInfo.leaderboards.length - 1">, </template>
      </template>)
    </p>
  </div>
</template>

<script>
import useRarityFarming from '@/data/useRarityFarming'
import DatePrecise from '@/common/DatePrecise.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'

export default {
  components: {
    DatePrecise,
    NumberDisplay
  },
  props: {
    season: { type: String, required: true },
    round: { type: String, required: true }
  },
  setup (props) {
    const { seasonInfo, roundInfo } = useRarityFarming(props.season, props.round)

    return {
      seasonInfo,
      roundInfo
    }
  }
}
</script>

<style scoped>
</style>
