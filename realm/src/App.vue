<template>
  <div>
    <nav>
      <router-link :to="{ name: 'citaadel' }">The Citaadel</router-link>
      <router-link :to="{ name: 'land-auction', params: { auctionId: '1' } }">Land Auction 1</router-link>
      <router-link :to="{ name: 'land-auction', params: { auctionId: '2' } }">Land Auction 2</router-link>

      <!--
      <router-link :to="{ name: 'config-data' }">Config Data</router-link>
      <router-link :to="{ name: 'config-parcels' }">Config Parcels</router-link>
      -->
    </nav>
    <main>
      <div v-if="pageLoading">
        Loading...
      </div>
      <router-view v-else />
    </main>
  </div>
</template>

<script>
import usePageLoading from '@/router/usePageLoading'

export default {
  name: 'App',
  setup: function () {
    const { pageLoading } = usePageLoading()
    return {
      pageLoading
    }
  }
}
</script>

<style>
  body {
    --background-color-transparent: rgba(255, 255, 255, 0.9);
    --purple: #FA34F3;
    --purple--contrast-black: #fa3ef4;
    margin: 0;
    padding: 0;
  }

  h1 {
    margin: 0 0 10px 0;
    font-size: 1.4em;
  }

  h2 {
    margin: 10px 0 0;
    font-size: 1.2em;
  }

  h3 {
    margin: 10px 0;
    font-size: 1em;
    font-weight: bold;
  }

  h4 {
    margin: 10px 0 5px 0;
    font-size: 1em;
    font-weight: normal;
    font-style: italic;
  }

  main {
    padding: 10px;
  }

  input[type="checkbox"] {
    accent-color: var(--purple);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }
</style>

<style scoped>
  nav {
    padding: 10px;
    background: #f7eaf7;
  }
  nav a {
    display: inline-block;
    margin-right: 10px;
  }
  nav a + a::before {
    content: '|';
    margin-right: 10px;
  }
  nav a[aria-current=page] {
    font-weight: bold;
  }
</style>
