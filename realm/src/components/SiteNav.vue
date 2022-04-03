<template>
  <header class="site-header site-banner">
    <ColorSchemeToggle
      class="site-header__color-scheme"
    />
    <nav>
      <router-link
        :to="{ name: 'citaadel' }"
        class="site-banner__link"
      >
        The Citaadel
      </router-link>
      <router-link
        :to="{ name: 'land-auctions' }"
        class="site-banner__link"
      >
        Land Auctions
      </router-link>
      <router-link
        :to="{ name: 'wearable-sets', params: { mode: 'gotchi' } }"
        class="site-banner__link"
      >
        Wearable Sets
      </router-link>
      <router-link
        :to="{ name: 'pockets' }"
        class="site-banner__link"
      >
        Gotchi Pockets
      </router-link>
      <router-link
        :to="{ name: 'lending-index' }"
        class="site-banner__link"
      >
        Lending
      </router-link>
      <!--
      <router-link
        :to="{ name: 'rf-index' }"
        class="site-banner__link"
      >
        Rarity Farming
      </router-link>
      -->
    </nav>
  </header>
</template>

<script>
import ColorSchemeToggle from './ColorSchemeToggle.vue'

export default {
  components: {
    ColorSchemeToggle
  }
}
</script>

<style scoped>
  .site-header {
    padding: 5px;
  }
  nav a {
    display: inline-block;
    margin: 5px 15px;
  }
  .site-header__color-scheme {
    float: right;
  }
</style>
