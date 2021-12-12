<template>
  <LayoutMapWithFilters>
    <template #sidebar>
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

        <MapConfigDisplayMode v-model="mapConfig.displayMode" />
        <FilterSize v-model="filters.size" />
        <FilterWalls v-model="filters.walls" />
        <FilterDistricts
          :districts="auctionInfo.districts"
          v-model="filters.districts"
        />
        <FilterBoosts v-model="filters.boosts" />

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

        <FilterParcelIds v-model="filters.parcelIds" />
        <FilterParcelNames v-model="filters.parcelNames" />

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

    </template>
    <template #main="{ viewMode }">
      <CitaadelMap
        v-show="viewMode === 'map'"
        :viewBox="auctionInfo.display.viewBox"
        :aspectRatio="auctionInfo.display.aspectRatio"
        :filterDisplayMode="mapConfig.displayMode"
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
    </template>
  </LayoutMapWithFilters>
</template>

<script>
import { ref, computed } from 'vue'
import useDebouncedRef from '@/utils/useDebouncedRef'
import useParcels from '@/data/useParcels'
import useAuctions from '@/data/useAuctions'
import { WALLS } from '@/data/walls'
import { scaleSequential } from 'd3-scale'
import { interpolateViridis, interpolateBlues, interpolateInferno, interpolateCividis, interpolateSpectral, interpolateTurbo, interpolateRainbow } from 'd3-scale-chromatic'
import { format } from 'date-fns'
import CopyToClipboard from './CopyToClipboard.vue'
import BigNumber from 'bignumber.js'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import CitaadelMap from './CitaadelMap.vue'
import MapConfigDisplayMode from './MapConfigDisplayMode.vue'
import FilterSize, { SIZES, getFilter as getSizesFilter } from './FilterSize.vue'
import FilterWalls, { getFilter as getWallsFilter } from './FilterWalls.vue'
import FilterDistricts, { getDefaultValue as getDefaultDistrictsValue, getFilter as getDistrictsFilter } from './FilterDistricts.vue'
import FilterParcelIds, { getFilter as getParcelIdsFilter } from './FilterParcelIds.vue'
import FilterParcelNames, { getFilter as getParcelNamesFilter } from './FilterParcelNames.vue'
import FilterBoosts, { getDefaultValue as getDefaultBoostsValue, getFilter as getBoostsFilter } from './FilterBoosts.vue'

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
    LayoutMapWithFilters,
    CitaadelMap,
    CopyToClipboard,
    MapConfigDisplayMode,
    FilterSize,
    FilterWalls,
    FilterDistricts,
    FilterParcelIds,
    FilterParcelNames,
    FilterBoosts
  },
  props: {
    auctionId: { type: String, default: '1' }
  },
  setup (props) {
    // console.time('setup')
    const parcelDetailsRef = ref(null)
    const selectedParcelId = ref(null)
    const { parcelsById } = useParcels()
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
    const mapConfig = ref({
      displayMode: 'outline' // or 'hide'
    })
    const filters = ref({
      size: [...SIZES],
      districts: getDefaultDistrictsValue(auctionInfo.districts),
      walls: WALLS.map(wall => wall.id),
      boosts: getDefaultBoostsValue(),
      bidders: '',
      parcelIds: [],
      parcelNames: []
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

    const filteredParcelsToDisplay = computed(() => {
      // console.time('filteredParcelsToDisplay')
      const idFilter = getParcelIdsFilter(filters.value.parcelIds)
      const nameFilter = getParcelNamesFilter(filters.value.parcelNames)
      const sizesFilter = getSizesFilter(filters.value.size)
      const wallsFilter = getWallsFilter(filters.value.walls)
      const districtsFilter = getDistrictsFilter(auctionInfo.districts, filters.value.districts)
      const boostsFilter = getBoostsFilter(filters.value.boosts)

      const bidders = filterBidders.value
      const bidderFilter = function (parcel) {
        if (bidders?.length) {
          if (!bidders.includes(parcel.highestBidder)) {
            return false
          }
        }
        return true
      }

      const applyFilters = [idFilter, nameFilter, sizesFilter, wallsFilter, districtsFilter, bidderFilter, boostsFilter]

      const result = coloredParcelsToDisplay.value.map(parcel => {
        let show = true
        for (let i = 0; show && i < applyFilters.length; i++) {
          if (!applyFilters[i](parcel)) {
            show = false
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
      mapConfig,
      filters,
      colorScheme
    }
  }
}
</script>

<style scoped>
  .fetch-auctions{
    background: var(--purple);
    color: white;
    font-weight: bold;
    padding: 5px 10px;
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

  .scale-color-display {
    margin-top: 5px;
    width: 80%;
    height: 20px;
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
