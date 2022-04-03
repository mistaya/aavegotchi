<template>
  <div>
    <div class="lending-nav site-banner site-banner--secondary">
      <!--
      <router-link
        :to="{ name: 'lending-available' }"
        class="site-banner__link"
      >
        Available
      </router-link>
    -->
      <router-link
        :to="{ name: 'lending-activity' }"
        class="site-banner__link"
      >
        Activity
      </router-link>

      <router-link
        :to="{ name: 'lending-manager' }"
        class="site-banner__link"
      >
        Manager
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
const ensureSubPage = function (to, next) {
  if (to.name === 'lending-index') {
    next({
      name: 'lending-activity'
    })
  } else {
    next()
  }
}
export default {
  beforeRouteEnter (to, from, next) {
    ensureSubPage(to, next)
  },
  beforeRouteUpdate (to, from, next) {
    ensureSubPage(to, next)
  }
}
</script>

<style scoped>
  .lending-nav {
    /* TODO this is a workaround to cover the padding from the <main> element */
    margin: -9px -10px 10px -10px;
    padding: 5px 5px 3px 5px;
  }
  .lending-nav a {
    padding: 0 15px;
    margin-bottom: 5px;
  }
</style>
