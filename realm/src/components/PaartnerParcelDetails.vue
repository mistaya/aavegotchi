<template>
  <div
    v-if="paartnerDetails"
    class="paartner-parcel-details site-card"
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

    <h2 style="margin: 0 0 10px 0">Paartner Parcel:</h2>

    <div style="display: flex; flex-wrap: wrap">
      <img
        :src="paartnerDetails.logoUrl"
        class="paartner-logo"
      />

      <div style="margin: 15px 0;font-weight: bold;">
        {{ paartnerDetails.label }}
      </div>
    </div>

    <div
      v-if="paartnerDetails.website"
      style="font-weight: bold;"
      class="word-break"
    >
      <a
        :href="paartnerDetails.website"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        {{ paartnerDetails.website }}
      </a>
    </div>

    <div
      v-if="paartnerDetails.twitter"
      style="margin-bottom: 15px; font-weight: bold;"
    >
      <a
        :href="`https://twitter.com/${paartnerDetails.twitter}`"
        target="_blank"
        rel="nofollow noopener noreferrer"
        title="twitter"
      >
        @{{ paartnerDetails.twitter }} twitter
      </a>
    </div>

    <template v-if="parcel">
      <template v-if="parcel.fullParcel">
        <div>
          <span class="parcel-details__label">ID:</span>
          {{ parcel.fullParcel.id }}
        </div>

        <div>
          <span class="parcel-details__label">Name:</span>
          <span class="parcel-name">{{ parcel.fullParcel.parcelHash }}</span>
        </div>

        <div>
          <span class="parcel-details__label">District:</span>
          {{ parcel.fullParcel.district }}
        </div>

        <div>
          <span class="parcel-details__label">Boosts:</span>
          <ParcelBoosts
            v-if="parcel.fullParcel.hasBoost"
            :fud="parcel.fullParcel.fudBoost"
            :fomo="parcel.fullParcel.fomoBoost"
            :alpha="parcel.fullParcel.alphaBoost"
            :kek="parcel.fullParcel.kekBoost"
          />
          <template v-else>
            None
          </template>
        </div>
      </template>

      <div
        class="parcel-coords"
      >
        Coordinates:
        ({{ parcel.x }},
        {{ parcel.y }})
        <br>Gotchiverse Coords:
        ({{ parcel.x * 64 }},
        {{ parcel.y * 64 }})
        <br>Dimensions: 64 x 64
      </div>
    </template>
  </div>
</template>

<script>
import { computed } from 'vue'
import PAARTNER_DETAILS from '@/data/parcels/paartners.json'
import PAARTNER_PARCELS from '@/data/parcels/paartnerParcels.json'
import useParcels from '@/data/useParcels'
import ParcelBoosts from './ParcelBoosts.vue'

export default {
  components: {
    ParcelBoosts
  },
  props: {
    paartner: { type: String, required: true }
  },
  setup (props) {
    const { parcelsById, fetchStatus: parcelsFetchStatus } = useParcels()

    const paartnerDetails = computed(() => {
      const details = PAARTNER_DETAILS[props.paartner]
      const logoUrl = `/paartners/${details.id}.${details.logo}`
      return {
        ...details,
        logoUrl
      }
    })
    const parcel = computed(() => {
      let pParcel = PAARTNER_PARCELS.find(parcel => parcel.paartner === props.paartner)
      if (pParcel.parcelId && parcelsFetchStatus.value.loaded) {
        const fullParcel = parcelsById.value[pParcel.parcelId]
        if (fullParcel) {
          pParcel = {
            ...pParcel,
            fullParcel
          }
        }
      }
      return pParcel
    })

    return {
      paartnerDetails,
      parcel
    }
  }
}
</script>

<style scoped>
  .paartner-parcel-details {
    position: relative;
    display: grid;
    row-gap: 8px;
    padding: 10px 10px 15px 15px;
  }

  .paartner-logo {
    float: left;
    max-width: 50%;
    max-height: 50px;
    margin-right: 15px;
    margin-bottom: 10px;
  }

  .parcel-details__label {
    margin-right: 5px;
    font-size: 0.9em;
    color: var(--site-text-color--subtle);
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
</style>
