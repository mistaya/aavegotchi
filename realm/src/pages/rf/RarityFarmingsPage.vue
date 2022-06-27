<template>
  <div>
    <div class="rf-nav site-banner site-banner--secondary">
      <div
        v-for="[seasonId, season] in Object.entries(SEASONS)"
        :key="seasonId"
      >
        Season {{ seasonId }}:
        <router-link
          v-for="roundId in Object.keys(season.rounds)"
          :key="roundId"
          :to="{ name: 'rf', params: { season: seasonId, round: roundId } }"
          class="site-banner__link"
        >
          <span class="sr-only">Season {{ seasonId }}</span> Round {{ roundId }}
        </router-link>
      </div>
    </div>
    <router-view :key="`${$route.params.season}_${$route.params.round}`"></router-view>
  </div>
</template>

<script>
import { SEASONS, latestSeason, latestRound } from '@/data/useRarityFarming'

const ensureRFRoute = function (to, next) {
  if (!to.params?.season || !to.params?.round) {
    next({
      name: 'rf',
      params: {
        season: latestSeason,
        round: latestRound
      }
    })
  } else {
    next()
  }
}
export default {
  beforeRouteEnter (to, from, next) {
    ensureRFRoute(to, next)
  },
  beforeRouteUpdate (to, from, next) {
    ensureRFRoute(to, next)
  },
  setup () {
    return {
      SEASONS
    }
  }
}
</script>

<style scoped>
  .rf-nav {
    /* TODO this is a workaround to cover the padding from the <main> element */
    margin: -9px -10px 10px -10px;
    padding: 5px 5px 3px 5px;
  }
  .rf-nav a {
    padding: 0 15px;
    margin-bottom: 5px;
  }
</style>
