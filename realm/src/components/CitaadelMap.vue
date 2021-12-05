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

          <details open class="config-details">
            <summary>
              <h3>Filter by Size</h3>
            </summary>

            <div
              v-for="sizeLabel in ['humble', 'reasonable', 'spacious']"
              :key="sizeLabel"
            >
              <label>
                <input
                  v-model="filters.size[sizeLabel]"
                  type="checkbox"
                />
                <span style="text-transform: capitalize;">
                  {{ sizeLabel }}
                </span>
              </label>
            </div>
          </details>

          <details open class="config-details">
            <summary>
              <h3>Filter by Walls</h3>
            </summary>

            <div
              v-for="wallEntry in Object.values(filters.wall)"
              :key="wallEntry.id"
            >
              <label>
                <input
                  v-model="wallEntry.enabled"
                  type="checkbox"
                />
                <span style="text-transform: capitalize;">
                  {{ wallEntry.id }}
                </span>
              </label>
            </div>
          </details>

          <details class="config-details">
            <summary>
              <h3>Filter by District</h3>
            </summary>

            <div style="margin-bottom: 8px">
              <div>
                <label>
                  <input
                    v-model="filters.district.selectionMode"
                    type="radio"
                    name="selectionMode"
                    value="single"
                  />
                    Single District
                </label>
              </div>
              <div>
                <label>
                  <input
                    v-model="filters.district.selectionMode"
                    type="radio"
                    name="selectionMode"
                    value="multiple"
                  />
                    Multiple Districts
                </label>
              </div>
            </div>

            <div
              v-if="filters.district.selectionMode === 'single'"
              style="margin-left: 25px;"
            >
              <label>
                District:
                <select v-model="filters.district.selectSingle">
                  <option
                    v-for="district in filters.district.districts"
                    :key="district"
                    :value="district"
                  >
                    {{ district }}
                  </option>
                </select>
              </label>
            </div>

            <div
              v-if="filters.district.selectionMode === 'multiple'"
              style="margin-left: 20px;"
            >
              <span
                v-for="districtEntry in filters.district.selectMultiple"
                :key="districtEntry.id"
                class="config-details__district-entry"
              >
                <label>
                  <input
                    v-model="districtEntry.enabled"
                    type="checkbox"
                  />
                    {{ districtEntry.id }}
                </label>
              </span>
            </div>
          </details>

          <details class="config-details">
            <summary>
              <h3>Filter by Alchemica Boost</h3>
            </summary>

            <div
              v-for="[type, typeEntry] in Object.entries(filters.boost)"
              :key="type"
            >
              <h4 style="text-transform: uppercase;">
                {{ type }}
              </h4>

              <div>
                <div>
                  <label>
                    <input
                      v-model="typeEntry.selectionMode"
                      type="radio"
                      :name="`${type}_selectionMode`"
                      value="ignore"
                    />
                      Don't care, show all
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      v-model="typeEntry.selectionMode"
                      type="radio"
                      :name="`${type}_selectionMode`"
                      value="some"
                    />
                      With boost, any amount
                  </label>
                </div>
                <div>
                  <label>
                    <input
                      v-model="typeEntry.selectionMode"
                      type="radio"
                      :name="`${type}_selectionMode`"
                      value="range"
                    />
                      Specific range of boost
                  </label>
                </div>
              </div>

              <div
                v-if="typeEntry.selectionMode === 'range'"
                style="margin-top: 8px"
              >
                <label>
                  Min:
                  <input
                    v-model="typeEntry.selectRange.min"
                    type="number"
                    class="boost-range-input"
                  />
                </label>
                <label>
                  Max:
                  <input
                    v-model="typeEntry.selectRange.max"
                    type="number"
                    class="boost-range-input"
                  />
                </label>
              </div>
            </div>
          </details>

          <details open class="config-details">
            <summary>
              <h3>Color by Bid (GHST)</h3>
            </summary>

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
                      v-for="scaleName in AVAILABLE_SCALES"
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
          </details>
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
        :viewBox="INITIAL_DISPLAY_VIEWBOX"
        class="map-svg"
        :style="{
          'aspect-ratio': INITIAL_DISPLAY_ASPECT_RATIO
        }"
      >
        <a
          v-for="parcel in parcelsToDisplay"
          :key="parcel.id"
          xlink:href="#"
          @click.prevent="onClickParcel(parcel)"
        >
          <rect
            v-show="parcel.show"
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

// select parcels in land auction #2
const DISTRICTS_TO_DISPLAY = ['1', '7', '8', '9', '10', '11', '12', '27', '28', '29', '30']
const X_MIN_TO_DISPLAY = 5280
// const INITIAL_DISPLAY_VIEWBOX = '0 0 9000 6000'
const INITIAL_DISPLAY_VIEWBOX = '6600 1000 2500 4400'
// const INITIAL_DISPLAY_ASPECT_RATIO = '9 / 6'
const INITIAL_DISPLAY_ASPECT_RATIO = '10 / 8'

const ALCHEMICA_TYPES = ['fud', 'fomo', 'alpha', 'kek']

const WALL_INNER = {
  id: 'inner',
  innerBounds: null,
  outerBounds: {
    minX: 5200,
    maxX: 5650,
    minY: 2400,
    maxY: 3900
  }
}
const WALL_MIDDLE = {
  id: 'middle',
  innerBounds: WALL_INNER.outerBounds,
  outerBounds: {
    minX: 5200,
    maxX: 7100,
    minY: 1500,
    maxY: 4800
  }
}
const WALL_OUTER = {
  id: 'outer',
  innerBounds: WALL_MIDDLE.outerBounds,
  outerBounds: {
    minX: 5200,
    maxX: 9000,
    minY: 0,
    maxY: 6000
  }
}
const WALLS = [
  WALL_INNER,
  WALL_MIDDLE,
  WALL_OUTER
]

export default {
  setup () {
    const svgRef = ref(null)
    const parcelDetailsRef = ref(null)
    const selectedParcelId = ref(null)
    const filters = ref({
      size: {
        humble: true,
        reasonable: true,
        spacious: true
      },
      district: {
        districts: DISTRICTS_TO_DISPLAY,
        selectionMode: 'multiple', // or 'multiple'
        selectSingle: DISTRICTS_TO_DISPLAY[0],
        selectMultiple: DISTRICTS_TO_DISPLAY.map(district => ({
          id: district,
          enabled: true
        }))
      },
      wall: Object.fromEntries(WALLS.map(entry =>
        [
          entry.id,
          {
            ...entry,
            enabled: true
          }
        ]
      )),
      boost: Object.fromEntries(ALCHEMICA_TYPES.map(id =>
        [
          id,
          {
            id,
            selectionMode: 'ignore', // or 'some' or 'range'
            selectRange: { min: 1, max: 30 }
          }
        ]
      ))
    })
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

    const getParcelWall = function (parcel) {
      const parcelX = parcel.coordinateX - 0
      const parcelY = parcel.coordinateY - 0
      for (const wallEntry of WALLS) {
        if (
          // parcel is inside this wall's outerBounds
          (
            (parcelX > wallEntry.outerBounds.minX && parcelX < wallEntry.outerBounds.maxX) &&
            (parcelY > wallEntry.outerBounds.minY && parcelY < wallEntry.outerBounds.maxY)
          ) &&
          // parcel is not inside this wall's innerBounds, if specified
          (
            !wallEntry.innerBounds ||
            !(
              (parcelX > wallEntry.innerBounds.minX && parcelX < wallEntry.innerBounds.maxX) &&
              (parcelY > wallEntry.innerBounds.minY && parcelY < wallEntry.innerBounds.maxY)
            )
          )
        ) {
          return wallEntry.id
        }
      }
      return null
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
        hasBoost: parcel.fudBoost !== '0' || parcel.fomoBoost !== '0' || parcel.alphaBoost !== '0' || parcel.kekBoost !== '0',
        wall: getParcelWall(parcel)
      }
    }

    const allParcelsToDisplay = computed(() => {
      return Object.values(parcelsById.value).filter(parcel =>
        DISTRICTS_TO_DISPLAY.includes(parcel.district) &&
        (parcel.coordinateX - 0) > X_MIN_TO_DISPLAY
      ).map(getParcelDetails)
    })

    const filteredParcelsToDisplay = computed(() => {
      const wallsToExclude = Object.values(filters.value.wall)
        .filter(entry => !entry.enabled)
        .map(entry => entry.id)
      const districtSelectionMode = filters.value.district.selectionMode
      const districtsToExclude = filters.value.district.selectMultiple
        .filter(entry => !entry.enabled)
        .map(entry => entry.id)

      return allParcelsToDisplay.value.map(parcel => {
        let show = true
        // size filters
        if (!filters.value.size.humble && parcel.sizeLabel === 'humble') {
          show = false
        }
        if (!filters.value.size.reasonable && parcel.sizeLabel === 'reasonable') {
          show = false
        }
        if (!filters.value.size.spacious && parcel.sizeLabel === 'spacious') {
          show = false
        }
        if (show) {
          // wall filters
          if (wallsToExclude.length && wallsToExclude.includes(parcel.wall)) {
            show = false
          }
        }
        if (show) {
          // district filters
          if (districtSelectionMode === 'single') {
            if (parcel.district !== filters.value.district.selectSingle) {
              show = false
            }
          } else if (districtsToExclude.includes(parcel.district)) {
            show = false
          }
        }
        if (show) {
          // boost filters
          for (const typeEntry of Object.values(filters.value.boost)) {
            if (typeEntry.selectionMode === 'ignore') {
              // do nothing
            } else {
              const boost = parcel[`${typeEntry.id}Boost`] - 0
              if (typeEntry.selectionMode === 'some') {
                if (boost <= 0) {
                  show = false
                }
              } else {
                const min = typeEntry.selectRange.min - 0
                const max = typeEntry.selectRange.max - 0
                if (boost < min || boost > max) {
                  show = false
                }
              }
            }
          }
        }
        return {
          ...parcel,
          show
        }
      })
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
      INITIAL_DISPLAY_VIEWBOX,
      INITIAL_DISPLAY_ASPECT_RATIO,
      svgRef,
      parcelDetailsRef,
      parcelsToDisplay: filteredParcelsToDisplay,
      onClickParcel,
      selectedParcel,
      mostRecentAuction,
      mostRecentAuctionDate,
      canSubmitAuctionsFetch,
      fetchAuctions,
      auctionsFetchStatus,
      scaleConfigBySize,
      AVAILABLE_SCALES,
      scaleGradientsByName,
      filters
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

  .config-details {
    margin-bottom: 15px;
  }

  .config-details[open] {
    margin-bottom: 30px;
  }
  .config-details summary {
    margin-bottom: 5px;
  }
  .config-details summary h3 {
    display: inline;
  }

  .config-details__district-entry {
    display: inline-block;
    margin-right: 15px;
    white-space: nowrap;
  }

  .scale-color-display {
    margin-top: 5px;
    width: 80%;
    height: 20px;
  }
  .scale-range-input {
    width: 60px;
  }

  .boost-range-input {
    width: 60px;
  }

  .map-svg {
    border: 1px solid #ccc;
    width: 100%;
  }

  .selected-parcel-details {
    margin: 0 10px 20px 0;
    border: 1px solid #ccc;
    padding: 10px;
  }
</style>
