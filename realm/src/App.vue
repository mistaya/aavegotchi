<template>
  <div :class="{
    'device--no-touch': deviceNoTouch
  }">
    <SiteHead />
    <SiteIcons />
    <nav>
      <router-link :to="{ name: 'citaadel' }">The Citaadel</router-link>
      <router-link :to="{ name: 'land-auction', params: { auctionId: '1' } }">Land Auction 1</router-link>
      <router-link :to="{ name: 'land-auction', params: { auctionId: '2' } }">Land Auction 2</router-link>
      <router-link :to="{ name: 'wearable-sets', params: { mode: 'all' } }">Wearable Sets</router-link>
      <router-link :to="{ name: 'pockets' }">Gotchi Pockets</router-link>

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
import SiteHead from '@/components/SiteHead.vue'
import SiteIcons from '@/components/SiteIcons.vue'

export default {
  name: 'App',
  components: {
    SiteHead,
    SiteIcons
  },
  setup: function () {
    const { pageLoading } = usePageLoading()

    return {
      pageLoading,
      deviceNoTouch: !('ontouchstart' in document.documentElement)
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
    text-size-adjust: none;
    font-size: 16px;
  }

  h1 {
    margin: 0 0 10px 0;
    font-size: 1.4em;
  }

  h2 {
    margin: 20px 0;
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

  .word-break {
    word-break: break-word;
  }
  .visible-scrollbar::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
    height: 7px;
  }
  .visible-scrollbar::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: rgba(0,0,0,.4);
    -webkit-box-shadow: 0 0 1px rgba(255,255,255,.4);
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
