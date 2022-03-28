<template>
  <div>
    <div class="rf-nav site-banner site-banner--secondary">
      <router-link
        :to="{ name: 'rf', params: { season: '3', round: '1' } }"
        class="site-banner__link"
      >
        Season 3 Round 1
      </router-link>
      <router-link
        :to="{ name: 'rf', params: { season: '3', round: '2' } }"
        class="site-banner__link"
      >
        <span class="sr-only">Season 3</span> Round 2
      </router-link>
    </div>
    <router-view></router-view>
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
