<template>
  <div>
    <h1>Citaadel Map</h1>

    <div class="layout-container">
      <div class="map-sidebar-container">
        <section>
          <h2>Map Config</h2>

          <h3>Auction Data</h3>

          <div style="font-style: italic; margin-bottom: 20px">
            Last auction fetched:
            <br>
            #{{ mostRecentAuction.tokenId }}
            at {{ mostRecentAuctionDate }}
          </div>

          <div style="margin: 10px 0 20px 0; display: none;">
            <button
              type="button"
              :disabled="!canSubmitAuctionsFetch"
              class="fetch-auctions"
              @click="fetchAuctions"
            >
              Fetch Latest
            </button>
            <span v-if="auctionsFetchStatus.loading">
              loading...
            </span>
            <span v-if="auctionsFetchStatus.error">
              Error: {{ auctionsFetchStatus.errorMessage }}
            </span>
          </div>

          <details class="config-details">
            <summary>
              <h3>Filter Style</h3>
            </summary>

            <label>
              <input
                v-model="filters.displayMode"
                type="radio"
                name="displayMode"
                value="outline"
              />
              Show outline
            </label>
            <label>
              <input
                v-model="filters.displayMode"
                type="radio"
                name="displayMode"
                value="hide"
              />
              Hide
            </label>
          </details>

          <details class="config-details">
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

          <details class="config-details">
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
                    class="range-input"
                  />
                </label>
                <label>
                  Max:
                  <input
                    v-model="typeEntry.selectRange.max"
                    type="number"
                    class="range-input"
                  />
                </label>
              </div>
            </div>
          </details>

          <details class="config-details">
            <summary>
              <h3>Filter by Bidder</h3>
            </summary>

            <label>
              <textarea
                v-model="filters.bidders"
                class="config-bidders"
              />
              <div>
                Bidder addresses. Separate multiple addresses by space or newline.
              </div>
            </label>
          </details>

          <details class="config-details">
            <summary>
              <h3>Color Scheme</h3>
            </summary>

            <div style="margin-bottom: 10px">
              Color by:
              <br>
              <label class="color-by-option">
                <input
                  v-model="colorScheme.colorBy"
                  type="radio"
                  name="colorBy"
                  value="price"
                />
                Parcel Price (GHST)
              </label>

              <label class="color-by-option">
                <input
                  v-model="colorScheme.colorBy"
                  type="radio"
                  name="colorBy"
                  value="bidder"
                />
                Bidder Address
              </label>

              <label class="color-by-option">
                <input
                  v-model="colorScheme.colorBy"
                  type="radio"
                  name="colorBy"
                  value="whaleGhst"
                />
                Whales (total GHST spent)
              </label>

              <label class="color-by-option">
                <input
                  v-model="colorScheme.colorBy"
                  type="radio"
                  name="colorBy"
                  value="whalePx"
                />
                Whales (total pixel area)
              </label>
            </div>

            <div v-if="colorScheme.colorBy === 'price'">
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
                    <select v-model="colorScheme.priceScaleConfigBySize[size].scaleName">
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
                      'background': scaleGradientsByName[colorScheme.priceScaleConfigBySize[size].scaleName]
                    }"
                  />
                </div>
                <div>
                  <label>
                    Min:
                    <input
                      v-model="colorScheme.priceScaleConfigBySize[size].min"
                      type="number"
                      class="range-input"
                    />
                  </label>
                  <label>
                    Max:
                    <input
                      v-model="colorScheme.priceScaleConfigBySize[size].max"
                      type="number"
                      class="range-input"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div v-if="colorScheme.colorBy === 'bidder'">
              <div>
                <label>
                  Color Scheme:
                  <select v-model="colorScheme.bidderScaleName">
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
                    'background': scaleGradientsByName[colorScheme.bidderScaleName]
                  }"
                />
              </div>
            </div>

            <div v-if="colorScheme.colorBy === 'whaleGhst'">
              <div>
                <label>
                  Color Scheme:
                  <select v-model="colorScheme.whaleGhst.scaleName">
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
                    'background': scaleGradientsByName[colorScheme.whaleGhst.scaleName]
                  }"
                />
                <div
                  style="margin-top: 8px"
                >
                  <label>
                    Min:
                    <input
                      v-model="colorScheme.whaleGhst.min"
                      type="number"
                      class="range-input"
                    />
                  </label>
                  <label>
                    Max:
                    <input
                      v-model="colorScheme.whaleGhst.max"
                      type="number"
                      class="range-input"
                    />
                  </label>
                </div>
              </div>
            </div>

            <div v-if="colorScheme.colorBy === 'whalePx'">
              <div>
                <label>
                  Color Scheme:
                  <select v-model="colorScheme.whalePx.scaleName">
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
                    'background': scaleGradientsByName[colorScheme.whalePx.scaleName]
                  }"
                />
                <div
                  style="margin-top: 8px"
                >
                  <label>
                    Min:
                    <input
                      v-model="colorScheme.whalePx.min"
                      type="number"
                      class="range-input"
                    />
                  </label>
                  <label>
                    Max:
                    <input
                      v-model="colorScheme.whalePx.max"
                      type="number"
                      class="range-input"
                    />
                  </label>
                </div>
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
            <br>Name: {{ selectedParcel.parcelHash }}
            <br>Size: {{ selectedParcel.sizeLabel }}
            <br>District: {{ selectedParcel.district }}
            <div v-if="selectedParcel.hasAuction">
              <a
                :href="`https://gotchiverse.io/auction?tokenId=${selectedParcel.id}`"
                target="_blank"
              >
                Last bid: {{ selectedParcel.highestBidGhst }} GHST
              </a>
              <br>Bidder:
              <span class="eth-address" :title="selectedParcel.highestBidder">
                {{ selectedParcel.highestBidder.substring(0, 5) }}...{{ selectedParcel.highestBidder.substring(selectedParcel.highestBidder.length - 5) }}
              </span>
              <CopyToClipboard :text="selectedParcel.highestBidder" />
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
      <div>
        <div class="view-modes">
          <button
            type="button"
            class="view-mode"
            :aria-pressed="`${viewMode === 'map'}`"
            @click="viewMode = 'map'"
          >
            Map View
          </button>
          <button
            type="button"
            class="view-mode"
            :aria-pressed="`${viewMode === 'list'}`"
            @click="viewMode = 'list'"
          >
            List View
          </button>
        </div>
        <div v-show="viewMode === 'map'">
          <svg
            ref="svgRef"
            xmlns="http://www.w3.org/2000/svg"
            :viewBox="INITIAL_DISPLAY_VIEWBOX"
            class="map-svg"
            :class="{
              'map-svg--filter-hide': filters.displayMode === 'hide',
              'map-svg--filter-outline': filters.displayMode === 'outline'
            }"
            :style="{
              'aspect-ratio': INITIAL_DISPLAY_ASPECT_RATIO
            }"
          >
            <g>
              <a
                v-for="parcel in parcelsToDisplay"
                :key="parcel.id"
                xlink:href="#"
                @click.prevent="onClickParcel(parcel)"
              >
                <rect
                  class="parcel"
                  :class="{
                    'parcel--hidden-by-filter': !parcel.show
                  }"
                  :x="parcel.coordinateX"
                  :y="parcel.coordinateY"
                  :width="parcel.sizeLabel === 'humble' ? 8 : parcel.sizeLabel === 'reasonable' ? 16 : parcel.vertical ? 32 : 64"
                  :height="parcel.sizeLabel === 'humble' ? 8 : parcel.sizeLabel === 'reasonable' ? 16 : parcel.vertical ? 64 : 32"
                  stroke="#777"
                  :fill="parcel.color"
                />
              </a>
            </g>
          </svg>
          <button
            type="button"
            style="margin-top: 8px"
            @click="resetZoom"
          >
            Reset map zoom
          </button>
        </div>
        <div v-if="viewMode === 'list'">
          <template v-if="!listParcelsToDisplay.length">
            No parcels found.
          </template>
          <template v-else>
            {{ listParcelsToDisplay.length }} parcels found. Cheapest first:
            <ul class="parcels-list">
              <li
                v-for="parcel in listParcelsToDisplay"
                :key="parcel.id"
              >
                {{ parcel.id }}
                {{ parcel.parcelHash }}
                {{ parcel.sizeLabel }}
                district {{ parcel.district }}
                <a
                  :href="`https://gotchiverse.io/auction?tokenId=${parcel.id}`"
                  target="_blank"
                >
                  Last bid: {{ parcel.highestBidGhst }} GHST
                </a>
              </li>
            </ul>
          </template>
        </div>
      </div>
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
import Hammer from 'hammerjs'
import { scaleSequential } from 'd3-scale'
import { interpolateViridis, interpolateBlues, interpolateInferno, interpolateCividis, interpolateSpectral, interpolateTurbo, interpolateRainbow } from 'd3-scale-chromatic'
import { format } from 'date-fns'
import CopyToClipboard from './CopyToClipboard.vue'
import BigNumber from 'bignumber.js'

const scalesByName = {
  grey: () => '#eee',
  viridis: interpolateViridis,
  blues: interpolateBlues,
  inferno: interpolateInferno,
  cividis: interpolateCividis,
  spectral: interpolateSpectral,
  turbo: interpolateTurbo,
  rainbow: interpolateRainbow
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
const X_MIN_TO_DISPLAY = 5200
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
  components: {
    CopyToClipboard
  },
  setup () {
    // console.time('setup')
    const svgRef = ref(null)
    const parcelDetailsRef = ref(null)
    const selectedParcelId = ref(null)
    const viewMode = ref('map') // or 'list'
    const filters = ref({
      displayMode: 'outline', // or 'hide'
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
      )),
      bidders: ''
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

    const colorScheme = ref({
      colorBy: 'price', // or 'bidder'
      priceScaleConfigBySize: {
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
      },
      bidderScaleName: 'rainbow',
      whaleGhst: {
        scaleName: 'inferno',
        min: 0,
        max: 100_000
      },
      whalePx: {
        scaleName: 'inferno',
        min: 0,
        max: 75_000
      }
    })

    const priceScalesBySize = computed(() => {
      const scales = {}
      const configBySize = colorScheme.value.priceScaleConfigBySize
      for (const key in configBySize) {
        const config = configBySize[key]
        scales[key] = scaleSequential(scalesByName[config.scaleName]).domain([config.min, config.max])
      }
      return scales
    })

    const bidderScale = computed(() => {
      const maxAddress = parseInt('0xffffffffffffffffffffffffffffffffffffffff', 16)
      return scaleSequential(scalesByName[colorScheme.value.bidderScaleName]).domain([0, maxAddress])
    })

    const whaleGhstScale = computed(() => {
      const config = colorScheme.value.whaleGhst
      return scaleSequential(scalesByName[config.scaleName]).domain([config.min, config.max])
    })

    const whalePxScale = computed(() => {
      const config = colorScheme.value.whalePx
      return scaleSequential(scalesByName[config.scaleName]).domain([config.min, config.max])
    })

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
      const highestBid = auction?.highestBid - 0
      const highestBidGhst = auction?.highestBidGhst || ''
      const sizeLabel = sizeLabels[parcel.size]
      const vertical = parcel.size === '2'
      return {
        ...parcel,
        sizeLabel,
        vertical,
        hasAuction: !!auction,
        highestBid,
        highestBidGhst,
        highestBidder: auction?.highestBidder,
        hasBoost: parcel.fudBoost !== '0' || parcel.fomoBoost !== '0' || parcel.alphaBoost !== '0' || parcel.kekBoost !== '0',
        wall: getParcelWall(parcel)
      }
    }

    const allParcelsToDisplay = computed(() => {
      // console.time('allParcelsToDisplay')
      const result = Object.values(parcelsById.value).filter(parcel =>
        DISTRICTS_TO_DISPLAY.includes(parcel.district) &&
        (parcel.coordinateX - 0) > X_MIN_TO_DISPLAY
      ).map(getParcelDetails)
      // console.timeEnd('allParcelsToDisplay')
      return result
    })

    const coloredParcelsToDisplay = computed(() => {
      // console.time('coloredParcelsToDisplay')
      const colorBy = colorScheme.value.colorBy
      let getColor = () => 'white'
      if (colorBy === 'price') {
        getColor = parcel => {
          const scale = priceScalesBySize.value[parcel.sizeLabel]
          if (!scale) { return 'white' }
          return scale(parcel.highestBidGhst - 0)
        }
      } else if (colorBy === 'bidder') {
        getColor = parcel => {
          return bidderScale.value(parseInt(parcel.highestBidder, 16))
        }
      } else if (colorBy === 'whaleGhst') {
        getColor = parcel => {
          return whaleGhstScale.value(whalesGhst.value[parcel.highestBidder] || 0)
        }
      } else if (colorBy === 'whalePx') {
        getColor = parcel => {
          return whalePxScale.value(whalesPx.value[parcel.highestBidder] || 0)
        }
      }
      const result = allParcelsToDisplay.value.map(parcel => ({
        ...parcel,
        color: parcel.hasAuction ? getColor(parcel) : 'white'
      }))
      // console.timeEnd('coloredParcelsToDisplay')
      return result
    })

    const filteredParcelsToDisplay = computed(() => {
      // console.time('filteredParcelsToDisplay')
      const wallsToExclude = Object.values(filters.value.wall)
        .filter(entry => !entry.enabled)
        .map(entry => entry.id)
      const districtSelectionMode = filters.value.district.selectionMode
      const districtsToExclude = filters.value.district.selectMultiple
        .filter(entry => !entry.enabled)
        .map(entry => entry.id)
      const bidders = (filters.value.bidders && filters.value.bidders.trim()) ? filters.value.bidders.toLowerCase().split(/\s+/) : null

      const result = coloredParcelsToDisplay.value.map(parcel => {
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
          // bidder filters
          if (bidders?.length) {
            if (!bidders.includes(parcel.highestBidder)) {
              show = false
            }
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
      // console.timeEnd('filteredParcelsToDisplay')
      return result
    })

    const listParcelsToDisplay = computed(() => {
      // console.time('listParcelsToDisplay')
      const parcels = filteredParcelsToDisplay.value.filter(parcel => parcel.show && parcel.hasAuction)
      parcels.sort((a, b) => {
        if (a.highestBid === b.highestBid) { return 0 }
        return a.highestBid < b.highestBid ? -1 : 1
      })
      // console.timeEnd('listParcelsToDisplay')
      return parcels
    })

    const onClickParcel = function (parcel) {
      selectedParcelId.value = parcel.id
    }
    const selectedParcel = computed(() =>
      getParcelDetails(
        parcelsById.value[selectedParcelId.value]
      )
    )

    const whalesGhst = computed(() => {
      const totalPerBidder = {}
      for (const parcel of allParcelsToDisplay.value) {
        const bidder = parcel.highestBidder
        if (!totalPerBidder[bidder]) {
          totalPerBidder[bidder] = new BigNumber(0)
        }
        totalPerBidder[bidder] = totalPerBidder[bidder].plus(new BigNumber(parcel.highestBidGhst))
      }
      // console.log('GHST whales sorted:', Object.values(totalPerBidder).sort((a, b) => {
      //   if (a.isEqualTo(b)) { return 0 }
      //   return a.isLessThan(b) ? 1 : -1
      // }).map(n => n.toString()))
      return Object.fromEntries(
        Object.entries(totalPerBidder).map(([key, bigNum]) => [key, bigNum.toNumber()])
      )
    })

    const whalesPx = computed(() => {
      const totalPerBidder = {}
      const pxBySizeLabel = {
        humble: 8 * 8,
        reasonable: 16 * 16,
        spacious: 32 * 64
      }
      for (const parcel of allParcelsToDisplay.value) {
        const bidder = parcel.highestBidder
        if (!totalPerBidder[bidder]) {
          totalPerBidder[bidder] = 0
        }
        totalPerBidder[bidder] += (pxBySizeLabel[parcel.sizeLabel] || 0)
      }
      // console.log('Pixel whales sorted:', Object.values(totalPerBidder).sort((a, b) => {
      //   if (a === b) { return 0 }
      //   return a < b ? 1 : -1
      // }))
      return totalPerBidder
    })

    const panZoom = ref(null)
    const resetZoom = function () {
      if (!panZoom.value) { return }
      panZoom.value.reset()
    }
    onMounted(() => {
      // console.timeLog('mount')
      // mobile example code https://bumbu.me/svg-pan-zoom/demo/mobile.html
      // limit panning example code https://bumbu.me/svg-pan-zoom/demo/limit-pan.html
      panZoom.value = svgPanZoom(svgRef.value, {
        dblClickZoomEnabled: false,
        // TODO this example code doesn't calculate the limits correctly at high zoom
        /*
        beforePan: function (oldPan, newPan) {
          const gutterWidth = 100
          const gutterHeight = 100
          // Computed variables
          const sizes = this.getSizes()
          const leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth
          const rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom)
          const topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight
          const bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom)

          const customPan = {
            x: Math.max(leftLimit, Math.min(rightLimit, newPan.x)),
            y: Math.max(topLimit, Math.min(bottomLimit, newPan.y))
          }
          return customPan
        },
        */
        customEventsHandler: {
          haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
          init: function (options) {
            const instance = options.instance
            let initialScale = 1
            let pannedX = 0
            let pannedY = 0

            // Init Hammer
            // Listen only for pointer and touch events
            this.hammer = Hammer(options.svgElement, {
              inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
            })

            // Enable pinch
            this.hammer.get('pinch').set({ enable: true })

            // Handle double tap
            this.hammer.on('doubletap', function (ev) {
              instance.zoomIn()
            })

            // Handle pan
            this.hammer.on('panstart panmove', function (ev) {
              // On pan start reset panned variables
              if (ev.type === 'panstart') {
                pannedX = 0
                pannedY = 0
              }

              // Pan only the difference
              instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY })
              pannedX = ev.deltaX
              pannedY = ev.deltaY
            })

            // Handle pinch
            this.hammer.on('pinchstart pinchmove', function (ev) {
              // On pinch start remember initial zoom
              if (ev.type === 'pinchstart') {
                initialScale = instance.getZoom()
                instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y })
              }

              instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y })
            })

            // Prevent moving the page on some devices when panning over SVG
            options.svgElement.addEventListener('touchmove', function (e) { e.preventDefault() })
          },
          destroy: function () {
            this.hammer.destroy()
          }
        }
      })
      // console.timeEnd('mount')
    })
    // console.timeEnd('setup')
    // console.time('mount')
    return {
      INITIAL_DISPLAY_VIEWBOX,
      INITIAL_DISPLAY_ASPECT_RATIO,
      svgRef,
      resetZoom,
      parcelDetailsRef,
      viewMode,
      parcelsToDisplay: filteredParcelsToDisplay,
      listParcelsToDisplay,
      onClickParcel,
      selectedParcel,
      mostRecentAuction,
      mostRecentAuctionDate,
      canSubmitAuctionsFetch,
      fetchAuctions,
      auctionsFetchStatus,
      AVAILABLE_SCALES,
      scaleGradientsByName,
      filters,
      colorScheme
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

  .fetch-auctions{
    background: var(--purple);
    color: white;
    font-weight: bold;
    padding: 5px 10px;
  }

  .view-modes {
    margin-bottom: 10px;
  }
  .view-mode {
    margin-right: 10px;
    padding: 5px 10px;
  }
  .view-mode[aria-pressed=true] {
    background: var(--purple);
    color: white;
    font-weight: bold;
  }

  .parcels-list {
    margin: 15px 0 0 0;
    padding: 0 0 0 15px;
  }
  .parcels-list > li {
    margin: 0 0 8px 0;
    padding: 0;
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

  .color-by-option {
    display: inline-block;
    margin-right: 15px;
    white-space: nowrap;
  }

  .config-bidders {
    width: 90%;
    height: 70px;
  }

  .scale-color-display {
    margin-top: 5px;
    width: 80%;
    height: 20px;
  }
  .range-input {
    width: 60px;
  }

  .map-svg {
    border: 1px solid #ccc;
    width: 100%;
  }

  .map-svg--filter-hide .parcel--hidden-by-filter {
    display: none;
  }
  .map-svg--filter-outline .parcel--hidden-by-filter {
    stroke: #aaa;
    fill: white;
  }

  .selected-parcel-details {
    margin: 0 10px 20px 0;
    border: 1px solid #ccc;
    padding: 10px;
  }

  .eth-address {
    font-family: monospace;
  }
</style>
