<template>
  <div>
    <h1>Citaadel Map</h1>

    <div class="layout-container">
      <div class="map-sidebar-container">
        <section>
          <h2>Map Config</h2>

          <h3>Auction Data</h3>

          <div style="font-style: italic">
            Latest auction fetched:
            <br>
            #{{ mostRecentAuction.tokenId }}
            at {{ mostRecentAuctionDate }}
          </div>

          <div style="margin: 10px 0 20px 0">
            <button
              type="button"
              :disabled="!canSubmitAuctionsFetch"
              @click="fetchAuctions"
            >
              Fetch
            </button>
            <span v-if="auctionsFetchStatus.loading">
              loading...
            </span>
            <span v-if="auctionsFetchStatus.error">
              Error: {{ auctionsFetchStatus.errorMessage }}
            </span>
          </div>

          <h3>Color by Bid (GHST)</h3>

          <div
            v-for="size in ['humble', 'reasonable', 'spacious']"
            :key="size"
            style="margin-bottom: 20px;"
          >
            <h4 style="text-transform: capitalize;">
              {{ size }}:
            </h4>
            <div style="margin-bottom: 10px">
              <label>
                Color Scheme:
                <select v-model="scaleConfigBySize[size].scaleName">
                  <option
                    v-for="scaleName in availableScales"
                    :key="scaleName"
                    :value="scaleName"
                  >
                    {{ scaleName }}
                  </option>
                </select>
              </label>
              <div
                class="scale-color-display"
                :style="{
                  'background': scaleGradientsByName[scaleConfigBySize[size].scaleName]
                }"
              />
            </div>
            <div>
              <label>
                Min:
                <input
                  v-model="scaleConfigBySize[size].min"
                  type="number"
                  class="scale-range-input"
                />
              </label>
              <label>
                Max:
                <input
                  v-model="scaleConfigBySize[size].max"
                  type="number"
                  class="scale-range-input"
                />
              </label>
            </div>
          </div>
        </section>

        <section ref="parcelDetailsRef">
          <div
            v-if="selectedParcel"
            class="selected-parcel-details"
          >
            <h2>Selected Parcel details:</h2>

            ID: {{ selectedParcel.id }}
            <br>Size: {{ selectedParcel.sizeLabel }}
            <br>Name: {{ selectedParcel.parcelHash }}
            <div v-if="selectedParcel.hasAuction">
              <a
                :href="`https://gotchiverse.io/auction?tokenId=${selectedParcel.id}`"
                target="_blank"
              >
                Current bid: {{ selectedParcel.highestBidGhst }} GHST
              </a>
            </div>
            <div>
              Boosts:
              <div style="margin-left: 10px">
                <template v-if="selectedParcel.hasBoost">
                  <div v-if="selectedParcel.fudBoost !== '0'">
                    FUD: {{ selectedParcel.fudBoost }}
                  </div>
                  <div v-if="selectedParcel.fomoBoost !== '0'">
                    FOMO: {{ selectedParcel.fomoBoost }}
                  </div>
                  <div v-if="selectedParcel.alphaBoost !== '0'">
                    ALPHA: {{ selectedParcel.alphaBoost }}
                  </div>
                  <div v-if="selectedParcel.kekBoost !== '0'">
                    KEK: {{ selectedParcel.kekBoost }}
                  </div>
                </template>
                <template v-else>
                  None
                </template>
              </div>
            </div>
          </div>
        </section>

      </div>
      <svg
        ref="svgRef"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 9000 6000"
        class="map-svg"
      >
        <a
          v-for="parcel in parcelsToDisplay"
          :key="parcel.id"
          xlink:href="#"
          @click.prevent="onClickParcel(parcel)"
        >
          <rect
            :x="parcel.coordinateX"
            :y="parcel.coordinateY"
            :width="parcel.sizeLabel === 'humble' ? 8 : parcel.sizeLabel === 'reasonable' ? 16 : parcel.vertical ? 32 : 64"
            :height="parcel.sizeLabel === 'humble' ? 8 : parcel.sizeLabel === 'reasonable' ? 16 : parcel.vertical ? 64 : 32"
            stroke="#777"
            :fill="parcel.color"
          />
        </a>
      </svg>
    </div>

    <div style="display: none">
      <router-link :to="{ name: 'config-data' }">Config Data</router-link>
      |
      <router-link :to="{ name: 'config-parcels' }">Config Parcels</router-link>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import useParcels from '@/data/useParcels'
import useAuctions from '@/data/useAuctions'
import svgPanZoom from 'svg-pan-zoom'
import { scaleSequential } from 'd3-scale'
import { interpolateViridis, interpolateBlues, interpolateInferno, interpolateCividis, interpolateSpectral, interpolateTurbo } from 'd3-scale-chromatic'
import { format } from 'date-fns'

const scalesByName = {
  grey: () => '#eee',
  viridis: interpolateViridis,
  blues: interpolateBlues,
  inferno: interpolateInferno,
  cividis: interpolateCividis,
  spectral: interpolateSpectral,
  turbo: interpolateTurbo
}
const AVAILABLE_SCALES = Object.keys(scalesByName)
const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
const generateGradient = function (scale) {
  const colors = steps.map(value => scale(value))
  return `linear-gradient(90deg, ${colors.join(', ')})`
}
const scaleGradientsByName = Object.fromEntries(
  AVAILABLE_SCALES.map(name => [name, generateGradient(scalesByName[name])])
)
const sizeLabels = ['humble', 'reasonable', 'spacious', 'spacious']

const DISTRICTS_TO_DISPLAY = ['1', '7', '8', '9', '10', '11', '12', '27', '28', '29', '30']

export default {
  setup () {
    const svgRef = ref(null)
    const parcelDetailsRef = ref(null)
    const selectedParcelId = ref(null)
    const { parcelsById } = useParcels()
    const {
      auctionsByParcelId,
      mostRecentAuction,
      canSubmitFetch: canSubmitAuctionsFetch,
      fetchStatus: auctionsFetchStatus,
      fetchAuctions
    } = useAuctions()
    const mostRecentAuctionDate = computed(() => {
      if (!mostRecentAuction.value) { return }
      return format(new Date(mostRecentAuction.value.lastBidTime * 1000), 'yyyy/MM/dd HH:mm:ss')
    })
    const scaleConfigBySize = ref({
      humble: {
        min: 88,
        max: 500,
        scaleName: 'viridis'
      },
      reasonable: {
        min: 180,
        max: 1000,
        scaleName: 'viridis'
      },
      spacious: {
        min: 1025,
        max: 3000,
        scaleName: 'viridis'
      }
    })
    const scalesBySize = computed(() => {
      const scales = {}
      for (const key in scaleConfigBySize.value) {
        const config = scaleConfigBySize.value[key]
        scales[key] = scaleSequential(scalesByName[config.scaleName]).domain([config.min, config.max])
      }
      return scales
    })

    const getColorForPrice = function (price, sizeLabel) {
      const scale = scalesBySize.value[sizeLabel]
      if (!scale) { return 'white' }
      return scale(price)
    }

    const getParcelDetails = function (parcel) {
      if (!parcel) { return null }
      const auction = auctionsByParcelId.value[parcel.id]
      const highestBidGhst = auction?.highestBidGhst || ''
      const sizeLabel = sizeLabels[parcel.size]
      const vertical = parcel.size === '2'
      return {
        ...parcel,
        sizeLabel,
        vertical,
        hasAuction: !!auction,
        highestBidGhst,
        color: auction ? getColorForPrice(highestBidGhst, sizeLabel) : 'white',
        hasBoost: parcel.fudBoost !== '0' || parcel.fomoBoost !== '0' || parcel.alphaBoost !== '0' || parcel.kekBoost !== '0'
      }
    }

    const parcelsToDisplay = computed(() => {
      return Object.values(parcelsById.value).filter(parcel =>
        DISTRICTS_TO_DISPLAY.includes(parcel.district)
      ).map(getParcelDetails)
    })

    const onClickParcel = function (parcel) {
      selectedParcelId.value = parcel.id
      parcelDetailsRef.value.scrollIntoView(false)
    }
    const selectedParcel = computed(() =>
      getParcelDetails(
        parcelsById.value[selectedParcelId.value]
      )
    )

    onMounted(() => {
      svgPanZoom(svgRef.value, {
        dblClickZoomEnabled: false
      })
    })
    return {
      svgRef,
      parcelDetailsRef,
      parcelsToDisplay,
      onClickParcel,
      selectedParcel,
      mostRecentAuction,
      mostRecentAuctionDate,
      canSubmitAuctionsFetch,
      fetchAuctions,
      auctionsFetchStatus,
      scaleConfigBySize,
      availableScales: AVAILABLE_SCALES,
      scaleGradientsByName
    }
  }
}
</script>

<style scoped>
  .layout-container {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
  @media (max-width: 800px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }

  .scale-color-display {
    margin-top: 5px;
    width: 80%;
    height: 20px;
  }
  .scale-range-input {
    width: 60px;
  }

  .map-svg {
    border: 1px solid #ccc;
    width: 100%;
    aspect-ratio: 9 / 6
  }

  .selected-parcel-details {
    margin: 20px 10px 0 0;
    border: 1px solid #ccc;
    padding: 10px;
  }
</style>
