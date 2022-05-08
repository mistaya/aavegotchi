<template>
  <div class="land-auctions">
    <div class="land-auctions-nav site-banner site-banner--secondary">
      <router-link
        :to="{ name: 'land-auction', params: { auctionId: '1' } }"
        class="site-banner__link"
      >
        Land Auction 1
      </router-link>
      <router-link
        :to="{ name: 'land-auction', params: { auctionId: '2' } }"
        class="site-banner__link"
      >
        Land Auction 2
      </router-link>
    </div>
    <router-view></router-view>
  </div>
</template>

<script>
const ensureAuctionRoute = function (to, next) {
  if (!to.params?.auctionId) {
    next({
      name: 'land-auction',
      params: {
        auctionId: '1'
      }
    })
  } else {
    next()
  }
}
export default {
  beforeRouteEnter (to, from, next) {
    ensureAuctionRoute(to, next)
  },
  beforeRouteUpdate (to, from, next) {
    ensureAuctionRoute(to, next)
  }
}
</script>

<style scoped>
  .land-auctions {
    height: 100%;
    display: grid;
    grid-template-rows: auto minmax(10px, 1fr);
  }

  .land-auctions-nav {
    /* TODO this is a workaround to cover the padding from the <main> element */
    margin: -9px -10px 10px -10px;
    padding: 5px 5px 3px 5px;
  }
  .land-auctions-nav a {
    padding: 0 15px;
    margin-bottom: 5px;
  }
</style>
