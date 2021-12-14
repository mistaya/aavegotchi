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

        <details class="config-details">
          <summary>
            <h3>Color Scheme: {{ colorSchemeLabel }}</h3>
          </summary>

          <div style="margin-bottom: 10px">
            Color by:
            <div
              v-for="option in colorSchemeOptions"
              :key="option.id"
            >
              <label>
                <input
                  v-model="colorScheme.colorBy"
                  type="radio"
                  name="colorBy"
                  :value="option.id"
                />
                {{ option.label }}
              </label>
            </div>

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
                      v-for="scaleName in SCALE_NAMES"
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
                    'background': SCALE_GRADIENTS[colorScheme.priceScaleConfigBySize[size].scaleName]
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
                <select v-model="colorScheme.bidder.scaleName">
                  <option
                    v-for="scaleName in SCALE_NAMES"
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
                  'background': SCALE_GRADIENTS[colorScheme.bidder.scaleName]
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
                    v-for="scaleName in SCALE_NAMES"
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
                  'background': SCALE_GRADIENTS[colorScheme.whaleGhst.scaleName]
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
                    v-for="scaleName in SCALE_NAMES"
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
                  'background': SCALE_GRADIENTS[colorScheme.whalePx.scaleName]
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
      </section>

      <section ref="parcelDetailsRef">
        <div
          v-if="selectedParcel"
          class="selected-parcel-details"
        >
          <button
            type="button"
            style="float: right"
            @click="selectedParcelId = null"
          >
            Close
          </button>

          <h2>Selected Parcel details:</h2>

          ID: {{ selectedParcel.id }}
          <br>Name: {{ selectedParcel.parcelHash }}
          <br>Size: {{ selectedParcel.sizeLabel }}
          <br>District: {{ selectedParcel.district }}
          <div v-if="selectedParcel.auction?.hasAuction">
            <a
              :href="`https://gotchiverse.io/auction?tokenId=${selectedParcel.id}`"
              target="_blank"
            >
              Last bid: {{ selectedParcel.auction.highestBidGhst }} GHST
            </a>
            <br>Bidder:
            <EthAddress :address="selectedParcel.auction.highestBidder" />
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
        :parcelsMatchingFilters="parcelsMatchingFilters"
        :parcelColors="parcelColors"
        :selectedParcel="selectedParcel"
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
              <a
                href="#"
                @click.prevent="onClickParcel(parcel)"
              >
                {{ parcel.id }}
              </a>
              {{ parcel.parcelHash }}
              {{ parcel.sizeLabel }}
              district {{ parcel.district }}
              <a
                :href="`https://gotchiverse.io/auction?tokenId=${parcel.id}`"
                target="_blank"
              >
                Last bid: {{ parcelAuctions[parcel.id].highestBidGhst }} GHST
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
import { SCALE_NAMES, SCALE_GRADIENTS, getSequentialScale } from './colorScales'
import { format } from 'date-fns'
import EthAddress from './EthAddress.vue'
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

export default {
  components: {
    LayoutMapWithFilters,
    CitaadelMap,
    EthAddress,
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

    const colorSchemeOptions = [
      { id: 'price', label: 'Parcel Price (GHST)' },
      { id: 'bidder', label: 'Bidder Address' },
      { id: 'whaleGhst', label: 'Whales (total GHST spent)' },
      { id: 'whalePx', label: 'Whales (total pixel area)' }
    ]
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
      bidder: {
        scaleName: 'rainbow',
        min: 0,
        max: parseInt('0xffffffffffffffffffffffffffffffffffffffff', 16)
      },
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
    const colorSchemeLabel = computed(() => colorSchemeOptions.find(option => option.id === colorScheme.value.colorBy)?.label)

    const priceScalesBySize = computed(() => {
      const scales = {}
      const configBySize = colorScheme.value.priceScaleConfigBySize
      for (const key in configBySize) {
        const config = configBySize[key]
        scales[key] = getSequentialScale(config)
      }
      return scales
    })

    const bidderScale = computed(() => {
      return getSequentialScale(colorScheme.value.bidder)
    })

    const whaleGhstScale = computed(() => {
      return getSequentialScale(colorScheme.value.whaleGhst)
    })

    const whalePxScale = computed(() => {
      return getSequentialScale(colorScheme.value.whalePx)
    })

    const parcelAuctions = computed(() => {
      const parcelsInAuctionDistricts = Object.values(parcelsById.value).filter(parcel =>
        auctionInfo.districts.includes(parcel.district) &&
        (
          parcel.district !== '1' ||
          (
            (parcel.coordinateX - 0) > auctionInfo.district1Bounds.minX &&
            (parcel.coordinateX - 0) < auctionInfo.district1Bounds.maxX
          )
        )
      )
      return Object.fromEntries(
        parcelsInAuctionDistricts.map(parcel => {
          const auction = auctionsByParcelId.value[parcel.id]
          const highestBid = auction?.highestBid - 0
          const highestBidGhst = auction?.highestBidGhst || ''
          return [
            parcel.id,
            {
              hasAuction: !!auction,
              highestBid,
              highestBidGhst,
              highestBidder: auction?.highestBidder
            }
          ]
        })
      )
    })

    const parcelsToDisplay = computed(() => {
      // console.time('parcelsToDisplay')
      const result = Object.values(parcelsById.value).filter(parcel => parcelAuctions.value[parcel.id]?.hasAuction)
      // console.timeEnd('parcelsToDisplay')
      return result
    })

    const parcelColors = computed(() => {
      // console.time('parcelColors')
      const colorBy = colorScheme.value.colorBy
      let getColor = () => 'white'
      if (colorBy === 'price') {
        getColor = parcel => {
          const scale = priceScalesBySize.value[parcel.sizeLabel]
          if (!scale) { return 'white' }
          return scale(parcelAuctions.value[parcel.id].highestBidGhst - 0)
        }
      } else if (colorBy === 'bidder') {
        getColor = parcel => {
          return bidderScale.value(parseInt(parcelAuctions.value[parcel.id].highestBidder, 16))
        }
      } else if (colorBy === 'whaleGhst') {
        getColor = parcel => {
          return whaleGhstScale.value(whalesGhst.value[parcelAuctions.value[parcel.id].highestBidder] || 0)
        }
      } else if (colorBy === 'whalePx') {
        getColor = parcel => {
          return whalePxScale.value(whalesPx.value[parcelAuctions.value[parcel.id].highestBidder] || 0)
        }
      }
      const result = Object.fromEntries(
        parcelsToDisplay.value.map(parcel => [
          parcel.id,
          parcelAuctions.value[parcel.id].hasAuction ? getColor(parcel) : 'white'
        ])
      )
      // console.timeEnd('parcelColors')
      return result
    })

    const { debouncedRef: debouncedFilterBidders } = useDebouncedRef(() => filters.value.bidders, 500)
    const filterBidders = computed(
      () => (debouncedFilterBidders.value && debouncedFilterBidders.value.trim())
        ? debouncedFilterBidders.value.toLowerCase().split(/[^x0-9a-f]+/).filter(bidder => bidder.length)
        : null
    )

    const parcelsMatchingFilters = computed(() => {
      // console.time('parcelsMatchingFilters')
      const idFilter = getParcelIdsFilter(filters.value.parcelIds)
      const nameFilter = getParcelNamesFilter(filters.value.parcelNames)
      const sizesFilter = getSizesFilter(filters.value.size)
      const wallsFilter = getWallsFilter(filters.value.walls)
      const districtsFilter = getDistrictsFilter(auctionInfo.districts, filters.value.districts)
      const boostsFilter = getBoostsFilter(filters.value.boosts)

      const bidders = filterBidders.value
      const bidderFilter = function (parcel) {
        if (bidders?.length) {
          if (!bidders.includes(parcelAuctions.value[parcel.id].highestBidder)) {
            return false
          }
        }
        return true
      }

      const applyFilters = [idFilter, nameFilter, sizesFilter, wallsFilter, districtsFilter, bidderFilter, boostsFilter]

      const result = Object.fromEntries(
        parcelsToDisplay.value.map(parcel => {
          let show = true
          for (let i = 0; show && i < applyFilters.length; i++) {
            if (!applyFilters[i](parcel)) {
              show = false
            }
          }
          return [parcel.id, show]
        })
      )
      // console.timeEnd('parcelsMatchingFilters')
      return result
    })

    const listParcelsToDisplay = computed(() => {
      // console.time('listParcelsToDisplay')
      const parcels = parcelsToDisplay.value.filter(parcel => parcelsMatchingFilters.value[parcel.id] && parcelAuctions.value[parcel.id].hasAuction)
      parcels.sort((a, b) => {
        const auctionA = parcelAuctions.value[a.id]
        const auctionB = parcelAuctions.value[b.id]
        if (auctionA.highestBid === auctionB.highestBid) { return 0 }
        return auctionA.highestBid < auctionB.highestBid ? -1 : 1
      })
      // console.timeEnd('listParcelsToDisplay')
      return parcels
    })

    const onClickParcel = function (parcel) {
      selectedParcelId.value = parcel.id
    }
    const selectedParcel = computed(() => {
      if (!selectedParcelId.value) { return null }
      return {
        ...parcelsById.value[selectedParcelId.value],
        auction: parcelAuctions.value[selectedParcelId.value]
      }
    })

    const whalesGhst = computed(() => {
      const totalPerBidder = {}
      for (const auction of Object.values(parcelAuctions.value)) {
        if (auction.hasAuction) {
          const bidder = auction.highestBidder
          if (!totalPerBidder[bidder]) {
            totalPerBidder[bidder] = new BigNumber(0)
          }
          totalPerBidder[bidder] = totalPerBidder[bidder].plus(new BigNumber(auction.highestBidGhst))
        }
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
      for (const parcel of parcelsToDisplay.value) {
        const auction = parcelAuctions.value[parcel.id]
        const bidder = auction.highestBidder
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
      parcelsToDisplay,
      parcelsMatchingFilters,
      parcelColors,
      parcelAuctions,
      listParcelsToDisplay,
      onClickParcel,
      selectedParcelId,
      selectedParcel,
      mostRecentAuction,
      mostRecentAuctionDate,
      canSubmitAuctionsFetch,
      fetchAuctions,
      auctionsFetchStatus,
      SCALE_NAMES,
      SCALE_GRADIENTS,
      mapConfig,
      filters,
      colorSchemeOptions,
      colorScheme,
      colorSchemeLabel
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
  .range-input {
    width: 60px;
  }

  .selected-parcel-details {
    margin: 0 10px 20px 0;
    border: 1px solid #ccc;
    padding: 10px;
  }
</style>
