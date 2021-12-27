<template>
  <div
    v-if="parcel"
    class="parcel-details"
  >
    <button
      type="button"
      style="float: right"
      @click="$emit('close')"
    >
      Close
    </button>

    <h2>Parcel details:</h2>

    ID: {{ parcel.id }}

    <div style="display: flex; margin-top: 5px; margin-bottom: 5px;">
      <button
        type="button"
        style="margin-right: 10px"
        @click="$emit('zoomToParcel')"
      >
        Zoom to parcel
      </button>

      <button
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
      </button>
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
      <EthAddress :address="auction.highestBidder" />
    </div>
    <div v-if="owner">
      Owner:
      <EthAddress :address="owner" />
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
      <div style="margin-left: 10px">
        <template v-if="parcel.hasBoost">
          <div v-if="parcel.fudBoost !== '0'">
            FUD: {{ parcel.fudBoost }}
          </div>
          <div v-if="parcel.fomoBoost !== '0'">
            FOMO: {{ parcel.fomoBoost }}
          </div>
          <div v-if="parcel.alphaBoost !== '0'">
            ALPHA: {{ parcel.alphaBoost }}
          </div>
          <div v-if="parcel.kekBoost !== '0'">
            KEK: {{ parcel.kekBoost }}
          </div>
        </template>
        <template v-else>
          None
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import DateFriendly from './DateFriendly.vue'
import EthAddress from './EthAddress.vue'
import FlagSelectedIcon from './FlagSelectedIcon.vue'

export default {
  components: {
    DateFriendly,
    EthAddress,
    FlagSelectedIcon
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
    border: 1px solid #ccc;
    padding: 10px;
  }

  .selected-flag-toggle {
    display: inline-flex;
  }
  .selected-flag-toggle[aria-pressed=true] {
    background: var(--purple--contrast-black);
    font-weight: bold;
  }
</style>
