<template>
  <div class="layout-container">
    <div class="map-sidebar-container">
      <section>
        <h2 style="margin-bottom: 10px">
          Auction {{ auctionId }} ({{ auctionInfo.days }})
        </h2>

        <div
          v-if="mostRecentAuction"
          style="margin-bottom: 20px; font-style: italic; font-size: 0.95em;"
        >
          Last auction data fetched:
          <br>
          parcel #{{ mostRecentAuction.tokenId }}
          at {{ mostRecentAuctionDate }}
        </div>

        <div style="margin: 10px 0 20px 0;">
          <button
            type="button"
            :disabled="!canSubmitAuctionsFetch"
            class="fetch-auctions"
            style="display: none;"
            @click="fetchAuctions"
          >
            Fetch Latest
          </button>
          <span v-if="auctionsFetchStatus.loading">
            loading auctions...
          </span>
          <span v-if="auctionsFetchStatus.error">
            Error loading auctions: {{ auctionsFetchStatus.errorMessage }}
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
            <div class="config-textarea-label">
              Bidder addresses
            </div>
            <textarea
              v-model="filters.bidders"
              class="config-bidders"
            />
          </label>
        </details>

        <details class="config-details">
          <summary>
            <h3>Filter by Parcel ID</h3>
          </summary>

          <label>
            <div class="config-textarea-label">
              Parcel IDs, e.g. <kbd>12345</kbd>. (Exact match)
            </div>
            <textarea
              v-model="filters.parcelIds"
              class="config-parcel-ids"
            />
          </label>
        </details>

        <details class="config-details">
          <summary>
            <h3>Filter by Parcel Name</h3>
          </summary>

          <label>
            <div class="config-textarea-label">
              Parcel Names, e.g. <kbd>accurate-mystical-shall</kbd>.
              <br>Partial matches will be displayed if you don't provide a full name.
            </div>
            <textarea
              v-model="filters.parcelNames"
              class="config-parcel-names"
            />
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
      <CitaadelMap
        v-show="viewMode === 'map'"
        :viewBox="auctionInfo.display.viewBox"
        :aspectRatio="auctionInfo.display.aspectRatio"
        :filterDisplayMode="filters.displayMode"
        :parcels="parcelsToDisplay"
        @click:parcel="onClickParcel"
      />
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
</template>

<script>
import { ref, computed } from 'vue'
import useDebouncedRef from '../utils/useDebouncedRef'
import useParcels from '@/data/useParcels'
import useAuctions from '@/data/useAuctions'
import { scaleSequential } from 'd3-scale'
import { interpolateViridis, interpolateBlues, interpolateInferno, interpolateCividis, interpolateSpectral, interpolateTurbo, interpolateRainbow } from 'd3-scale-chromatic'
import { format } from 'date-fns'
import CopyToClipboard from './CopyToClipboard.vue'
import BigNumber from 'bignumber.js'
import CitaadelMap from './CitaadelMap.vue'

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

export default {
  components: {
    CitaadelMap,
    CopyToClipboard
  },
  props: {
    auctionId: { type: String, default: '1' }
  },
  setup (props) {
    // console.time('setup')
    const parcelDetailsRef = ref(null)
    const selectedParcelId = ref(null)
    const viewMode = ref('map') // or 'list'
    const { parcelsById, WALLS, ALCHEMICA_TYPES } = useParcels()
    const {
      auctionInfo,
      auctionsByParcelId,
      mostRecentAuction,
      canSubmitFetch: canSubmitAuctionsFetch,
      fetchStatus: auctionsFetchStatus,
      fetchAuctions
    } = useAuctions(props.auctionId)
    const mostRecentAuctionDate = computed(() => {
      if (!mostRecentAuction.value) { return }
      return format(new Date(mostRecentAuction.value.lastBidTime * 1000), 'yyyy/MM/dd HH:mm:ss')
    })
    const filters = ref({
      displayMode: 'outline', // or 'hide'
      size: {
        humble: true,
        reasonable: true,
        spacious: true
      },
      district: {
        districts: auctionInfo.districts,
        selectionMode: 'multiple', // or 'multiple'
        selectSingle: auctionInfo.districts[0],
        selectMultiple: auctionInfo.districts.map(district => ({
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
      bidders: '',
      parcelIds: '',
      parcelNames: ''
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

    const getParcelDetails = function (parcel) {
      if (!parcel) { return null }
      const auction = auctionsByParcelId.value[parcel.id]
      const highestBid = auction?.highestBid - 0
      const highestBidGhst = auction?.highestBidGhst || ''
      return {
        ...parcel,
        hasAuction: !!auction,
        highestBid,
        highestBidGhst,
        highestBidder: auction?.highestBidder
      }
    }

    const allParcelsToDisplay = computed(() => {
      // console.time('allParcelsToDisplay')
      const result = Object.values(parcelsById.value).filter(parcel =>
        auctionInfo.districts.includes(parcel.district) &&
        (
          parcel.district !== '1' ||
          (
            (parcel.coordinateX - 0) > auctionInfo.district1Bounds.minX &&
            (parcel.coordinateX - 0) < auctionInfo.district1Bounds.maxX
          )
        )
      ).map(getParcelDetails).filter(parcel => parcel.hasAuction)
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

    const { debouncedRef: debouncedFilterBidders } = useDebouncedRef(() => filters.value.bidders, 500)
    const filterBidders = computed(
      () => (debouncedFilterBidders.value && debouncedFilterBidders.value.trim())
        ? debouncedFilterBidders.value.toLowerCase().split(/[^x0-9a-f]+/).filter(bidder => bidder.length)
        : null
    )

    const { debouncedRef: debouncedFilterParcelIds } = useDebouncedRef(() => filters.value.parcelIds, 500)
    const filterParcelIds = computed(
      () => (debouncedFilterParcelIds.value && debouncedFilterParcelIds.value.trim())
        ? debouncedFilterParcelIds.value.split(/[^0-9]+/).filter(id => id.length)
        : null
    )

    const { debouncedRef: debouncedFilterParcelNames } = useDebouncedRef(() => filters.value.parcelNames, 500)
    const filterParcelNames = computed(
      () => (debouncedFilterParcelNames.value && debouncedFilterParcelNames.value.trim())
        ? debouncedFilterParcelNames.value.toLowerCase().split(/[^\-a-z]+/)
          .filter(name => name.trim().length)
          .map(name => ({ name, full: name.split('-').length === 3 }))
        : null
    )

    const filteredParcelsToDisplay = computed(() => {
      // console.time('filteredParcelsToDisplay')
      const wallsToExclude = Object.values(filters.value.wall)
        .filter(entry => !entry.enabled)
        .map(entry => entry.id)
      const districtSelectionMode = filters.value.district.selectionMode
      const districtsToExclude = filters.value.district.selectMultiple
        .filter(entry => !entry.enabled)
        .map(entry => entry.id)
      const bidders = filterBidders.value
      const parcelIds = filterParcelIds.value
      const parcelNames = filterParcelNames.value

      const result = coloredParcelsToDisplay.value.map(parcel => {
        let show = true
        if (show) {
          // parcel ID filters
          if (parcelIds?.length) {
            if (!parcelIds.includes(parcel.tokenId)) {
              show = false
            }
          }
        }
        if (show) {
          // parcel name filters
          if (parcelNames?.length) {
            // show parcel if it matches any of the provided names (or partial names)
            let hasAnyName = false
            for (const name of parcelNames) {
              if (name.full) {
                if (parcel.parcelHash === name.name) {
                  hasAnyName = true
                }
              } else {
                if (parcel.parcelHash.includes(name.name)) {
                  hasAnyName = true
                }
              }
            }
            if (!hasAnyName) {
              show = false
            }
          }
        }
        if (show) {
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
      // non-auction parcels have 'undefined' bidder, ignore them
      totalPerBidder.undefined = new BigNumber(0)
      // console.log('GHST whales sorted:', Object.entries(totalPerBidder).sort((a, b) => {
      //   if (a[1].isEqualTo(b[1])) { return 0 }
      //   return a[1].isLessThan(b[1]) ? 1 : -1
      // }).map(entry => [entry[0], entry[1].toString()]))
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
      // non-auction parcels have 'undefined' bidder, ignore them
      totalPerBidder.undefined = 0
      // console.log('Pixel whales sorted:', Object.entries(totalPerBidder).sort((a, b) => {
      //   if (a[1] === b[1]) { return 0 }
      //   return a[1] < b[1] ? 1 : -1
      // }))
      return totalPerBidder
    })

    // console.timeEnd('setup')
    // console.time('mount')
    return {
      auctionInfo,
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

  .config-textarea-label {
    margin-top: 10px;
    margin-bottom: 5px;
  }

  .config-bidders {
    width: 90%;
    height: 70px;
  }

  .config-parcel-ids {
    width: 90%;
    height: 40px;
  }

  .config-parcel-names {
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

  .selected-parcel-details {
    margin: 0 10px 20px 0;
    border: 1px solid #ccc;
    padding: 10px;
  }

  .eth-address {
    font-family: monospace;
  }
</style>
