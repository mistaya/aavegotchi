<template>
  <div v-if="!parcelId">
    No parcel specified!
  </div>
  <div v-else>
    <h2>
      Parcel {{ parcelId }}
      <template v-if="fetchStatus.loaded">
        {{ parcelDetails.parcelHash }}
      </template>
    </h2>

    <template v-if="fetchStatus.loading">
      Loading...
    </template>
    <template v-else-if="fetchStatus.error">
      <div class="site-alertbox site-alertbox--warning">
        <SiteIcon name="warning-triangle" />
        <div>
          Error fetching parcel details
        </div>
      </div>
    </template>
    <template v-else-if="fetchStatus.loaded">

      <template v-if="listingFetchStatus.error">
        <div class="site-alertbox site-alertbox--warning">
          <SiteIcon name="warning-triangle" />
          <div>
            Error fetching parcel baazaar listing
          </div>
        </div>
      </template>
      <div
        v-else-if="listingFetchStatus.loaded && parcelListing"
        style="margin-bottom: 10px;"
      >
        <span>Listed on Baazaar:</span>
        <a
          :href="`https://dapp.aavegotchi.com/baazaar/parcels?id=${parcelListing.id}`"
          target="_blank"
          style="margin-left: 5px;"
        >
          <NumberDisplay :number="parcelListing.priceInGhst" />
          GHST
          <SiteIcon name="open-window" :size="13" />
        </a>
        <span style="margin-left: 5px">
          (<DateFriendly :date="parcelListing.dateCreated" />)
        </span>
      </div>

      <template v-if="gbmListingFetchStatus.error">
        <div class="site-alertbox site-alertbox--warning">
          <SiteIcon name="warning-triangle" />
          <div>
            Error fetching parcel GBM listing
          </div>
        </div>
      </template>
      <div
        v-else-if="gbmListingFetchStatus.loaded && parcelGBMListing"
        style="margin-bottom: 10px;"
      >
        <span>GBM Auction:</span>
        <a
          :href="`https://dapp.aavegotchi.com/auction?contract=${parcelGBMListing.contractAddress}&id=${parcelGBMListing.id}`"
          target="_blank"
          style="margin-left: 5px;"
        >Last Bid
          <NumberDisplay :number="parcelGBMListing.highestBidGhst" />
          GHST
          <SiteIcon name="open-window" :size="13" />
        </a>
        <span style="margin-left: 5px">
          <DateFriendly :date="parcelGBMListing.dateLastBid" enableToggle />
          (start <DateFriendly :date="parcelGBMListing.dateCreated" />,
          ends <DateFriendly :date="parcelGBMListing.dateEnds" enableToggle />)
        </span>
      </div>

      <div style="margin-bottom: 10px;">
        <span style="margin-right: 10px;">Owner:</span>
        <EthAddress
          :address="parcelDetails.owner"
          icon
        />
      </div>

      <template v-if="lastBaazaarSaleFetchStatus.error">
        <div class="site-alertbox site-alertbox--warning">
          <SiteIcon name="warning-triangle" />
          <div>
            Error fetching last baazaar sale
          </div>
        </div>
      </template>
      <div
        v-else-if="lastBaazaarSaleFetchStatus.loaded && lastBaazaarSale"
        style="margin-bottom: 10px;"
      >
        <span>Last Baazaar Sale:</span>
        <a
          :href="`https://dapp.aavegotchi.com/baazaar/parcels?id=${lastBaazaarSale.id}`"
          target="_blank"
          style="margin-left: 5px;"
        >
          <NumberDisplay :number="lastBaazaarSale.priceInGhst" />
          GHST
          <SiteIcon name="open-window" :size="13" />
        </a>
        <span style="margin-left: 5px">
          (<DateFriendly :date="lastBaazaarSale.datePurchased" enableToggle />)
        </span>
      </div>

      <template v-if="lastGBMSaleFetchStatus.error">
        <div class="site-alertbox site-alertbox--warning">
          <SiteIcon name="warning-triangle" />
          <div>
            Error fetching last GBM sale
          </div>
        </div>
      </template>
      <div
        v-else-if="lastGBMSaleFetchStatus.loaded && lastGBMSale"
        style="margin-bottom: 10px;"
      >
        <span>Last GBM Sale:</span>
        <a
          :href="`https://dapp.aavegotchi.com/auction?contract=${lastGBMSale.contractAddress}&id=${lastGBMSale.id}`"
          target="_blank"
          style="margin-left: 5px;"
        >
          <NumberDisplay :number="lastGBMSale.highestBidGhst" />
          GHST
          <SiteIcon name="open-window" :size="13" />
        </a>
        <span style="margin-left: 5px">
          (<DateFriendly :date="lastGBMSale.datePurchased" enableToggle />)
        </span>
      </div>

      <div style="margin-bottom: 10px;">
        <span style="text-transform: capitalize;">{{ parcelDetails.sizeLabel }}</span>,
        District
        {{ parcelDetails.district }}
        <ParcelDetailsLocation
          :parcel="parcelDetails"
        />
      </div>

      <div style="margin-bottom: 20px;">
        <span style="margin-right: 10px;">Boosts:</span>
        <ParcelBoosts
          v-if="parcelDetails.hasBoost"
          :fud="parcelDetails.fudBoost"
          :fomo="parcelDetails.fomoBoost"
          :alpha="parcelDetails.alphaBoost"
          :kek="parcelDetails.kekBoost"
        />
        <template v-else>
          None
        </template>
      </div>

      <details
        open
        class="details-section"
      >
        <summary>
          <h3>Alchemica</h3>
        </summary>
        <ParcelDetailsAlchemica
          :id="parcelId"
          :sizeNum="parcelDetails.size"
        />
      </details>

      <details
        open
        class="details-section"
      >
        <summary>
          <h3>Access Rights</h3>
        </summary>
        <ParcelDetailsAccessRights
          :parcel="parcelDetails"
        />
      </details>

      <details
        open
        class="details-section"
      >
        <summary>
          <h3>Installations and Tiles</h3>
        </summary>
        <ParcelDetailsInstallations
          :id="parcelId"
          :sizeNum="parcelDetails.size"
          includeFarming
        />
      </details>
    </template>
  </div>
</template>

<script>
import useParcelDetailsSingle from '@/data/useParcelDetailsSingle'
import useParcelBaazaarListingSingle from '@/data/useParcelBaazaarListingSingle'
import useParcelBaazaarLastSaleSingle from '@/data/useParcelBaazaarLastSaleSingle'
import useParcelGBMListingSingle from '@/data/useParcelGBMListingSingle'
import useParcelGBMLastSaleSingle from '@/data/useParcelGBMLastSaleSingle'
import DateFriendly from '@/common/DateFriendly.vue'
import EthAddress from '@/common/EthAddress.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import ParcelBoosts from './ParcelBoosts.vue'
import ParcelDetailsInstallations from './ParcelDetailsInstallations.vue'
import ParcelDetailsAlchemica from './ParcelDetailsAlchemica.vue'
import ParcelDetailsLocation from './ParcelDetailsLocation.vue'
import ParcelDetailsAccessRights from './ParcelDetailsAccessRights.vue'

export default {
  components: {
    DateFriendly,
    EthAddress,
    NumberDisplay,
    ParcelBoosts,
    ParcelDetailsInstallations,
    ParcelDetailsAlchemica,
    ParcelDetailsLocation,
    ParcelDetailsAccessRights
  },
  props: {
    parcelId: { type: String, required: true }
  },
  setup (props) {
    if (!props.parcelId) {
      return {}
    }

    const {
      parcelDetails,
      fetchStatus,
      fetchDetails
    } = useParcelDetailsSingle(props.parcelId)

    fetchDetails(props.parcelId)

    const {
      parcelListing,
      fetchStatus: listingFetchStatus,
      fetchListing
    } = useParcelBaazaarListingSingle(props.parcelId)
    fetchListing(props.parcelId)

    const {
      parcelLastSale: lastBaazaarSale,
      fetchStatus: lastBaazaarSaleFetchStatus,
      fetchLastSale: fetchLastBaazaarSale
    } = useParcelBaazaarLastSaleSingle(props.parcelId)
    fetchLastBaazaarSale(props.parcelId)

    const {
      parcelListing: parcelGBMListing,
      fetchStatus: gbmListingFetchStatus,
      fetchListing: fetchGBMListing
    } = useParcelGBMListingSingle(props.parcelId)
    fetchGBMListing(props.parcelId)

    const {
      parcelLastSale: lastGBMSale,
      fetchStatus: lastGBMSaleFetchStatus,
      fetchLastSale: fetchLastGBMSale
    } = useParcelGBMLastSaleSingle(props.parcelId)
    fetchLastGBMSale(props.parcelId)

    return {
      fetchStatus,
      parcelDetails,
      listingFetchStatus,
      parcelListing,
      lastBaazaarSaleFetchStatus,
      lastBaazaarSale,
      gbmListingFetchStatus,
      parcelGBMListing,
      lastGBMSaleFetchStatus,
      lastGBMSale
    }
  }
}
</script>

<style scoped>
  h2 {
    margin-top: 0;
  }
  .details-section {
    margin-bottom: 20px;
  }
  .details-section > summary > h3 {
    display: inline;
  }
  .details-section > :not(summary) {
    margin-left: 20px;
  }
</style>
