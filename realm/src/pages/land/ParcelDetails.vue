<template>
  <div
    v-if="parcel"
    class="parcel-details site-card"
  >
    <SiteButton
      type="button"
      style="position: absolute; top: 5px; right: 5px; display: flex;"
      title="Close"
      @click="$emit('close')"
    >
      <span class="sr-only">Close</span>
      <SiteIcon name="cancel" />
    </SiteButton>

    <h2 style="margin: 0 0 10px 0">Parcel details:</h2>

    <div
      v-if="auction && !auction.hasAuction"
      class="site-alertbox site-alertbox--info site-alertbox--compact"
    >
      <SiteIcon name="info" />
      <div>
        Not being auctioned.
      </div>
    </div>

    <div>
      <span class="parcel-details__label">ID:</span>
      <router-link
        :to="{ name: 'parcel', params: { parcelId: parcel.id } }"
        target="_blank"
        style="margin-left: 5px;"
        title="show parcel details in new tab"
      >
        {{ parcel.id }}
        <SiteIcon name="open-window" :size="13" />
        <span class="sr-only">
          Open details in new tab
        </span>
      </router-link>
    </div>

    <div style="display: flex;">
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

    <div>
      <span class="parcel-details__label">Name:</span>
      <span class="parcel-name">{{ parcel.parcelHash }}</span>
    </div>

    <div>
      <span class="parcel-details__label">Size:</span>
      <span class="parcel-size">{{ parcel.sizeLabel }}</span>
    </div>

    <div>
      <span class="parcel-details__label">District:</span>
      {{ parcel.district }}
    </div>

    <template v-if="auction && auction.hasAuction">
      <div>
        <span class="parcel-details__label">Last bid:</span>
        <a
          :href="`https://gotchiverse.io/auction?tokenId=${parcel.id}`"
          target="_blank"
        >
          <NumberDisplay :number="auction.highestBidGhst" />
          GHST
        </a>
        <span class="parcel-details__time">
          (<DateFriendly :date="auction.lastBidTime" />)
        </span>
      </div>
      <div>
        <span class="parcel-details__label">Bidder:</span>
        <EthAddress
          :address="auction.highestBidder"
          icon
        />
      </div>
    </template>

    <div v-if="owner">
      <span class="parcel-details__label">Owner:</span>
      <EthAddress
        :address="owner"
        icon
      />
    </div>

    <div v-if="listing">
      <span class="parcel-details__label">Listed at:</span>
      <a
        :href="`https://app.aavegotchi.com/baazaar/erc721/${listing.id}`"
        target="_blank"
      >
        <NumberDisplay :number="listing.priceInGhst" />
        GHST
      </a>
      <span class="parcel-details__time">
        (<DateFriendly :date="listing.dateCreated" />)
      </span>
    </div>

    <div v-if="lastSale">
      <span class="parcel-details__label">Last sold:</span>
      <a
        :href="`https://app.aavegotchi.com/baazaar/erc721/${lastSale.id}`"
        target="_blank"
      >
        <NumberDisplay :number="lastSale.priceInGhst" />
        GHST
      </a>
      <span class="parcel-details__time">
        (<DateFriendly :date="lastSale.datePurchased" />)
      </span>
    </div>

    <div v-if="auctionPrice">
      <span class="parcel-details__label">Auction price:</span>
      <NumberDisplay :number="auctionPrice" />
      GHST
    </div>

    <div>
      <span class="parcel-details__label">Boosts:</span>
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

    <ParcelDetailsInstallations
      :key="`installations_${parcel.id}`"
      :id="parcel.id"
      :sizeNum="parcel.size"
    />

    <ParcelDetailsAlchemica
      :key="`alchemica_${parcel.id}`"
      :id="parcel.id"
      :sizeNum="parcel.size"
    />

    <div class="parcel-coords">
      Coordinates:
      ({{ parcel.coordinateX }},
      {{ parcel.coordinateY }})
      <br>Gotchiverse Coords:
      ({{ parcel.coordinateX * 64 }},
      {{ parcel.coordinateY * 64 }})
      <br>Dimensions: {{ parcel.width }} x {{ parcel.height }}
    </div>
  </div>
</template>

<script>
import DateFriendly from '@/common/DateFriendly.vue'
import EthAddress from '@/common/EthAddress.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import FlagSelectedIcon from './FlagSelectedIcon.vue'
import ParcelBoosts from './ParcelBoosts.vue'
import ParcelDetailsInstallations from './ParcelDetailsInstallations.vue'
import ParcelDetailsAlchemica from './ParcelDetailsAlchemica.vue'

export default {
  components: {
    DateFriendly,
    EthAddress,
    NumberDisplay,
    FlagSelectedIcon,
    ParcelBoosts,
    ParcelDetailsInstallations,
    ParcelDetailsAlchemica
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
    position: relative;
    display: grid;
    row-gap: 8px;
    padding: 10px 10px 15px 15px;
  }

  .selected-flag-toggle {
    display: inline-flex;
  }

  .parcel-details__label {
    margin-right: 5px;
    font-size: 0.9em;
    color: var(--site-text-color--subtle);
  }

  .parcel-size {
    text-transform: capitalize;
  }
  .parcel-name {
    font-family: monospace;
    font-size: 0.9em;
  }
  .parcel-coords {
    margin-top: 10px;
    font-size: 0.8em;
    color: var(--site-text-color--subtle);
  }
  .parcel-details__time {
    margin-left: 5px;
    font-size: 0.85em;
  }
</style>
