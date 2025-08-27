<template>
  <div>
    <template v-if="!listParcelsToDisplay.length">
      No parcels found.
    </template>
    <template v-else>
      <div
        v-if="LIST_PARCELS_ORDERS.length"
        style="margin-left: 10px;"
      >
        <label>
          Sort by:
          <select v-model="listParcelsOrder">
            <option
              v-for="option in LIST_PARCELS_ORDERS"
              :key="option.id"
              :value="option.id"
            >
              {{ option.label }}
            </option>
          </select>
        </label>
      </div>
      <PagingControls
        v-model="paging"
        :numItems="numParcels"
        itemsLabel="parcels"
      />
      <ul
        class="parcels-list"
        :class="{
          'parcels-list--compact': compact
        }"
      >
        <li
          v-for="(parcel, index) in listParcelsToDisplay"
          :key="parcel.id"
          class="parcels-list-item"
          :class="{
            [`parcel-size--${parcel.sizeLabel.toLowerCase()}`]: true,
            'parcels-list-item--selected': parcel.id === selectedParcelId
          }"
        >
          <div class="parcel-index">
            {{ (paging.page * paging.pageSize) + index + 1 }}.
          </div>

          <div class="parcel-details">
            <a
              href="#"
              class="parcel-id"
              @click.prevent="$emit('click:parcel', parcel)"
            >
              <SiteIcon
                :name="parcelIcon"
                class="id-icon"
              />
              {{ parcel.id }}
            </a>

            <div
              v-if="ownersByParcelId?.[parcel.id] || listingsByParcelId?.[parcel.id] || auctionsByParcelId?.[parcel.id]"
              class="parcel-owner"
            >
              <EthIcon
                :address="ownersByParcelId?.[parcel.id] || listingsByParcelId?.[parcel.id].seller || auctionsByParcelId?.[parcel.id].highestBidder"
                style="width: 15px"
                :title="`Owner: ${ownersByParcelId?.[parcel.id] || listingsByParcelId?.[parcel.id].seller || auctionsByParcelId?.[parcel.id].highestBidder}`"
              />
            </div>

            <div class="parcel-district">
              D{{ parcel.district }}
            </div>

            <div class="parcel-size">
              &nbsp;{{ parcel.sizeLabel }}
            </div>

            <ParcelBoosts
              v-if="parcel.hasBoost"
              :fomo="parcel.fomoBoost"
              :fud="parcel.fudBoost"
              :alpha="parcel.alphaBoost"
              :kek="parcel.kekBoost"
              class="parcel-boosts"
            />

            <div class="parcel-name">
              {{ parcel.parcelHash }}
            </div>

            <div
              class="parcel-auction"
              v-if="auctionsByParcelId?.[parcel.id]"
            >
              <a
                :href="`https://gotchiverse.io/auction?tokenId=${parcel.id}`"
                target="_blank"
              >
                <span>
                  Last bid:
                  <NumberDisplay :number="auctionsByParcelId[parcel.id].highestBidGhst" />
                  GHST
                </span>
                <SiteIcon name="open-window" :size="13" />
              </a>
              <span class="parcel-auction__time">
                (<DateFriendly :date="new Date(auctionsByParcelId[parcel.id].lastBidTime * 1000)" />)
              </span>
            </div>

            <div
              class="parcel-baazaar"
              v-if="listingsByParcelId?.[parcel.id] || salesByParcelId?.[parcel.id] || gbmListingsByParcelId?.[parcel.id] || gbmSalesByParcelId?.[parcel.id]"
            >
              <div
                v-if="listingsByParcelId?.[parcel.id]"
                class="parcel-baazaar-listing parcel-baazaar-listing--current"
              >
                <a
                  :href="getBaazaarParcelUrl({ listingId: listingsByParcelId[parcel.id].id, network: listingsByParcelId[parcel.id].network })"
                  target="_blank"
                >
                  <span>
                    Listed in Baazaar at
                    <NumberDisplay :number="listingsByParcelId[parcel.id].priceInGhst" />
                    GHST
                  </span>
                  <SiteIcon name="open-window" :size="13" />
                </a>
                <span class="parcel-baazaar-listing__time">
                  (<DateFriendly :date="listingsByParcelId[parcel.id].dateCreated" />)
                </span>
              </div>
              <div
                v-if="gbmListingsByParcelId?.[parcel.id]"
                class="parcel-baazaar-listing parcel-baazaar-listing--current"
              >
                <a
                  :href="getGBMParcelUrl({ listingId: gbmListingsByParcelId[parcel.id].id, network: gbmListingsByParcelId[parcel.id].network})"
                  target="_blank"
                >
                  <span>
                    GBM Last Bid
                    <NumberDisplay :number="gbmListingsByParcelId[parcel.id].highestBidGhst" />
                    GHST
                  </span>
                  <SiteIcon name="open-window" :size="13" />
                </a>
                <span class="parcel-baazaar-listing__time">
                  <DateFriendly :date="gbmListingsByParcelId[parcel.id].dateLastBid" enableToggle />
                  (start <DateFriendly :date="gbmListingsByParcelId[parcel.id].dateCreated" />,
                  ends <DateFriendly :date="gbmListingsByParcelId[parcel.id].dateEnds" enableToggle />)
                </span>
              </div>
              <div
                v-if="salesByParcelId?.[parcel.id]"
                class="parcel-baazaar-listing parcel-baazaar-listing--last-sold"
              >
                <a
                  :href="getBaazaarParcelUrl({ listingId: salesByParcelId[parcel.id].id, network: salesByParcelId[parcel.id].network })"
                  target="_blank"
                >
                  <span>
                    Last sold in Baazaar for
                    <NumberDisplay :number="salesByParcelId[parcel.id].priceInGhst" />
                    GHST
                  </span>
                  <SiteIcon name="open-window" :size="13" />
                </a>
                <span class="parcel-baazaar-listing__time">
                  (<DateFriendly :date="salesByParcelId[parcel.id].datePurchased" />)
                </span>
              </div>
              <div
                v-if="gbmSalesByParcelId?.[parcel.id]"
                class="parcel-baazaar-listing parcel-baazaar-listing--last-sold"
              >
                <a
                  :href="getGBMParcelUrl({ listingId: gbmSalesByParcelId[parcel.id].id, network: gbmSalesByParcelId[parcel.id].network, isFinished: true })"
                  target="_blank"
                >
                  <span>
                    Last sold in GBM for
                    <NumberDisplay :number="gbmSalesByParcelId[parcel.id].highestBidGhst" />
                    GHST
                  </span>
                  <SiteIcon name="open-window" :size="13" />
                </a>
                <span class="parcel-baazaar-listing__time">
                  (<DateFriendly :date="gbmSalesByParcelId[parcel.id].datePurchased" />)
                </span>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <PagingControls
        v-model="paging"
        :numItems="numParcels"
        itemsLabel="parcels"
      />
    </template>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { sort } from 'fast-sort'
import { getBaazaarParcelUrl, getGBMParcelUrl } from '@/data/urlUtils'
import DateFriendly from '@/common/DateFriendly.vue'
import EthIcon from '@/common/EthIcon.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import PagingControls from '@/common/PagingControls.vue'
import ParcelBoosts from './ParcelBoosts.vue'

export default {
  components: {
    EthIcon,
    DateFriendly,
    NumberDisplay,
    PagingControls,
    ParcelBoosts
  },
  props: {
    parcels: { type: Array, default: () => [] },
    ownersByParcelId: { type: Object, default: null },
    listingsByParcelId: { type: Object, default: null },
    salesByParcelId: { type: Object, default: null },
    gbmListingsByParcelId: { type: Object, default: null },
    gbmSalesByParcelId: { type: Object, default: null },
    auctionsByParcelId: { type: Object, default: null },
    selectedParcelId: { type: String, default: null },
    parcelIcon: { type: String, default: 'info' },
    /* ideally we would use container queries. But this 'compact' hint will do for now. */
    compact: { type: Boolean, default: false },
    disableSorting: { type: Boolean, default: false }
  },
  setup (props) {
    const numParcels = computed(() => props.parcels.length)

    const paging = ref({
      page: 0,
      pageSize: 100
    })
    const LIST_PARCELS_ORDERS = []
    if (!props.disableSorting) {
      if (props.auctionsByParcelId) {
        LIST_PARCELS_ORDERS.push({
          id: 'auctionPrice',
          label: 'Cheapest Parcels (Auction)',
          sort: { asc: p => props.auctionsByParcelId[p.id]?.highestBidGhst - 0 }
        })
        LIST_PARCELS_ORDERS.push({
          id: 'auctionDate',
          label: 'Recent Bids (Auction)',
          sort: { desc: p => props.auctionsByParcelId[p.id]?.lastBidTime - 0 }
        })
      }
      if (props.listingsByParcelId) {
        LIST_PARCELS_ORDERS.push({
          id: 'listingPrice',
          label: 'Cheapest Listings (Baazaar)',
          sort: { asc: p => props.listingsByParcelId[p.id]?.priceInGhstJsNum }
        })
        LIST_PARCELS_ORDERS.push({
          id: 'listingDate',
          label: 'Recent Listings (Baazaar)',
          sort: { desc: p => props.listingsByParcelId[p.id]?.dateCreated }
        })
      }
      if (props.salesByParcelId) {
        LIST_PARCELS_ORDERS.push({
          id: 'salePrice',
          label: 'Cheapest Sales (Baazaar)',
          sort: { asc: p => props.salesByParcelId[p.id]?.priceInGhstJsNum }
        })
        LIST_PARCELS_ORDERS.push({
          id: 'saleDate',
          label: 'Recent Sales (Baazaar)',
          sort: { desc: p => props.salesByParcelId[p.id]?.datePurchased }
        })
      }
      if (props.gbmListingsByParcelId) {
        LIST_PARCELS_ORDERS.push({
          id: 'gbmListingPrice',
          label: 'Cheapest Listings (GBM)',
          sort: { asc: p => props.gbmListingsByParcelId[p.id]?.highestBidGhstJsNum }
        })
        LIST_PARCELS_ORDERS.push({
          id: 'gbmListingCreatedDate',
          label: 'Recently added (GBM)',
          sort: { desc: p => props.gbmListingsByParcelId[p.id]?.dateCreated }
        })
        LIST_PARCELS_ORDERS.push({
          id: 'gbmListingLastBid',
          label: 'Recent Bids (GBM)',
          sort: { desc: p => props.gbmListingsByParcelId[p.id]?.lastBidTime }
        })
        LIST_PARCELS_ORDERS.push({
          id: 'gbmListingEndDate',
          label: 'Ending Soon (GBM)',
          sort: { asc: p => props.gbmListingsByParcelId[p.id]?.dateEnds }
        })
      }
      if (props.gbmSalesByParcelId) {
        LIST_PARCELS_ORDERS.push({
          id: 'gbmSalePrice',
          label: 'Cheapest Sales (GBM)',
          sort: { asc: p => props.gbmSalesByParcelId[p.id]?.highestBidGhstJsNum }
        })
        LIST_PARCELS_ORDERS.push({
          id: 'gbmSaleDate',
          label: 'Recent Sales (GBM)',
          sort: { desc: p => props.gbmSalesByParcelId[p.id]?.datePurchased }
        })
      }
    }

    const listParcelsOrder = ref(LIST_PARCELS_ORDERS[0]?.id)

    watch(
      () => numParcels.value,
      () => { paging.value.page = 0 }
    )

    const listParcels = computed(() => {
      return sort(props.parcels).by([
        LIST_PARCELS_ORDERS.find(entry => entry.id === listParcelsOrder.value)?.sort || { asc: p => p.district - 0 },
        { asc: p => p.district - 0 },
        { asc: p => p.id - 0 }
      ])
    })

    const listParcelsToDisplay = computed(() => {
      const start = paging.value.page * paging.value.pageSize
      const end = start + paging.value.pageSize
      return listParcels.value.slice(start, end)
    })

    return {
      numParcels,
      paging,
      LIST_PARCELS_ORDERS,
      listParcelsOrder,
      listParcelsToDisplay,
      getBaazaarParcelUrl,
      getGBMParcelUrl
    }
  }
}
</script>

<style>
  /* global styles for color scheme */
  .parcels-list {
    --humble-color--r: 75;
    --humble-color--g: 117;
    --humble-color--b: 197;
    --humble-color: rgb(var(--humble-color--r), var(--humble-color--g), var(--humble-color--b));
    --humble-color-bg--a: 0.15;
    --humble-color-bg: rgb(var(--humble-color--r), var(--humble-color--g), var(--humble-color--b), var(--humble-color-bg--a));
    --reasonable-color--r: 0;
    --reasonable-color--g: 110;
    --reasonable-color--b: 82;
    --reasonable-color: rgb(var(--reasonable-color--r), var(--reasonable-color--g), var(--reasonable-color--b));
    --reasonable-color-bg--a: 0.15;
    --reasonable-color-bg: rgb(var(--reasonable-color--r), var(--reasonable-color--g), var(--reasonable-color--b), var(--reasonable-color-bg--a));
    --spacious-color--r: 81;
    --spacious-color--g: 0;
    --spacious-color--b: 162;
    --spacious-color: rgb(var(--spacious-color--r), var(--spacious-color--g), var(--spacious-color--b));
    --spacious-color-bg--a: 0.15;
    --spacious-color-bg: rgb(var(--spacious-color--r), var(--spacious-color--g), var(--spacious-color--b), var(--spacious-color-bg--a));
  }

  .site-dark-mode .parcels-list {
    --humble-color-bg--a: 0.2;
    --reasonable-color-bg--a: 0.2;
    --spacious-color-bg--a: 0.2;
  }
</style>
<style scoped>
  .parcels-list {
    list-style-type: none;
    margin: 20px 0;
    padding: 0;
  }

  .parcels-list-item {
    --parcel-width: 50%;
    --parcel-color: black;
    --parcel-color-bg: rgba(0,0,0,0.15);

    position: relative;
    display: grid;
    grid-template-columns: auto minmax(10px, 1fr);
    column-gap: 8px;

    margin: 0 0 15px 0;
    border: 1px solid rgba(0,0,0,0);
    border-left-width: 4px;
    border-left-color: var(--parcel-color-bg);
    padding: 8px 20px 8px 8px;
    background: linear-gradient(to right, var(--parcel-color-bg), transparent var(--parcel-width), transparent 100%);
    background-clip: padding-box;
  }
  .parcels-list-item--selected {
    border-top-width: 1px;
    border-bottom-width: 1px;
    border-right-width: 1px;
    border-color: var(--parcel-color-bg);
    border-left-color: var(--site-selection-background-color);
  }
  .parcel-details {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    column-gap: 10px;
    row-gap: 8px;
  }
  .parcels-list-item.parcel-size--humble {
    --parcel-width: 10%;
    --parcel-color: var(--humble-color);
    --parcel-color-bg: var(--humble-color-bg);
  }
  .parcels-list-item.parcel-size--reasonable {
    --parcel-width: 30%;
    --parcel-color: var(--reasonable-color);
    --parcel-color-bg: var(--reasonable-color-bg);
  }
  .parcels-list-item.parcel-size--spacious {
    --parcel-width: 100%;
    --parcel-color: var(--spacious-color);
    --parcel-color-bg: var(--spacious-color-bg);
  }

  .parcels-list-item .parcel-index {
    opacity: 0.3;
  }
  .parcels-list-item .parcel-size {
    text-transform: capitalize;
  }
  .parcels-list-item .parcel-name {
    font-family: monospace;
    font-size: 0.9em;
  }
  .parcels-list-item .parcel-auction,
  .parcels-list-item .parcel-baazaar {
    width: 100%;
  }
  .parcels-list--compact .parcels-list-item .parcel-name {
    width: 100%;
  }
  .parcels-list-item a.parcel-id,
  .parcels-list-item .parcel-auction a,
  .parcels-list-item .parcel-baazaar-listing a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .parcels-list-item a.parcel-id .id-icon {
    margin-top: -3px;
  }
  .parcel-auction__time,
  .parcel-baazaar-listing__time {
    margin-left: 5px;
    font-size: 0.85em;
    color: var(--site-text-color--subtle);
  }
</style>
