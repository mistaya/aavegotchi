<template>
  <div>
    <nav>
      <router-link :to="{ name: 'land-auction', params: { auctionId: '1' } }">Land Auction 1</router-link>
      <router-link :to="{ name: 'land-auction', params: { auctionId: '2' } }">Land Auction 2</router-link>

      <!--
      <router-link :to="{ name: 'config-data' }">Config Data</router-link>
      <router-link :to="{ name: 'config-parcels' }">Config Parcels</router-link>
      -->
    </nav>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
  body {
    --purple: #FA34F3;
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
