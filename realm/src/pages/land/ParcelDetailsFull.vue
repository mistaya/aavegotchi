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
          :href="`https://app.aavegotchi.com/baazaar/erc721/${parcelListing.id}`"
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

      <div style="margin-bottom: 10px;">
        <span style="margin-right: 10px;">Owner:</span>
        <EthAddress
          :address="parcelDetails.owner"
          icon
        />
      </div>

      <div style="margin-bottom: 10px;">
        <span style="text-transform: capitalize;">{{ parcelDetails.sizeLabel }}</span>,
        District
        {{ parcelDetails.district }}
        <br>
        Coordinates:
        ({{ parcelDetails.coordinateX }},
        {{ parcelDetails.coordinateY }})
        <br>
        Gotchiverse Coords:
        ({{ parcelDetails.coordinateX * 64 }},
        {{ parcelDetails.coordinateY * 64 }})
        <br>Dimensions: {{ parcelDetails.width }} x {{ parcelDetails.height }}
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
          <h3>Installations and Tiles</h3>
        </summary>
        <ParcelDetailsInstallations
          :id="parcelId"
          :sizeNum="parcelDetails.size"
        />
      </details>
    </template>
  </div>
</template>

<script>
import useParcelDetailsSingle from '@/data/useParcelDetailsSingle'
import useParcelBaazaarListingSingle from '@/data/useParcelBaazaarListingSingle'
import DateFriendly from '@/common/DateFriendly.vue'
import EthAddress from '@/common/EthAddress.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import ParcelBoosts from './ParcelBoosts.vue'
import ParcelDetailsInstallations from './ParcelDetailsInstallations.vue'
import ParcelDetailsAlchemica from './ParcelDetailsAlchemica.vue'

export default {
  components: {
    DateFriendly,
    EthAddress,
    NumberDisplay,
    ParcelBoosts,
    ParcelDetailsInstallations,
    ParcelDetailsAlchemica
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

    return {
      fetchStatus,
      parcelDetails,
      listingFetchStatus,
      parcelListing
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
