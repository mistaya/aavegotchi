<template>
  <PrereqParcels>
    <LayoutMapWithFilters class="citaadel-page">
      <template #sidebar="{ viewMode, setViewModeBoth }">
        <h1>The Citaadel</h1>

        <div style="margin-bottom: 20px; margin-right: 10px;">
          <DataFetcherBaazaarListings />
          <DataFetcherParcelOwners />
        </div>

        <MapConfig
          ref="refDetailsMapConfig"
          v-model="mapConfig"
        />

        <details
          ref="refDetailsColorScheme"
          class="filter-container"
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

          <div v-if="colorScheme.colorBy === 'lastPrice'">
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
                  <select v-model="colorScheme.lastPrice[size].scaleName">
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
                    'background': SCALE_GRADIENTS[colorScheme.lastPrice[size].scaleName]
                  }"
                />
              </div>
              <div>
                <label>
                  Min:
                  <input
                    v-model="colorScheme.lastPrice[size].min"
                    type="number"
                    class="range-input"
                  />
                </label>
                <label>
                  Max:
                  <input
                    v-model="colorScheme.lastPrice[size].max"
                    type="number"
                    class="range-input"
                  />
                </label>
              </div>
            </div>
          </div>

          <div v-if="colorScheme.colorBy === 'baazaarPrice'">
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
                  <select v-model="colorScheme.baazaarPrice[size].scaleName">
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
                    'background': SCALE_GRADIENTS[colorScheme.baazaarPrice[size].scaleName]
                  }"
                />
              </div>
              <div>
                <label>
                  Min:
                  <input
                    v-model="colorScheme.baazaarPrice[size].min"
                    type="number"
                    class="range-input"
                  />
                </label>
                <label>
                  Max:
                  <input
                    v-model="colorScheme.baazaarPrice[size].max"
                    type="number"
                    class="range-input"
                  />
                </label>
              </div>
            </div>
          </div>

          <div v-if="colorScheme.colorBy === 'owner'">
            <div>
              <label>
                Color Scheme:
                <select v-model="colorScheme.owner.scaleName">
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
                  'background': SCALE_GRADIENTS[colorScheme.owner.scaleName]
                }"
              />
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
            <FilterBaazaar
              v-model="filters.baazaar"
              @requestBaazaarColorScheme="colorScheme.colorBy = 'baazaarPrice'"
            />
            <FilterSize v-model="filters.size" />
            <FilterBaazaarPrice v-model="filters.baazaarPrice" />
            <FilterWalls v-model="filters.walls" />
            <FilterDistricts v-model="filters.districts" />
            <FilterRoads v-model="filters.roads" />
            <FilterParcelIds v-model="filters.parcelIds" />
            <FilterParcelNames v-model="filters.parcelNames" />
            <FilterBoosts v-model="filters.boosts" />
            <FilterOwners v-model="filters.owners" />
          </div>
        </details>

        <MapMyParcels
          ref="refDetailsMyParcels"
          v-model:color="mapConfig.colorMyParcels"
          v-model:filterOwners="myFilters.owners"
          v-model:filterParcelIds="myFilters.parcelIds"
          v-model:filterParcelNames="myFilters.parcelNames"
        />

        <details
          ref="refCoordinates"
          class="filter-container"
        >
          <summary>
            <h3>Where am I?</h3>
          </summary>

          <div style="margin-bottom: 10px; margin-left: 10px;">
            If you're lost in the Gotchiverse, while you're in the game press F3 (or Fn-F3) to see debug info.

            <div style="margin-top: 10px;">
              <label>
                Then copy the Map Coordinates here:
                <input
                  v-model="coordinatesText"
                  placeholder="(346880, 161984)"
                />
              </label>
            </div>

            <div
              v-if="coordinatesParsed"
              style="margin-top: 10px;"
            >
              <SiteButton
                type="button"
                style="margin-right: 10px;"
                @click="zoomToCoordinates"
              >
                Zoom there
              </SiteButton>

              <SiteButton
                type="button"
                @click="clearCoordinates"
              >
                Clear
              </SiteButton>
            </div>
          </div>
        </details>

        <section style="padding: 0 10px 20px 0;">
          <PaartnerParcelDetails
            v-if="selectedParcelPaartnerId"
            :paartner="selectedParcelPaartnerId"
            @close="selectedParcelPaartnerId = null"
          />
          <ParcelDetails
            v-if="selectedParcel"
            :parcel="selectedParcel.parcel"
            :listing="selectedParcel.currentListing"
            :lastSale="selectedParcel.lastSale"
            :auctionPrice="selectedParcel.auctionPrice"
            :owner="selectedParcel.owner"
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
        <ParcelsExport
          v-if="numParcelsMatchingFilters > 0"
          :parcels="parcelsList"
          style="float: right; margin: 0 0 8px 10px"
        />
        <div style="display: inline-block; margin-bottom: 8px;">
          <template v-if="numParcelsMatchingFilters === numParcelsToDisplay">
            Matched all
            <NumberDisplay :number="numParcelsMatchingFilters" />
            parcels
          </template>
          <template v-else-if="numParcelsMatchingFilters === 0">
            No parcels matched your filters, out of
            <NumberDisplay :number="numParcelsToDisplay" />
            parcels
          </template>
          <template v-else>
            Matched
            <NumberDisplay :number="numParcelsMatchingFilters" />
            parcels (<NumberDisplay :number="percentParcelsMatchingFilters" />% of
            <NumberDisplay :number="numParcelsToDisplay" />
            currently available)
          </template>
        </div>
      </template>
      <template #main="{ viewMode }">
        <CitaadelMap
          ref="mapRef"
          v-show="viewMode === 'map' || viewMode === 'both'"
          :mapConfig="mapConfig"
          :parcels="parcelsToDisplay"
          :parcelsMatchingFilters="parcelsMatchingFiltersForMap"
          :parcelColors="parcelColors"
          :selectedParcel="selectedParcel?.parcel"
          :marker="mapMarker"
          @click:parcel="onClickParcel"
          @click:vortex="onClickVortex"
        />
        <template v-if="viewMode === 'list'">
          <div class="list-selections">
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
            :ownersByParcelId="ownersByParcelId"
            :listingsByParcelId="listingsByParcelId"
            :salesByParcelId="salesByParcelId"
            :selectedParcelId="selectedParcelId"
            :disableSorting="selectedList === 'my'"
            @click:parcel="onClickParcel"
          />
        </template>
      </template>
      <template #sidebar2="{ viewMode }">
        <template v-if="viewMode === 'both'">
          <div
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
            :ownersByParcelId="ownersByParcelId"
            :listingsByParcelId="listingsByParcelId"
            :salesByParcelId="salesByParcelId"
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
import { ref, computed, watch, nextTick } from 'vue'
import useParcels from '@/data/useParcels'
import useBaazaarListings from '@/data/useBaazaarListings'
import useParcelPrices from '@/data/useParcelPrices'
import useParcelOwners from '@/data/useParcelOwners'
import { WALLS } from '@/data/walls'
import { SCALE_NAMES, SCALE_GRADIENTS, getSequentialScale } from './colorScales'
import NumberDisplay from './NumberDisplay.vue'
import DataFetcherBaazaarListings from './DataFetcherBaazaarListings.vue'
import DataFetcherParcelOwners from './DataFetcherParcelOwners.vue'
import PrereqParcels from './PrereqParcels.vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import PaartnerParcelDetails from './PaartnerParcelDetails.vue'
import ParcelDetails from './ParcelDetails.vue'
import VortexDetails from './VortexDetails.vue'
import ParcelList from './ParcelList.vue'
import ParcelsExport from './ParcelsExport.vue'
import CitaadelMap from './CitaadelMap.vue'
import MapConfig, { getDefaultValue as getDefaultMapConfigValue } from './MapConfig.vue'
import MapMyParcels from './MapMyParcels.vue'
import FilterBaazaar, { getDefaultValue as getDefaultBaazarValue, getFilter as getBaazaarFilter } from './FilterBaazaar.vue'
import FilterBaazaarPrice, { getDefaultValue as getDefaultBaazarPriceValue, getFilter as getBaazaarPriceFilter } from './FilterBaazaarPrice.vue'
import FilterSize, { SIZES, getFilter as getSizesFilter } from './FilterSize.vue'
import FilterWalls, { getFilter as getWallsFilter } from './FilterWalls.vue'
import FilterDistricts, { DISTRICTS, getDefaultValue as getDefaultDistrictsValue, getFilter as getDistrictsFilter } from './FilterDistricts.vue'
import FilterRoads, { getDefaultValue as getDefaultRoadsValue, getFilter as getRoadsFilter } from './FilterRoads.vue'
import FilterParcelIds, { getFilter as getParcelIdsFilter } from './FilterParcelIds.vue'
import FilterParcelNames, { getFilter as getParcelNamesFilter } from './FilterParcelNames.vue'
import FilterBoosts, { getDefaultValue as getDefaultBoostsValue, getFilter as getBoostsFilter } from './FilterBoosts.vue'
import FilterOwners, { getFilter as getOwnersFilter } from './FilterOwners.vue'
import InputColor from './InputColor.vue'

export default {
  components: {
    PrereqParcels,
    LayoutMapWithFilters,
    DataFetcherBaazaarListings,
    DataFetcherParcelOwners,
    NumberDisplay,
    PaartnerParcelDetails,
    ParcelDetails,
    VortexDetails,
    ParcelList,
    ParcelsExport,
    CitaadelMap,
    MapConfig,
    MapMyParcels,
    FilterBaazaar,
    FilterBaazaarPrice,
    FilterSize,
    FilterWalls,
    FilterDistricts,
    FilterRoads,
    FilterParcelIds,
    FilterParcelNames,
    FilterBoosts,
    FilterOwners,
    InputColor
  },
  setup () {
    const {
      listingsByParcelId,
      salesByParcelId,
      fetchStatus: baazaarListingsFetchStatus,
      fetchListings: fetchBaazaarListings
    } = useBaazaarListings()

    const { pricesByParcelId } = useParcelPrices()
    const {
      ownersByParcelId,
      fetchStatus: ownersFetchStatus,
      fetchOwners
    } = useParcelOwners()

    const mapConfig = ref(getDefaultMapConfigValue())

    const filters = ref({
      baazaar: getDefaultBaazarValue(),
      baazaarPrice: getDefaultBaazarPriceValue(),
      size: [...SIZES],
      walls: WALLS.map(wall => wall.id),
      districts: getDefaultDistrictsValue([...DISTRICTS]),
      roads: getDefaultRoadsValue(),
      parcelIds: [],
      parcelNames: [],
      boosts: getDefaultBoostsValue(),
      owners: []
    })
    const myFilters = ref({
      parcelIds: [],
      parcelNames: [],
      owners: []
    })

    const colorSchemeOptions = [
      { id: 'lastPrice', label: 'Last Sold Price (GHST)' },
      { id: 'baazaarPrice', label: 'Baazaar Listing Price (GHST)' },
      { id: 'owner', label: 'Owner Address' },
      { id: 'whalePx', label: 'Whales (total pixel area)' },
      { id: 'highlight', label: 'Simple highlight' }
    ]
    const colorScheme = ref({
      colorBy: 'lastPrice',
      lastPrice: {
        humble: {
          min: 70,
          max: 500,
          scaleName: 'viridis'
        },
        reasonable: {
          min: 170,
          max: 1000,
          scaleName: 'viridis'
        },
        spacious: {
          min: 1000,
          max: 3000,
          scaleName: 'viridis'
        }
      },
      baazaarPrice: {
        humble: {
          min: 70,
          max: 500,
          scaleName: 'viridis'
        },
        reasonable: {
          min: 170,
          max: 1000,
          scaleName: 'viridis'
        },
        spacious: {
          min: 1000,
          max: 3000,
          scaleName: 'viridis'
        }
      },
      owner: {
        scaleName: 'rainbow',
        min: 0,
        max: parseInt('0xffffffffffffffffffffffffffffffffffffffff', 16)
      },
      whalePx: {
        scaleName: 'inferno',
        min: 0,
        max: 150_000
      },
      highlight: '#ffa500'
    })
    const colorSchemeLabel = computed(() => colorSchemeOptions.find(option => option.id === colorScheme.value.colorBy)?.label)

    // Watch for settings that require extra data to be fetched,
    // and fetch that data if necessary
    const prereqBaazaarListings = function () {
      if (!baazaarListingsFetchStatus.value.loaded && !baazaarListingsFetchStatus.value.loading) {
        fetchBaazaarListings()
      }
    }
    const prereqOwners = function () {
      if (!ownersFetchStatus.value.loaded && !ownersFetchStatus.value.loading) {
        fetchOwners()
      }
    }
    watch(
      () => colorScheme.value.colorBy,
      colorBy => {
        if (['baazaarPrice', 'lastPrice'].includes(colorBy)) {
          // these color schemes require baazaar listings
          // make sure it's fetched at least once
          prereqBaazaarListings()
        }
        if (['owner', 'whalePx'].includes(colorBy)) {
          prereqOwners()
        }
      },
      { immediate: true }
    )
    watch(
      () => filters.value.baazaar,
      baazaarFilter => {
        if (baazaarFilter !== 'all') {
          prereqBaazaarListings()
        }
      }
    )
    watch(
      () => [filters.value.owners, myFilters.value.owners],
      ([ownersFilter, ownersMyFilter]) => {
        if (ownersFilter?.length || ownersMyFilter?.length) {
          prereqOwners()
        }
      }
    )

    const lastPriceScalesBySize = computed(() => {
      const scales = {}
      const configBySize = colorScheme.value.lastPrice
      for (const key in configBySize) {
        const config = configBySize[key]
        scales[key] = getSequentialScale(config)
      }
      return scales
    })

    const baazaarPriceScalesBySize = computed(() => {
      const scales = {}
      const configBySize = colorScheme.value.baazaarPrice
      for (const key in configBySize) {
        const config = configBySize[key]
        scales[key] = getSequentialScale(config)
      }
      return scales
    })

    const ownerScale = computed(() => {
      return getSequentialScale(colorScheme.value.owner)
    })
    const TOP_OWNERS_N = 10
    const topOwnerScale = computed(() => {
      return getSequentialScale({
        scaleName: colorScheme.value.owner.scaleName,
        min: 0,
        max: TOP_OWNERS_N
      })
    })

    const whalePxScale = computed(() => {
      return getSequentialScale(colorScheme.value.whalePx)
    })

    const whalesPx = computed(() => {
      const totalPerOwner = {}
      const pxBySizeLabel = {
        humble: 8 * 8,
        reasonable: 16 * 16,
        spacious: 32 * 64
      }
      for (const parcelId in ownersByParcelId.value) {
        const owner = ownersByParcelId.value[parcelId]
        if (!totalPerOwner[owner]) {
          totalPerOwner[owner] = 0
        }
        const parcel = parcelsById.value[parcelId]
        if (parcel) {
          totalPerOwner[owner] += (pxBySizeLabel[parcel.sizeLabel] || 0)
        }
      }

      return totalPerOwner
    })

    const sortedWhalePx = computed(() =>
      Object.entries(whalesPx.value).sort((a, b) => {
        if (a[1] === b[1]) { return 0 }
        return a[1] < b[1] ? 1 : -1
      })
    )

    const { parcelsById, fetchStatus: parcelsFetchStatus } = useParcels()

    const parcelsToDisplay = computed(() => Object.values(parcelsById.value))
    const numParcelsToDisplay = computed(() => parcelsToDisplay.value.length)

    const parcelColors = computed(() => {
      // console.time('parcelColors')
      const colorBy = colorScheme.value.colorBy
      let getColor = () => null
      if (colorBy === 'lastPrice') {
        getColor = parcel => {
          const scale = lastPriceScalesBySize.value[parcel.sizeLabel]
          if (!scale) { return null }
          const lastPrice = pricesByParcelId.value[parcel.id]?.lastPrice
          if (lastPrice) {
            return scale(lastPrice - 0)
          }
          return null
        }
      } else if (colorBy === 'baazaarPrice') {
        getColor = parcel => {
          const scale = baazaarPriceScalesBySize.value[parcel.sizeLabel]
          if (!scale) { return null }
          const currentListing = listingsByParcelId.value[parcel.id]
          if (currentListing) {
            return scale(currentListing.priceInGhst.toNumber())
          }
          return null
        }
      } else if (colorBy === 'owner') {
        const topOwners = sortedWhalePx.value.slice(0, TOP_OWNERS_N).map(item => item[0])
        getColor = parcel => {
          const owner = ownersByParcelId.value[parcel.id]
          const topIndex = topOwners.indexOf(owner)
          if (topIndex !== -1) {
            // try to ensure the top px owners have different colors from each other,
            // as they cover more of the map
            return topOwnerScale.value(topIndex)
          }
          return ownerScale.value(parseInt(owner, 16))
        }
      } else if (colorBy === 'whalePx') {
        getColor = parcel => {
          const owner = ownersByParcelId.value[parcel.id]
          return whalePxScale.value(whalesPx.value[owner] || 0)
        }
      } else if (colorBy === 'highlight') {
        getColor = parcel => colorScheme.value.highlight
      }
      const myMatchingParcels = parcelsMatchingMyFilters.value.result
      const colorMyParcels = mapConfig.value.colorMyParcels
      const result = Object.fromEntries(
        parcelsToDisplay.value.map(parcel => {
          // 'My Parcels' has highest priority
          const color = myMatchingParcels[parcel.id] ? colorMyParcels : getColor(parcel) || null
          return [
            parcel.id,
            color
          ]
        })
      )
      // console.timeEnd('parcelColors')
      return result
    })

    const parcelsMatchingMyFilters = computed(() => {
      // console.time('parcelsMatchingMyFilters')
      const idFilter = getParcelIdsFilter(myFilters.value.parcelIds, true)
      const nameFilter = getParcelNamesFilter(myFilters.value.parcelNames, true)
      const ownersFilter = getOwnersFilter(ownersByParcelId.value, myFilters.value.owners, true)

      const applyFilters = [idFilter, nameFilter, ownersFilter]

      let numMatches = 0
      const result = Object.fromEntries(
        parcelsToDisplay.value.map(parcel => {
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
      // console.log('start parcelsMatchingFilters')
      const idFilter = getParcelIdsFilter(filters.value.parcelIds)
      const nameFilter = getParcelNamesFilter(filters.value.parcelNames)
      const baazaarFilter = getBaazaarFilter(listingsByParcelId.value, filters.value.baazaar)
      const baazaarPriceFilter = getBaazaarPriceFilter(listingsByParcelId.value, filters.value.baazaarPrice)
      const sizesFilter = getSizesFilter(filters.value.size)
      const wallsFilter = getWallsFilter(filters.value.walls)
      const districtsFilter = getDistrictsFilter(DISTRICTS, filters.value.districts)
      const roadsFilter = getRoadsFilter(filters.value.roads)
      const boostsFilter = getBoostsFilter(filters.value.boosts)
      const ownersFilter = getOwnersFilter(ownersByParcelId.value, filters.value.owners)

      const applyFilters = [idFilter, nameFilter, baazaarFilter, baazaarPriceFilter, ownersFilter, sizesFilter, wallsFilter, districtsFilter, roadsFilter, boostsFilter]

      let numMatches = 0
      const result = Object.fromEntries(
        parcelsToDisplay.value.map(parcel => {
          // show parcel if it matches all of the filters
          // default to show if no filters are set
          let show = true
          for (let i = 0; show && i < applyFilters.length; i++) {
            if (!applyFilters[i](parcel)) {
              show = false
            }
          }
          if (show) { numMatches++ }
          return [parcel.id, show]
        })
      )
      // console.timeEnd('parcelsMatchingFilters')
      return { result, numMatches }
    })

    const numParcelsMatchingFilters = computed(() => parcelsMatchingFilters.value.numMatches)
    const percentParcelsMatchingFilters = computed(() => {
      const percent = (numParcelsMatchingFilters.value / numParcelsToDisplay.value) * 100
      const rounded = Math.round(percent)
      if (rounded > 5) {
        return rounded
      }
      // add more decimals if percent is small
      return Math.round(100 * percent) / 100
    })

    const selectedParcelId = ref(null)
    const selectedParcel = computed(() => {
      const parcelId = selectedParcelId.value
      if (!parcelId) { return null }
      const currentListing = listingsByParcelId.value[parcelId]
      const lastSale = salesByParcelId.value[parcelId]
      const auctionPrice = pricesByParcelId.value[parcelId]?.auctionPrice
      const owner = ownersByParcelId.value[parcelId]
      return {
        parcel: parcelsById.value[parcelId],
        currentListing,
        lastSale,
        auctionPrice,
        owner
      }
    })

    const refDetailsMyParcels = ref(null)
    const refDetailsColorScheme = ref(null)
    const refDetailsMapConfig = ref(null)
    const refDetailsFilters = ref(null)
    const refCoordinates = ref(null)

    const selectedParcelPaartnerId = ref(null)
    const selectedVortex = ref(null)

    const collapseAllConfig = function () {
      // collapse all map config so the parcel details are easily visible
      for (const refDetails of [refDetailsMyParcels.value?.$el, refDetailsColorScheme.value, refDetailsMapConfig.value?.$el, refDetailsFilters.value, refCoordinates.value]) {
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

    const selectedList = ref('matches')

    const parcelsList = computed(() => parcelsToDisplay.value.filter(parcel => parcelsMatchingFilters.value.result[parcel.id]))
    const myParcelsList = computed(() =>
      Object.keys(parcelsMatchingMyFilters.value.result).map(parcelId => parcelsById.value[parcelId])
    )

    const mapRef = ref(null)

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

    const coordinatesText = ref('')
    const coordinatesRegexp = /\((\d+), (\d+)\)/
    const coordinatesParsed = computed(() => {
      if (!coordinatesText.value) { return null }
      const matches = coordinatesText.value.match(coordinatesRegexp)
      if (matches?.[1] && matches[2]) {
        return {
          x: Math.round(matches[1] / 64),
          y: Math.round(matches[2] / 64)
        }
      }
      return null
    })
    const mapMarker = computed(() => {
      if (!coordinatesParsed.value) { return null }
      return {
        coordinateX: coordinatesParsed.value.x,
        coordinateY: coordinatesParsed.value.y
      }
    })
    const zoomToCoordinates = function () {
      const coords = coordinatesParsed.value
      if (coords && mapRef.value?.zoomToPoint) {
        mapRef.value.zoomToPoint(coords)
      }
    }
    const clearCoordinates = function () {
      coordinatesText.value = ''
      if (refCoordinates.value?.hasAttribute('open')) {
        refCoordinates.value.removeAttribute('open')
      }
    }
    watch(
      () => coordinatesParsed.value,
      () => {
        if (coordinatesParsed.value) {
          zoomToCoordinates()
        }
      }
    )

    return {
      parcelsFetchStatus,
      refDetailsMyParcels,
      refDetailsColorScheme,
      refDetailsMapConfig,
      refDetailsFilters,
      refCoordinates,
      mapConfig,
      filters,
      myFilters,
      colorScheme,
      colorSchemeLabel,
      colorSchemeOptions,
      SCALE_NAMES,
      SCALE_GRADIENTS,
      baazaarListingsFetchStatus,
      parcelsToDisplay,
      parcelsMatchingFiltersForMap,
      numParcelsToDisplay,
      numParcelsMatchingFilters,
      percentParcelsMatchingFilters,
      parcelColors,
      onClickParcel,
      onClickParcelFromSidebar,
      onClickVortex,
      selectedParcelId,
      selectedParcel,
      selectedParcelPaartnerId,
      selectedVortex,
      selectedList,
      parcelsList,
      myParcelsList,
      ownersByParcelId,
      listingsByParcelId,
      salesByParcelId,
      mapRef,
      zoomToParcel,
      coordinatesText,
      coordinatesParsed,
      zoomToCoordinates,
      clearCoordinates,
      mapMarker
    }
  }
}
</script>

<style scoped>
  .scale-color-display {
    margin-top: 5px;
    width: 80%;
    height: 20px;
  }
  .range-input {
    width: 60px;
  }

  .citaadel-page {
    height: 100%;
  }

  .parcel-list--mode-list {
    margin: 10px 0 50px;
  }
  .parcel-list--mode-both {
    margin: 5px 0 0 15px;
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
