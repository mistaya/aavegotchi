<template>
  <div class="citaadel-layout">
    <CryptoIcons />
    <div class="citaadel-nav site-banner site-banner--secondary">
      <router-link
        :to="{ name: 'citaadel-main' }"
        class="site-banner__link"
      >
        Main Map
      </router-link>
      <router-link
        :to="{ name: 'citaadel-spillover' }"
        class="site-banner__link"
      >
        Spillover Activity
      </router-link>
      <router-link
        :to="{ name: 'parcel' }"
        class="site-banner__link"
      >
        Parcel
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
import CryptoIcons from '@/common/CryptoIcons.vue'

const ensureSubPage = function (to, next) {
  if (to.name === 'citaadel') {
    next({
      name: 'citaadel-main'
    })
  } else {
    next()
  }
}
export default {
  components: {
    CryptoIcons
  },
  beforeRouteEnter (to, from, next) {
    ensureSubPage(to, next)
  },
  beforeRouteUpdate (to, from, next) {
    ensureSubPage(to, next)
  }
}
</script>

<style scoped>
  .citaadel-layout {
    height: 100%;
    display: grid;
    grid-template-rows: auto minmax(10px, 1fr);
  }

  .citaadel-nav {
    /* TODO this is a workaround to cover the padding from the <main> element */
    margin: -9px -10px 10px -10px;
    padding: 5px 5px 3px 5px;
  }
  .citaadel-nav a {
    padding: 0 15px;
    margin-bottom: 5px;
  }
</style>
