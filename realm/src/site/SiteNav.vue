<template>
  <header class="site-header site-banner">
    <div class="site-header__toggles">
      <SiteNetwork
        class="site-header__network"
      />
      <ColorSchemeToggle
        class="site-header__color-scheme"
      />
    </div>
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
      <router-link
        :to="{ name: 'rf-index' }"
        class="site-banner__link"
      >
        Rarity Farming
      </router-link>
    </nav>
  </header>
</template>

<script>
import ColorSchemeToggle from './ColorSchemeToggle.vue'
import SiteNetwork from './SiteNetwork.vue'

export default {
  components: {
    ColorSchemeToggle,
    SiteNetwork
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
  .site-header__toggles {
    float: right;
    margin-top: 8px;
    margin-right: 10px;
    display: flex;
    align-items: center;
    column-gap: 15px;
  }
</style>
