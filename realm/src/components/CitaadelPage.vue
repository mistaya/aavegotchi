<template>
  <PrereqParcels>
    <LayoutMapWithFilters>
      <template #sidebar="{ viewMode, setViewModeMap }">
        <h1>The Citaadel</h1>

        <div style="margin-bottom: 20px; margin-right: 10px;">
          <DataFetcherBaazaarListings />
          <DataFetcherParcelOwners />
        </div>

        <details class="filter-container">
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
              <input
                type="color"
                :value="colorScheme.highlight"
                @input="debouncedSetHighlight($event.target.value)"
              >
            </label>
          </div>
        </details>

        <MapConfig v-model="mapConfig" />
        <FilterBaazaar v-model="filters.baazaar" />
        <FilterSize v-model="filters.size" />
        <FilterWalls v-model="filters.walls" />
        <FilterDistricts v-model="filters.districts" />
        <FilterRoads v-model="filters.roads" />
        <FilterParcelIds v-model="filters.parcelIds" />
        <FilterParcelNames v-model="filters.parcelNames" />
        <FilterBoosts v-model="filters.boosts" />
        <FilterOwners v-model="filters.owners" />

        <section>
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
            style="margin: 0 10px 20px 0;"
            @close="selectedParcelId = null"
            @zoomToParcel="zoomToParcel(selectedParcelId, { viewMode, setViewModeMap })"
          />
        </section>
      </template>
      <template #top>
        <template v-if="numParcelsMatchingFilters === numParcelsToDisplay">
          Matched all {{ numParcelsMatchingFilters }} parcels
        </template>
        <template v-else-if="numParcelsMatchingFilters === 0">
          No parcels matched your filters, out of {{ numParcelsToDisplay }} parcels
        </template>
        <template v-else>
          Matched {{ numParcelsMatchingFilters }} parcels ({{ percentParcelsMatchingFilters }}% of {{ numParcelsToDisplay }} currently available)
        </template>
      </template>
      <template #main="{ viewMode }">
        <CitaadelMap
          ref="mapRef"
          v-show="viewMode === 'map'"
          :mapConfig="mapConfig"
          :parcels="parcelsToDisplay"
          :parcelsMatchingFilters="parcelsMatchingFilters.result"
          :parcelColors="parcelColors"
          :selectedParcel="selectedParcel?.parcel"
          @click:parcel="onClickParcel"
        />
        <div v-if="viewMode === 'list'">
          <template v-if="!listParcelsToDisplay.length">
            No parcels found.
          </template>
          <template v-else>
            <div style="margin-top: 20px; margin-left: 20px;">
              <label>
                Sort by:
                <select v-model="listParcelsOrder">
                  <option
                    v-for="option in LIST_PARCELS_ORDERS"
                    :key="option.id"
                    :value="option.id"
                  >
                    {{ option.label }}
                  </option>
                </select>
              </label>
            </div>
            <PagingControls
              v-model="paging"
              :numItems="numParcelsMatchingFilters"
              itemsLabel="parcels"
              class="parcels-paging parcels-paging--top"
            />
            <ul class="parcels-list">
              <li
                v-for="(parcel, index) in listParcelsToDisplay"
                :key="parcel.id"
                class="parcels-list-item"
                :class="`parcel-size--${parcel.sizeLabel.toLowerCase()}`"
              >
                <div class="parcel-index">
                  {{ index + 1 }}.
                </div>
                <div class="parcel-info">
                  <div>
                    <a
                      href="#"
                      class="parcel-id"
                      @click.prevent="onClickParcel(parcel)"
                    >
                      {{ parcel.id }}
                    </a>
                    <span class="parcel-name">
                      {{ parcel.parcelHash }}
                    </span>
                    <span
                      v-if="ownersByParcelId[parcel.id] || listingsByParcelId[parcel.id]"
                      class="parcel-owner"
                    >
                      <EthIcon
                        :address="ownersByParcelId[parcel.id] || listingsByParcelId[parcel.id].seller"
                        style="width: 15px"
                        :title="`Owner: ${ownersByParcelId[parcel.id] || listingsByParcelId[parcel.id].seller}`"
                      />
                    </span>
                  </div>

                  <div>
                    <span class="parcel-district">
                      D{{ parcel.district }}
                    </span>
                    <span class="parcel-size">
                      &nbsp;{{ parcel.sizeLabel }}
                    </span>
                    <ParcelBoosts
                      v-if="parcel.hasBoost"
                      :fomo="parcel.fomoBoost"
                      :fud="parcel.fudBoost"
                      :alpha="parcel.alphaBoost"
                      :kek="parcel.kekBoost"
                      class="parcel-boosts"
                    />
                  </div>
                </div>
                <div
                  class="parcel-baazaar"
                  v-if="listingsByParcelId[parcel.id] || salesByParcelId[parcel.id]"
                >
                  <div
                    v-if="listingsByParcelId[parcel.id]"
                    class="parcel-baazaar-listing parcel-baazaar-listing--current"
                  >
                    <a
                      :href="`https://aavegotchi.com/baazaar/erc721/${listingsByParcelId[parcel.id].id}`"
                      target="_blank"
                    >
                      <span>
                        Listed for {{ listingsByParcelId[parcel.id].priceInGhst.toString() }} GHST
                      </span>
                      <SiteIcon name="open-window" />
                    </a>
                    (<DateFriendly :date="listingsByParcelId[parcel.id].dateCreated" />)
                  </div>
                  <div
                    v-if="salesByParcelId[parcel.id]"
                    class="parcel-baazaar-listing parcel-baazaar-listing--last-sold"
                  >
                    <a
                      :href="`https://aavegotchi.com/baazaar/erc721/${salesByParcelId[parcel.id].id}`"
                      target="_blank"
                    >
                      <span>
                        Last sold for {{ salesByParcelId[parcel.id].priceInGhst.toString() }} GHST
                      </span>
                      <SiteIcon name="open-window" />
                    </a>
                    (<DateFriendly :date="salesByParcelId[parcel.id].datePurchased" />)
                  </div>
                </div>
              </li>
            </ul>
            <PagingControls
              v-model="paging"
              :numItems="numParcelsMatchingFilters"
              itemsLabel="parcels"
              class="parcels-paging parcels-paging--bottom"
            />
          </template>
        </div>
      </template>
    </LayoutMapWithFilters>
  </PrereqParcels>
</template>

<script>
import { ref, computed, watch, nextTick } from 'vue'
import { inPlaceSort } from 'fast-sort'
import debounce from 'lodash.debounce'
import useParcels from '@/data/useParcels'
import useBaazaarListings from '@/data/useBaazaarListings'
import useParcelPrices from '@/data/useParcelPrices'
import useParcelOwners from '@/data/useParcelOwners'
import { WALLS } from '@/data/walls'
import { SCALE_NAMES, SCALE_GRADIENTS, getSequentialScale } from './colorScales'
import DataFetcherBaazaarListings from './DataFetcherBaazaarListings.vue'
import DataFetcherParcelOwners from './DataFetcherParcelOwners.vue'
import PrereqParcels from './PrereqParcels.vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import DateFriendly from './DateFriendly.vue'
import EthIcon from './EthIcon.vue'
import PaartnerParcelDetails from './PaartnerParcelDetails.vue'
import PagingControls from './PagingControls.vue'
import ParcelBoosts from './ParcelBoosts.vue'
import ParcelDetails from './ParcelDetails.vue'
import CitaadelMap from './CitaadelMap.vue'
import MapConfig, { getDefaultValue as getDefaultMapConfigValue } from './MapConfig.vue'
import FilterBaazaar, { getDefaultValue as getDefaultBaazarValue, getFilter as getBaazaarFilter } from './FilterBaazaar.vue'
import FilterSize, { SIZES, getFilter as getSizesFilter } from './FilterSize.vue'
import FilterWalls, { getFilter as getWallsFilter } from './FilterWalls.vue'
import FilterDistricts, { DISTRICTS, getDefaultValue as getDefaultDistrictsValue, getFilter as getDistrictsFilter } from './FilterDistricts.vue'
import FilterRoads, { getDefaultValue as getDefaultRoadsValue, getFilter as getRoadsFilter } from './FilterRoads.vue'
import FilterParcelIds, { getFilter as getParcelIdsFilter } from './FilterParcelIds.vue'
import FilterParcelNames, { getFilter as getParcelNamesFilter } from './FilterParcelNames.vue'
import FilterBoosts, { getDefaultValue as getDefaultBoostsValue, getFilter as getBoostsFilter } from './FilterBoosts.vue'
import FilterOwners, { getFilter as getOwnersFilter } from './FilterOwners.vue'

export default {
  components: {
    PrereqParcels,
    LayoutMapWithFilters,
    EthIcon,
    DateFriendly,
    DataFetcherBaazaarListings,
    DataFetcherParcelOwners,
    PaartnerParcelDetails,
    PagingControls,
    ParcelBoosts,
    ParcelDetails,
    CitaadelMap,
    MapConfig,
    FilterBaazaar,
    FilterSize,
    FilterWalls,
    FilterDistricts,
    FilterRoads,
    FilterParcelIds,
    FilterParcelNames,
    FilterBoosts,
    FilterOwners
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
      size: [...SIZES],
      walls: WALLS.map(wall => wall.id),
      districts: getDefaultDistrictsValue([...DISTRICTS]),
      roads: getDefaultRoadsValue(),
      parcelIds: [],
      parcelNames: [],
      boosts: getDefaultBoostsValue(),
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
    const debouncedSetHighlight = debounce((color) => {
      colorScheme.value.highlight = color
    }, 300)

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
      () => filters.value.owners,
      ownersFilter => {
        if (ownersFilter?.length) {
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
      const result = Object.fromEntries(
        parcelsToDisplay.value.map(parcel => [
          parcel.id,
          getColor(parcel) || null
        ])
      )
      // console.timeEnd('parcelColors')
      return result
    })

    const parcelsMatchingFilters = computed(() => {
      // console.time('parcelsMatchingFilters')
      // console.log('start parcelsMatchingFilters')
      const idFilter = getParcelIdsFilter(filters.value.parcelIds)
      const nameFilter = getParcelNamesFilter(filters.value.parcelNames)
      const baazaarFilter = getBaazaarFilter(listingsByParcelId.value, filters.value.baazaar)
      const sizesFilter = getSizesFilter(filters.value.size)
      const wallsFilter = getWallsFilter(filters.value.walls)
      const districtsFilter = getDistrictsFilter(DISTRICTS, filters.value.districts)
      const roadsFilter = getRoadsFilter(filters.value.roads)
      const boostsFilter = getBoostsFilter(filters.value.boosts)
      const ownersFilter = getOwnersFilter(ownersByParcelId.value, filters.value.owners)

      const applyFilters = [idFilter, nameFilter, baazaarFilter, ownersFilter, sizesFilter, wallsFilter, districtsFilter, roadsFilter, boostsFilter]

      let numMatches = 0
      const result = Object.fromEntries(
        parcelsToDisplay.value.map(parcel => {
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

    const selectedParcelPaartnerId = ref(null)

    const onClickParcel = (parcel) => {
      if (parcel.paartner) {
        selectedParcelPaartnerId.value = parcel.paartner
        selectedParcelId.value = null
      } else {
        selectedParcelId.value = parcel.id
        selectedParcelPaartnerId.value = null
      }
    }

    const paging = ref({
      page: 0,
      pageSize: 100
    })
    const LIST_PARCELS_ORDERS = [
      {
        id: 'listingPrice',
        label: 'Cheapest Listings (Baazaar)',
        sort: { asc: p => listingsByParcelId.value[p.id]?.priceInGhstJsNum }
      },
      {
        id: 'salePrice',
        label: 'Cheapest Sales (Baazaar)',
        sort: { asc: p => salesByParcelId.value[p.id]?.priceInGhstJsNum }
      },
      {
        id: 'listingDate',
        label: 'Recent Listings (Baazaar)',
        sort: { desc: p => listingsByParcelId.value[p.id]?.dateCreated }
      },
      {
        id: 'saleDate',
        label: 'Recent Sales (Baazaar)',
        sort: { desc: p => salesByParcelId.value[p.id]?.datePurchased }
      }
    ]
    const listParcelsOrder = ref(LIST_PARCELS_ORDERS[0].id)

    watch(
      () => numParcelsMatchingFilters.value,
      () => { paging.value.page = 0 }
    )

    const listParcels = computed(() => {
      // console.time('listParcels')
      // console.log('start listParcels')
      const parcels = parcelsToDisplay.value.filter(parcel => parcelsMatchingFilters.value.result[parcel.id])
      // console.timeLog('listParcels')

      inPlaceSort(parcels).by([
        LIST_PARCELS_ORDERS.find(entry => entry.id === listParcelsOrder.value).sort,
        { asc: p => p.district - 0 },
        { asc: p => p.id - 0 }
      ])
      // console.timeEnd('listParcels')
      return parcels
    })

    const listParcelsToDisplay = computed(() => {
      const start = paging.value.page * paging.value.pageSize
      const end = start + paging.value.pageSize
      return listParcels.value.slice(start, end)
    })

    const mapRef = ref(null)

    const zoomToParcel = async function (parcelId, { viewMode, setViewModeMap }) {
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
        setViewModeMap()
        nextTick(doZoom)
      } else {
        doZoom()
      }
    }

    return {
      parcelsFetchStatus,
      mapConfig,
      filters,
      colorScheme,
      colorSchemeLabel,
      colorSchemeOptions,
      debouncedSetHighlight,
      SCALE_NAMES,
      SCALE_GRADIENTS,
      baazaarListingsFetchStatus,
      parcelsToDisplay,
      parcelsMatchingFilters,
      numParcelsToDisplay,
      numParcelsMatchingFilters,
      percentParcelsMatchingFilters,
      parcelColors,
      onClickParcel,
      selectedParcelId,
      selectedParcel,
      selectedParcelPaartnerId,
      paging,
      LIST_PARCELS_ORDERS,
      listParcelsOrder,
      listParcelsToDisplay,
      ownersByParcelId,
      listingsByParcelId,
      salesByParcelId,
      mapRef,
      zoomToParcel
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

  .parcels-paging--top {
    margin-top: 10px;
  }
  .parcels-paging--bottom {
    margin-bottom: 50px;
  }
  .parcels-list {
    list-style-type: none;
    margin: 20px 0;
    padding: 0;

    --humble-color--r: 75;
    --humble-color--g: 117;
    --humble-color--b: 197;
    --humble-color: rgb(var(--humble-color--r), var(--humble-color--g), var(--humble-color--b));
    --humble-color-bg: rgb(var(--humble-color--r), var(--humble-color--g), var(--humble-color--b), 0.15);
    --reasonable-color--r: 0;
    --reasonable-color--g: 110;
    --reasonable-color--b: 82;
    --reasonable-color: rgb(var(--reasonable-color--r), var(--reasonable-color--g), var(--reasonable-color--b));
    --reasonable-color-bg: rgb(var(--reasonable-color--r), var(--reasonable-color--g), var(--reasonable-color--b), 0.15);
    --spacious-color--r: 81;
    --spacious-color--g: 0;
    --spacious-color--b: 162;
    --spacious-color: rgb(var(--spacious-color--r), var(--spacious-color--g), var(--spacious-color--b));
    --spacious-color-bg: rgb(var(--spacious-color--r), var(--spacious-color--g), var(--spacious-color--b), 0.15);
  }
  .parcels-list-item {
    --parcel-width: 50%;
    --parcel-color: black;
    --parcel-color-bg: rgba(0,0,0,0.15);

    position: relative;
    margin: 0 0 10px 0;
    padding: 7px 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    background: linear-gradient(to right, var(--parcel-color-bg), transparent var(--parcel-width), transparent 100%);
  }
  .parcels-list-item.parcel-size--humble {
    --parcel-width: 10%;
    --parcel-color: var(--humble-color);
    --parcel-color-bg: var(--humble-color-bg);
  }
  .parcels-list-item.parcel-size--reasonable {
    --parcel-width: 30%;
    --parcel-color: var(--reasonable-color);
    --parcel-color-bg: var(--reasonable-color-bg);
  }
  .parcels-list-item.parcel-size--spacious {
    --parcel-width: 100%;
    --parcel-color: var(--spacious-color);
    --parcel-color-bg: var(--spacious-color-bg);
  }

  .parcels-list-item .parcel-index {
    padding-top: 10px;
    color: rgba(0,0,0,0.3);
  }
  .parcels-list-item .parcel-info > div {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    padding: 2px 0;
  }
  .parcels-list-item .parcel-name {
    font-family: monospace;
  }
  .parcels-list-item .parcel-district {
    margin-right: 5px;
  }
  .parcels-list-item .parcel-size {
    margin-right: 10px;
  }
  .parcels-list-item .parcel-size {
    text-transform: capitalize;
  }
  .parcels-list-item .parcel-baazaar {
    padding-top: 3px;
  }
  .parcels-list-item .parcel-baazaar-listing .icon {
    width: 13px;
  }
  .parcels-list-item .parcel-baazaar-listing a {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  .parcels-list-item .parcel-baazaar-listing a > * {
    flex: 0 0 auto;
  }
</style>
