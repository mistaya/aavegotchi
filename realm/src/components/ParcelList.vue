<template>
  <div>
    <template v-if="!listParcelsToDisplay.length">
      No parcels found.
    </template>
    <template v-else>
      <div style="margin-top: 20px; margin-left: 10px;">
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
      <ul class="parcels-list">
        <li
          v-for="(parcel, index) in listParcelsToDisplay"
          :key="parcel.id"
          class="parcels-list-item"
          :class="`parcel-size--${parcel.sizeLabel.toLowerCase()}`"
        >
          <div class="parcel-index">
            {{ (paging.page * paging.pageSize) + index + 1 }}.
          </div>
          <div class="parcel-info">
            <div>
              <a
                href="#"
                class="parcel-id"
                @click.prevent="$emit('click:parcel', parcel)"
              >
                {{ parcel.id }}
              </a>
              <span class="parcel-name">
                {{ parcel.parcelHash }}
              </span>
              <span
                v-if="ownersByParcelId?.[parcel.id] || listingsByParcelId?.[parcel.id] || auctionsByParcelId?.[parcel.id]"
                class="parcel-owner"
              >
                <EthIcon
                  :address="ownersByParcelId?.[parcel.id] || listingsByParcelId?.[parcel.id].seller || auctionsByParcelId?.[parcel.id].highestBidder"
                  style="width: 15px"
                  :title="`Owner: ${ownersByParcelId?.[parcel.id] || listingsByParcelId?.[parcel.id].seller || auctionsByParcelId?.[parcel.id].highestBidder}`"
                />
              </span>
            </div>

            <div>
              <span class="parcel-district">
                D{{ parcel.district }}
              </span>
              <span class="parcel-size">
                &nbsp;{{ parcel.sizeLabel }}
              </span>
              <ParcelBoosts
                v-if="parcel.hasBoost"
                :fomo="parcel.fomoBoost"
                :fud="parcel.fudBoost"
                :alpha="parcel.alphaBoost"
                :kek="parcel.kekBoost"
                class="parcel-boosts"
              />
            </div>
          </div>
          <div
            class="parcel-auction"
            v-if="auctionsByParcelId?.[parcel.id]"
          >
            <a
              :href="`https://gotchiverse.io/auction?tokenId=${parcel.id}`"
              target="_blank"
            >
              Last bid: {{ auctionsByParcelId[parcel.id].highestBidGhst }} GHST
              (<DateFriendly :date="new Date(auctionsByParcelId[parcel.id].lastBidTime * 1000)" />)
            </a>
          </div>
          <div
            class="parcel-baazaar"
            v-if="listingsByParcelId?.[parcel.id] || salesByParcelId?.[parcel.id]"
          >
            <div
              v-if="listingsByParcelId?.[parcel.id]"
              class="parcel-baazaar-listing parcel-baazaar-listing--current"
            >
              <a
                :href="`https://app.aavegotchi.com/baazaar/erc721/${listingsByParcelId[parcel.id].id}`"
                target="_blank"
              >
                <span>
                  Listed for {{ listingsByParcelId[parcel.id].priceInGhst.toString() }} GHST
                </span>
                <SiteIcon name="open-window" />
              </a>
              (<DateFriendly :date="listingsByParcelId[parcel.id].dateCreated" />)
            </div>
            <div
              v-if="salesByParcelId[parcel.id]"
              class="parcel-baazaar-listing parcel-baazaar-listing--last-sold"
            >
              <a
                :href="`https://app.aavegotchi.com/baazaar/erc721/${salesByParcelId[parcel.id].id}`"
                target="_blank"
              >
                <span>
                  Last sold for {{ salesByParcelId[parcel.id].priceInGhst.toString() }} GHST
                </span>
                <SiteIcon name="open-window" />
              </a>
              (<DateFriendly :date="salesByParcelId[parcel.id].datePurchased" />)
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
import DateFriendly from './DateFriendly.vue'
import EthIcon from './EthIcon.vue'
import PagingControls from './PagingControls.vue'
import ParcelBoosts from './ParcelBoosts.vue'

export default {
  components: {
    EthIcon,
    DateFriendly,
    PagingControls,
    ParcelBoosts
  },
  props: {
    parcels: { type: Array, default: () => [] },
    ownersByParcelId: { type: Object, default: null },
    listingsByParcelId: { type: Object, default: null },
    salesByParcelId: { type: Object, default: null },
    auctionsByParcelId: { type: Object, default: null }
  },
  setup (props) {
    const numParcels = computed(() => props.parcels.length)

    const paging = ref({
      page: 0,
      pageSize: 100
    })
    const LIST_PARCELS_ORDERS = []
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
      listParcelsToDisplay
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
    margin: 0 0 10px 0;
    padding: 7px 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    background: linear-gradient(to right, var(--parcel-color-bg), transparent var(--parcel-width), transparent 100%);
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
    padding-top: 10px;
    opacity: 0.3;
  }
  .parcels-list-item .parcel-info > div {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 2px 0;
  }
  .parcels-list-item .parcel-name {
    font-family: monospace;
  }
  .parcels-list-item .parcel-district {
    margin-right: 5px;
  }
  .parcels-list-item .parcel-size {
    margin-right: 10px;
  }
  .parcels-list-item .parcel-size {
    text-transform: capitalize;
  }
  .parcels-list-item .parcel-auction,
  .parcels-list-item .parcel-baazaar {
    padding-top: 3px;
  }
  .parcels-list-item .parcel-baazaar-listing .icon {
    width: 13px;
  }
  .parcels-list-item .parcel-baazaar-listing a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .parcels-list-item .parcel-baazaar-listing a > * {
    flex: 0 0 auto;
  }
</style>
