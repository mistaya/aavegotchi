<template>
  <div
    v-if="parcel"
    class="parcel-details site-card"
  >
    <SiteButton
      type="button"
      style="float: right; display: flex;"
      title="Close"
      @click="$emit('close')"
    >
      <span class="sr-only">Close</span>
      <SiteIcon name="cancel" />
    </SiteButton>

    <h2>Parcel details:</h2>

    ID: {{ parcel.id }}

    <div style="display: flex; margin-top: 5px; margin-bottom: 5px;">
      <SiteButton
        type="button"
        style="margin-right: 10px"
        @click="$emit('zoomToParcel')"
      >
        Zoom to parcel
      </SiteButton>

      <SiteButton
        v-if="flagSelected !== null"
        type="button"
        class="selected-flag-toggle"
        :aria-pressed="`${flagSelected}`"
        :title="flagSelected ? 'Remove Highlight' : 'Highlight Parcel'"
        @click="$emit('update:flagSelected', !flagSelected)"
      >
        <FlagSelectedIcon
          :animated="flagSelected"
        />
        <span class="sr-only">
          {{ flagSelected ? 'Remove Highlight' : 'Highlight Parcel' }}
        </span>
      </SiteButton>
    </div>

    Name: {{ parcel.parcelHash }}
    <br>Size: {{ parcel.sizeLabel }}
    <br>District: {{ parcel.district }}

    <div v-if="auction">
      <a
        :href="`https://gotchiverse.io/auction?tokenId=${parcel.id}`"
        target="_blank"
      >
        Last bid: {{ auction.highestBidGhst }} GHST
      </a>
      <br>Bidder:
      <EthAddress
        :address="auction.highestBidder"
        icon
      />
    </div>
    <div v-if="owner">
      Owner:
      <EthAddress
        :address="owner"
        icon
      />
    </div>
    <div v-if="listing">
      <a
        :href="`https://aavegotchi.com/baazaar/erc721/${listing.id}`"
        target="_blank"
      >
        Currently listed on Baazaar for
        {{ listing.priceInGhst.toString() }} GHST
      </a>
    </div>
    <div v-if="lastSale">
      <a
        :href="`https://aavegotchi.com/baazaar/erc721/${lastSale.id}`"
        target="_blank"
      >
        Last sold on Baazaar
        <DateFriendly :date="lastSale.datePurchased" />
        for
        {{ lastSale.priceInGhst.toString() }} GHST
      </a>
    </div>
    <div v-if="auctionPrice">
      Auction price: {{ auctionPrice }} GHST
    </div>
    <div>
      Boosts:
      <ParcelBoosts
        v-if="parcel.hasBoost"
        :fud="parcel.fudBoost"
        :fomo="parcel.fomoBoost"
        :alpha="parcel.alphaBoost"
        :kek="parcel.kekBoost"
      />
      <template v-else>
        None
      </template>
    </div>
  </div>
</template>

<script>
import DateFriendly from './DateFriendly.vue'
import EthAddress from './EthAddress.vue'
import FlagSelectedIcon from './FlagSelectedIcon.vue'
import ParcelBoosts from './ParcelBoosts.vue'

export default {
  components: {
    DateFriendly,
    EthAddress,
    FlagSelectedIcon,
    ParcelBoosts
  },
  props: {
    parcel: { type: Object, required: true },
    auction: { type: Object, default: null },
    listing: { type: Object, default: null },
    lastSale: { type: Object, default: null },
    auctionPrice: { type: String, default: null },
    owner: { type: String, default: null },
    flagSelected: { type: Boolean, default: null }
  }
}
</script>

<style scoped>
  .parcel-details {
    padding: 10px 10px 15px 15px;
  }

  .selected-flag-toggle {
    display: inline-flex;
  }
</style>
