<template>
  <PrereqParcels>
    <LayoutMapWithFilters>
      <template #sidebar="{ viewMode, setViewModeBoth }">
        <section>
          <h2 style="margin-bottom: 10px">
            Auction {{ auctionId }} ({{ auctionInfo.days }})
          </h2>

          <div style="margin-bottom: 15px; margin-right: 10px;">
            <DataFetcherAuctions
              :auctionId="auctionId"
            />
            <DataFetcherParcelOwners
              v-if="auctionInfo.hasOldDistricts"
            />
          </div>

          <MapConfig
            v-model="mapConfig"
            ref="refDetailsMapConfig"
          />

          <details
            ref="refDetailsColorScheme"
            class="config-details"
          >
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

            <div v-if="colorScheme.colorBy === 'highlight'">
              <label>
                Parcel color:
                <InputColor
                  v-model="colorScheme.highlight"
                />
              </label>
            </div>
          </details>

          <details
            ref="refDetailsFilters"
            class="filter-container"
          >
            <summary>
              <h3>Parcel Filters</h3>
            </summary>
            <div style="margin: 15px 0 0 15px">

              <details
                v-if="auctionInfo.hasOldDistricts"
                class="filter-container"
              >
                <summary>
                  <h4>Parcels Not in Auction</h4>
                </summary>
                <label style="display: flex; align-items: flex-start; margin-top: 10px">
                  <input
                    v-model="filters.includeNonAuctionParcels"
                    type="checkbox"
                  >
                  <span style="flex: 1 1 auto; margin-left: 5px">
                    Show parcels that aren't in this auction
                  </span>
                </label>
                <div style="margin-top: 10px;">
                  <label>
                    Color:
                    <InputColor
                      v-model="mapConfig.colorNotInAuction"
                    />
                  </label>
                </div>
              </details>

              <FilterSize v-model="filters.size" />
              <FilterAuctionPrice v-model="filters.price" />
              <FilterWalls v-model="filters.walls" />
              <FilterDistricts
                :districts="auctionInfo.districts"
                v-model="filters.districts"
              />
              <FilterRoads v-model="filters.roads" />
              <FilterBoosts v-model="filters.boosts" />
              <FilterBidders v-model="filters.bidders" />
              <FilterParcelIds v-model="filters.parcelIds" />
              <FilterParcelNames v-model="filters.parcelNames" />
            </div>
          </details>

          <MapMyParcels
            v-if="auctionInfo.hasOldDistricts"
            ref="refDetailsMyParcels"
            v-model:color="mapConfig.colorMyParcels"
            v-model:filterOwners="myFilters.owners"
            v-model:filterBidders="myFilters.bidders"
            v-model:filterParcelIds="myFilters.parcelIds"
            v-model:filterParcelNames="myFilters.parcelNames"
          />
        </section>

        <section style="padding: 0 10px 20px 0;">
          <PaartnerParcelDetails
            v-if="selectedParcelPaartnerId"
            :paartner="selectedParcelPaartnerId"
            @close="selectedParcelPaartnerId = null"
          />
          <ParcelDetails
            v-if="selectedParcel"
            :parcel="selectedParcel.parcel"
            :auction="selectedParcel.auction"
            :owner="ownersByParcelId[selectedParcelId]"
            v-model:flagSelected="mapConfig.flagSelected"
            @close="selectedParcelId = null"
            @zoomToParcel="zoomToParcel(selectedParcelId, { viewMode, setViewModeBoth })"
          />
          <VortexDetails
            v-if="selectedVortex"
            :vortex="selectedVortex"
            @close="selectedVortex = null"
          />
        </section>

      </template>
      <template #top>
        <div style="display: inline-block; margin-bottom: 8px;">
          <template v-if="numAuctionParcelsMatchingFilters === numAuctionParcels">
            Matched all
            <NumberDisplay :number="numAuctionParcelsMatchingFilters" />
            parcels
          </template>
          <template v-else-if="numAuctionParcelsMatchingFilters === 0">
            No parcels matched your filters
          </template>
          <template v-else>
            Matched
            <NumberDisplay :number="numAuctionParcelsMatchingFilters" />
            parcels
          </template>
        </div>
      </template>
      <template #main="{ viewMode }">
        <CitaadelMap
          ref="mapRef"
          v-show="viewMode === 'map' || viewMode === 'both'"
          :viewBox="auctionInfo.display.viewBox"
          :aspectRatio="auctionInfo.display.aspectRatio"
          :mapConfig="mapConfig"
          :parcels="parcelsForMap"
          :parcelsMatchingFilters="parcelsMatchingFiltersForMap"
          :parcelColors="parcelColors"
          :selectedParcel="selectedParcel?.parcel"
          @click:parcel="onClickParcel"
          @click:vortex="onClickVortex"
        />
        <template v-if="viewMode === 'list'">
          <div
            v-if="auctionInfo.hasOldDistricts"
            class="list-selections"
          >
            <SiteButton
              type="button"
              class="list-selection"
              :aria-pressed="`${selectedList === 'matches'}`"
              @click="selectedList = 'matches'"
            >
              Matching Parcels
            </SiteButton>
            <SiteButton
              type="button"
              class="list-selection"
              :aria-pressed="`${selectedList === 'my'}`"
              @click="selectedList = 'my'"
            >
              My Parcels
            </SiteButton>
          </div>
          <ParcelList
            :key="selectedList"
            class="parcel-list parcel-list--mode-list"
            :parcels="selectedList === 'matches' ? parcelsList : myParcelsList"
            :auctionsByParcelId="auctionsByParcelId"
            :selectedParcelId="selectedParcelId"
            :disableSorting="selectedList === 'my'"
            @click:parcel="onClickParcel"
          />
        </template>
      </template>
      <template #sidebar2="{ viewMode }">
        <template v-if="viewMode === 'both'">
          <div
            v-if="auctionInfo.hasOldDistricts"
            class="list-selections"
            style="margin-left: 15px;"
          >
            <SiteButton
              type="button"
              class="list-selection"
              :aria-pressed="`${selectedList === 'matches'}`"
              @click="selectedList = 'matches'"
            >
              Matching Parcels
            </SiteButton>
            <SiteButton
              type="button"
              class="list-selection"
              :aria-pressed="`${selectedList === 'my'}`"
              @click="selectedList = 'my'"
            >
              My Parcels
            </SiteButton>
          </div>
          <ParcelList
            :key="selectedList"
            class="parcel-list parcel-list--mode-both"
            :parcels="selectedList === 'matches' ? parcelsList : myParcelsList"
            :auctionsByParcelId="auctionsByParcelId"
            :selectedParcelId="selectedParcelId"
            :disableSorting="selectedList === 'my'"
            parcelIcon="zoom-in"
            compact
            @click:parcel="onClickParcelFromSidebar"
          />
        </template>
      </template>
    </LayoutMapWithFilters>
  </PrereqParcels>
</template>

<script>
import { ref, computed, nextTick } from 'vue'
import BigNumber from 'bignumber.js'
import useParcels from '@/data/useParcels'
import useParcelOwners from '@/data/useParcelOwners'
import useAuctions from '@/data/useAuctions'
import { WALLS } from '@/data/walls'
import { SCALE_NAMES, SCALE_GRADIENTS, getSequentialScale } from './colorScales'
import NumberDisplay from './NumberDisplay.vue'
import PrereqParcels from './PrereqParcels.vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import DataFetcherAuctions from './DataFetcherAuctions.vue'
import DataFetcherParcelOwners from './DataFetcherParcelOwners.vue'
import PaartnerParcelDetails from './PaartnerParcelDetails.vue'
import ParcelDetails from './ParcelDetails.vue'
import VortexDetails from './VortexDetails.vue'
import ParcelList from './ParcelList.vue'
import CitaadelMap from './CitaadelMap.vue'
import MapConfig, { getDefaultValue as getDefaultMapConfigValue } from './MapConfig.vue'
import MapMyParcels from './MapMyParcels.vue'
import FilterSize, { SIZES, getFilter as getSizesFilter } from './FilterSize.vue'
import FilterWalls, { getFilter as getWallsFilter } from './FilterWalls.vue'
import FilterDistricts, { getDefaultValue as getDefaultDistrictsValue, getFilter as getDistrictsFilter } from './FilterDistricts.vue'
import FilterRoads, { getDefaultValue as getDefaultRoadsValue, getFilter as getRoadsFilter } from './FilterRoads.vue'
import FilterParcelIds, { getFilter as getParcelIdsFilter } from './FilterParcelIds.vue'
import FilterParcelNames, { getFilter as getParcelNamesFilter } from './FilterParcelNames.vue'
import FilterBoosts, { getDefaultValue as getDefaultBoostsValue, getFilter as getBoostsFilter } from './FilterBoosts.vue'
import FilterBidders, { getFilter as getBiddersFilter } from './FilterBidders.vue'
import FilterAuctionPrice, { getDefaultValue as getDefaultAuctionPriceValue, getFilter as getAuctionPriceFilter } from './FilterAuctionPrice.vue'
import InputColor from './InputColor.vue'
import { getFilter as getOwnersFilter } from './FilterOwners.vue'

// TODO for next land auction:
// - better styling of the list toggle: more like tabs? secondary style?
//   -- refactor duplicate code / create tabs/button-group component
// - are there other list orderings that would be useful, particularly for My Parcels?
// - easier 'copy parcel ids' for matched parcels - or just use existing export?
// - make display of data fetching more compact/collapsible
// - hammertime filter to only show parcels with unfinished auctions
//    is there a completed boolean? how is endTime populated?
//    lastBidTime, hammerTimeDuration, endTime: this filter needs reactive Date, efficiency?
//    extendedEndTime = lastBidTime + hammerTimeDuration
//    finished if now > extendedEndTime
//    new sort option: finishing soonest?
// - for auctions, reduce 'My Parcels' to only auctioned + adjacent districts?

export default {
  components: {
    PrereqParcels,
    LayoutMapWithFilters,
    NumberDisplay,
    DataFetcherAuctions,
    DataFetcherParcelOwners,
    PaartnerParcelDetails,
    ParcelDetails,
    VortexDetails,
    ParcelList,
    CitaadelMap,
    MapConfig,
    MapMyParcels,
    FilterSize,
    FilterWalls,
    FilterDistricts,
    FilterRoads,
    FilterParcelIds,
    FilterParcelNames,
    FilterBoosts,
    FilterBidders,
    FilterAuctionPrice,
    InputColor
  },
  props: {
    auctionId: { type: String, default: '1' }
  },
  setup (props) {
    // console.time('setup')
    const selectedParcelId = ref(null)
    const {
      parcelsById
    } = useParcels()
    const {
      auctionInfo,
      auctionsByParcelId
    } = useAuctions(props.auctionId)

    // Owners of all parcels
    const {
      ownersByParcelId,
      fetchOwners,
      fetchStatus: ownersFetchStatus
    } = useParcelOwners()

    // When old parcels are present on the map,
    // we need to fetch owners for all parcels,
    // to enable 'My parcels' from all districts to be found and shown
    // and also to display a selected parcel's owner in ParcelDetails.
    if (auctionInfo.hasOldDistricts && !ownersFetchStatus.value.loaded && !ownersFetchStatus.value.loading) {
      fetchOwners()
    }

    const mapConfig = ref(getDefaultMapConfigValue())
    const filters = ref({
      includeNonAuctionParcels: auctionInfo.hasOldDistricts,
      size: [...SIZES],
      districts: getDefaultDistrictsValue(auctionInfo.districts),
      roads: getDefaultRoadsValue(),
      walls: WALLS.map(wall => wall.id),
      boosts: getDefaultBoostsValue(),
      bidders: [],
      price: getDefaultAuctionPriceValue(),
      parcelIds: [],
      parcelNames: []
    })

    const myFilters = ref({
      bidders: [],
      parcelIds: [],
      parcelNames: [],
      owners: auctionInfo.hasOldDistricts ? [] : null
    })

    const colorSchemeOptions = [
      { id: 'price', label: 'Parcel Price (GHST)' },
      { id: 'bidder', label: 'Bidder Address' },
      { id: 'whaleGhst', label: 'Whales (total GHST spent)' },
      { id: 'whalePx', label: 'Whales (total pixel area)' },
      { id: 'highlight', label: 'Simple highlight' }
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
      },
      highlight: '#ffa500'
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
              highestBidder: auction?.highestBidder,
              lastBidTime: auction?.lastBidTime ? new Date(auction.lastBidTime * 1000) : null
            }
          ]
        })
      )
    })

    const parcelsInAuction = computed(() => {
      // console.time('parcelsInAuction')
      // parcels with auctions:
      const result = Object.values(parcelsById.value).filter(parcel => parcelAuctions.value[parcel.id]?.hasAuction)
      // console.timeEnd('parcelsInAuction')
      return result
    })
    const numAuctionParcels = computed(() => parcelsInAuction.value.length)

    const allDisplayableParcels = computed(() => {
      // console.time('allDisplayableParcels')
      // parcels in auction districts:
      const result = Object.values(parcelsById.value).filter(parcel => parcelAuctions.value[parcel.id])
      // console.timeEnd('allDisplayableParcels')
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
      } else if (colorBy === 'highlight') {
        getColor = parcel => colorScheme.value.highlight
      }
      const colorNotInAuction = mapConfig.value.colorNotInAuction
      const parcelsToColor = filters.value.includeNonAuctionParcels ? allDisplayableParcels : parcelsInAuction
      const result = Object.fromEntries(
        parcelsToColor.value.map(parcel => [
          parcel.id,
          parcelAuctions.value[parcel.id].hasAuction ? getColor(parcel) : colorNotInAuction
        ])
      )
      // 'My Parcels' has highest priority, and may also include parcels outside the original list
      const myMatchingParcels = parcelsMatchingMyFilters.value.result
      const colorMyParcels = mapConfig.value.colorMyParcels
      for (const parcelId in myMatchingParcels) {
        result[parcelId] = colorMyParcels
      }
      // console.timeEnd('parcelColors')
      return result
    })

    const parcelsMatchingMyFilters = computed(() => {
      // console.time('parcelsMatchingMyFilters')
      const idFilter = getParcelIdsFilter(myFilters.value.parcelIds, true)
      const nameFilter = getParcelNamesFilter(myFilters.value.parcelNames, true)
      const biddersFilter = getBiddersFilter(parcelAuctions.value, myFilters.value.bidders, true)
      const ownersFilter = getOwnersFilter(ownersByParcelId.value, myFilters.value.owners, true)

      const applyFilters = [idFilter, nameFilter, biddersFilter, ownersFilter]

      let numMatches = 0
      const parcelsToFilter = Object.values(parcelsById.value)
      const result = Object.fromEntries(
        parcelsToFilter.map(parcel => {
          // show parcel if it matches any of the filters
          // default to hide if no filters are set
          let show = false
          for (let i = 0; !show && i < applyFilters.length; i++) {
            if (applyFilters[i](parcel)) {
              show = true
            }
          }
          if (show) {
            numMatches++
          }
          return show ? [parcel.id, parcel] : null
        }).filter(entry => entry) // only include matches in the final object
      )
      // console.timeEnd('parcelsMatchingMyFilters')
      return { result, numMatches }
    })

    const parcelsMatchingFilters = computed(() => {
      // console.time('parcelsMatchingFilters')
      const idFilter = getParcelIdsFilter(filters.value.parcelIds)
      const nameFilter = getParcelNamesFilter(filters.value.parcelNames)
      const sizesFilter = getSizesFilter(filters.value.size)
      const wallsFilter = getWallsFilter(filters.value.walls)
      const districtsFilter = getDistrictsFilter(auctionInfo.districts, filters.value.districts)
      const roadsFilter = getRoadsFilter(filters.value.roads)
      const boostsFilter = getBoostsFilter(filters.value.boosts)
      const biddersFilter = getBiddersFilter(parcelAuctions.value, filters.value.bidders)
      const priceFilter = getAuctionPriceFilter(parcelAuctions.value, filters.value.price)

      const applyFilters = [idFilter, nameFilter, biddersFilter, sizesFilter, wallsFilter, districtsFilter, roadsFilter, boostsFilter, priceFilter]

      let numAuctionMatches = 0
      const includeNonAuctionParcels = filters.value.includeNonAuctionParcels
      const parcelsToFilter = includeNonAuctionParcels ? allDisplayableParcels : parcelsInAuction
      const result = Object.fromEntries(
        parcelsToFilter.value.map(parcel => {
          // show parcel if it matches all of the filters
          // default to show if no filters are set
          let show = true
          for (let i = 0; show && i < applyFilters.length; i++) {
            if (!applyFilters[i](parcel)) {
              show = false
            }
          }
          // We're only interested in the number of auctioned parcels
          if (show && (!includeNonAuctionParcels || parcelAuctions.value[parcel.id].hasAuction)) {
            numAuctionMatches++
          }
          return [parcel.id, show]
        })
      )
      // console.timeEnd('parcelsMatchingFilters')
      return { result, numAuctionMatches }
    })

    const numAuctionParcelsMatchingFilters = computed(() => parcelsMatchingFilters.value.numAuctionMatches)

    const selectedList = ref('matches')

    const parcelsList = computed(() =>
      parcelsInAuction.value.filter(parcel => parcelsMatchingFilters.value.result[parcel.id] && parcelAuctions.value[parcel.id].hasAuction)
    )
    const myParcelsList = computed(() =>
      Object.keys(parcelsMatchingMyFilters.value.result).map(parcelId => parcelsById.value[parcelId])
    )

    const parcelsForMap = computed(() => {
      const parcels = filters.value.includeNonAuctionParcels ? allDisplayableParcels.value : parcelsInAuction.value
      const parcelsForMapById = {}
      for (const parcel of parcels) {
        parcelsForMapById[parcel.id] = parcel
      }
      // myParcels can be from any district: merge them in
      if (parcelsMatchingMyFilters.value.numMatches) {
        Object.assign(parcelsForMapById, parcelsMatchingMyFilters.value.result)
      }
      return Object.values(parcelsForMapById)
    })

    const parcelsMatchingFiltersForMap = computed(() => {
      // combine 'My Parcels' with the matching parcels, so the map applies colors to them all
      if (parcelsMatchingMyFilters.value.numMatches) {
        return {
          ...parcelsMatchingFilters.value.result,
          ...parcelsMatchingMyFilters.value.result
        }
      }
      return parcelsMatchingFilters.value.result
    })

    const refDetailsMyParcels = ref(null)
    const refDetailsColorScheme = ref(null)
    const refDetailsMapConfig = ref(null)
    const refDetailsFilters = ref(null)

    const selectedParcelPaartnerId = ref(null)
    const selectedVortex = ref(null)

    const collapseAllConfig = function () {
      // collapse all map config so the parcel details are easily visible
      for (const refDetails of [refDetailsMyParcels.value?.$el, refDetailsColorScheme.value, refDetailsMapConfig.value?.$el, refDetailsFilters.value]) {
        if (refDetails?.hasAttribute('open')) {
          refDetails.removeAttribute('open')
        }
      }
    }
    const onClickParcel = (parcel) => {
      selectedVortex.value = null
      if (parcel.paartner) {
        selectedParcelPaartnerId.value = parcel.paartner
        selectedParcelId.value = null
      } else {
        selectedParcelId.value = parcel.id
        selectedParcelPaartnerId.value = null
      }
      collapseAllConfig()
    }
    const onClickVortex = (vortex) => {
      selectedVortex.value = vortex
      selectedParcelPaartnerId.value = null
      selectedParcelId.value = null
      collapseAllConfig()
    }

    const onClickParcelFromSidebar = (parcel) => {
      onClickParcel(parcel)
      zoomToParcel(parcel.id, { viewMode: 'both' })
    }

    const selectedParcel = computed(() => {
      if (!selectedParcelId.value) { return null }
      return {
        parcel: parcelsById.value[selectedParcelId.value],
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
      for (const parcel of parcelsInAuction.value) {
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

    const mapRef = ref(null)

    const zoomToParcel = async function (parcelId, { viewMode, setViewModeBoth }) {
      const doZoom = () => {
        const parcel = parcelsById.value[parcelId]
        if (parcel && mapRef.value?.zoomToPoint) {
          mapRef.value.zoomToPoint({
            x: parcel.coordinateX - 0,
            y: parcel.coordinateY - 0
          })
        }
      }
      if (viewMode === 'list') {
        setViewModeBoth()
        nextTick(doZoom)
      } else {
        doZoom()
      }
    }

    // console.timeEnd('setup')
    // console.time('mount')
    return {
      auctionInfo,
      ownersByParcelId,
      parcelsMatchingFiltersForMap,
      parcelsForMap,
      numAuctionParcels,
      numAuctionParcelsMatchingFilters,
      parcelColors,
      auctionsByParcelId,
      selectedList,
      parcelsList,
      myParcelsList,
      onClickParcel,
      onClickParcelFromSidebar,
      onClickVortex,
      selectedParcelId,
      selectedParcel,
      selectedParcelPaartnerId,
      selectedVortex,
      SCALE_NAMES,
      SCALE_GRADIENTS,
      refDetailsMyParcels,
      refDetailsColorScheme,
      refDetailsMapConfig,
      refDetailsFilters,
      mapConfig,
      myFilters,
      filters,
      colorSchemeOptions,
      colorScheme,
      colorSchemeLabel,
      mapRef,
      zoomToParcel
    }
  }
}
</script>

<style scoped>
  .parcel-list--mode-list {
    margin: 10px 0 50px;
  }
  .parcel-list--mode-both {
    margin: 5px 0 0 15px;
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

  .scale-color-display {
    margin-top: 5px;
    width: 80%;
    height: 20px;
  }
  .range-input {
    width: 60px;
  }

  .list-selections {
    margin-bottom: 2px;
  }
  .list-selection {
    margin-right: 10px;
    margin-bottom: 8px;
    padding: 2px 8px;
  }
</style>
