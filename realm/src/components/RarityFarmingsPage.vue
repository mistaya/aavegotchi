<template>
  <div>
    <div class="rf-nav site-banner site-banner--secondary">
      <!--
      <div>
        Season 2:
        <router-link
          v-for="round in ['1', '2', '3', '4']"
          :key="round"
          :to="{ name: 'rf', params: { season: '2', round } }"
          class="site-banner__link"
        >
          <span class="sr-only">Season 2</span> Round {{ round }}
        </router-link>
      </div>
      -->
      <div>
        Season 3:
        <router-link
          v-for="round in ['1', '2']"
          :key="round"
          :to="{ name: 'rf', params: { season: '3', round } }"
          class="site-banner__link"
        >
          <span class="sr-only">Season 3</span> Round {{ round }}
        </router-link>
      </div>
    </div>
    <router-view :key="`${$route.params.season}_${$route.params.round}`"></router-view>
  </div>
</template>

<script>
const ensureRFRoute = function (to, next) {
  if (!to.params?.season || !to.params?.round) {
    // TODO pick latest RF round automatically
    next({
      name: 'rf',
      params: {
        season: '3',
        round: '2'
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
