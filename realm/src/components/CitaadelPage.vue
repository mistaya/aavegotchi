<template>
  <LayoutMapWithFilters>
    <template #sidebar>
      <h1>The Citaadel</h1>

      <div style="margin-bottom: 20px;">
        <DataFetcherBaazaarListings style="margin-bottom: 20px;" />
        <DataFetcherParcelOwners style="margin-bottom: 20px;" />
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
      <FilterBaazaar v-model="filters.baazaar" />
      <FilterSize v-model="filters.size" />
      <FilterWalls v-model="filters.walls" />
      <FilterDistricts v-model="filters.districts" />
      <FilterParcelIds v-model="filters.parcelIds" />
      <FilterParcelNames v-model="filters.parcelNames" />
      <FilterBoosts v-model="filters.boosts" />

      <section>
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
          <div v-if="selectedParcel.owner">
            Owner:
            <EthAddress :address="selectedParcel.owner" />
          </div>
          <div v-if="selectedParcel.currentListing">
            <a
              :href="`https://aavegotchi.com/baazaar/erc721/${selectedParcel.currentListing.id}`"
              target="_blank"
            >
              Currently listed on Baazaar for: {{ selectedParcel.currentListing.priceInGhst.toString() }} GHST
            </a>
          </div>
          <div v-if="selectedParcel.lastSale">
            <a
              :href="`https://aavegotchi.com/baazaar/erc721/${selectedParcel.lastSale.id}`"
              target="_blank"
            >
              Last sold on Baazaar on {{ selectedParcel.lastSale.formattedDate }}
              for: {{ selectedParcel.lastSale.priceInGhst.toString() }} GHST
            </a>
          </div>
          <div v-if="selectedParcel.auctionPrice">
            Auction price: {{ selectedParcel.auctionPrice }} GHST
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
        :viewBox="mapConfig.viewBox"
        :aspectRatio="mapConfig.aspectRatio"
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
          {{ listParcelsTotal }} parcels found.
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
              <span
                v-if="listingsByParcelId[parcel.id]"
                style="margin: 0 10px;"
              >
                <a
                  :href="`https://aavegotchi.com/baazaar/erc721/${listingsByParcelId[parcel.id].id}`"
                  target="_blank"
                >
                  Baazaar {{ listingsByParcelId[parcel.id].priceInGhst.toString() }} GHST
                </a>
              </span>
              <span v-if="salesByParcelId[parcel.id]">
                Last sold on Baazaar on
                <a
                  :href="`https://aavegotchi.com/baazaar/erc721/${salesByParcelId[parcel.id].id}`"
                  target="_blank"
                >
                  {{ salesByParcelId[parcel.id].formattedDate }}
                  for {{ salesByParcelId[parcel.id].priceInGhst.toString() }} GHST
                </a>
              </span>
            </li>
          </ul>
        </template>
        <div v-if="listParcelsTotal > listParcelsToDisplay.length && !listParcelsShowAll">
          <button
            type="button"
            @click="listParcelsShowAll = true"
          >
            Show all {{ listParcelsTotal }} parcels
          </button>
        </div>
      </div>
    </template>
  </LayoutMapWithFilters>
</template>

<script>
import { ref, computed, watch } from 'vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import DataFetcherBaazaarListings from './DataFetcherBaazaarListings.vue'
import DataFetcherParcelOwners from './DataFetcherParcelOwners.vue'
import EthAddress from './EthAddress.vue'
import CitaadelMap from './CitaadelMap.vue'
import MapConfigDisplayMode from './MapConfigDisplayMode.vue'
import FilterBaazaar, { getDefaultValue as getDefaultBaazarValue, getFilter as getBaazaarFilter } from './FilterBaazaar.vue'
import FilterSize, { SIZES, getFilter as getSizesFilter } from './FilterSize.vue'
import FilterWalls, { getFilter as getWallsFilter } from './FilterWalls.vue'
import FilterDistricts, { DISTRICTS, getDefaultValue as getDefaultDistrictsValue, getFilter as getDistrictsFilter } from './FilterDistricts.vue'
import FilterParcelIds, { getFilter as getParcelIdsFilter } from './FilterParcelIds.vue'
import FilterParcelNames, { getFilter as getParcelNamesFilter } from './FilterParcelNames.vue'
import FilterBoosts, { getDefaultValue as getDefaultBoostsValue, getFilter as getBoostsFilter } from './FilterBoosts.vue'
import { SCALE_NAMES, SCALE_GRADIENTS, getSequentialScale } from './colorScales'
import useParcels from '@/data/useParcels'
import useBaazaarListings from '@/data/useBaazaarListings'
import useParcelPrices from '@/data/useParcelPrices'
import useParcelOwners from '@/data/useParcelOwners'
import { WALLS } from '@/data/walls'
import { format } from 'date-fns'

export default {
  components: {
    LayoutMapWithFilters,
    DataFetcherBaazaarListings,
    DataFetcherParcelOwners,
    EthAddress,
    CitaadelMap,
    MapConfigDisplayMode,
    FilterBaazaar,
    FilterSize,
    FilterWalls,
    FilterDistricts,
    FilterParcelIds,
    FilterParcelNames,
    FilterBoosts
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

    const mapConfig = ref({
      displayMode: 'outline',
      viewBox: '0 0 9000 6000',
      aspectRatio: '9 / 6'
    })
    const filters = ref({
      baazaar: getDefaultBaazarValue(),
      size: [...SIZES],
      walls: WALLS.map(wall => wall.id),
      districts: getDefaultDistrictsValue([...DISTRICTS]),
      parcelIds: [],
      parcelNames: [],
      boosts: getDefaultBoostsValue()
    })
    const colorSchemeOptions = [
      { id: 'lastPrice', label: 'Last Sold Price (GHST)' },
      { id: 'baazaarPrice', label: 'Baazaar Listing Price (GHST)' },
      { id: 'owner', label: 'Owner Address' },
      { id: 'whaleGhst', label: 'Whales (total GHST spent, excl. raffles)' },
      { id: 'whalePx', label: 'Whales (total pixel area)' }
    ]
    const colorScheme = ref({
      colorBy: 'lastPrice',
      lastPrice: {
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
      baazaarPrice: {
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
      owner: {
        scaleName: 'rainbow',
        min: 0,
        max: parseInt('0xffffffffffffffffffffffffffffffffffffffff', 16)
      },
      whaleGhst: {
        scaleName: 'inferno',
        min: 0,
        max: 140_000
      },
      whalePx: {
        scaleName: 'inferno',
        min: 0,
        max: 150_000
      }
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
        if (['baazaarPrice', 'lastPrice', 'whaleGhst'].includes(colorBy)) {
          // these color schemes require baazaar listings
          // make sure it's fetched at least once
          prereqBaazaarListings()
        }
        if (['owner', 'whaleGhst', 'whalePx'].includes(colorBy)) {
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

    const whaleGhstScale = computed(() => {
      return getSequentialScale(colorScheme.value.whaleGhst)
    })

    const whalePxScale = computed(() => {
      return getSequentialScale(colorScheme.value.whalePx)
    })

    const whalesGhst = computed(() => {
      const totalPerOwner = {}
      for (const parcelId in pricesByParcelId.value) {
        const owner = ownersByParcelId.value[parcelId]
        if (owner) {
          if (!totalPerOwner[owner]) {
            totalPerOwner[owner] = 0
          }
          const price = pricesByParcelId.value[parcelId]
          if (price?.lastPrice) {
            totalPerOwner[owner] += price.lastPrice
          }
        }
      }
      // console.log('GHST whales sorted:', Object.entries(totalPerOwner).sort((a, b) => {
      //   if (a[1] === b[1]) { return 0 }
      //   return a[1] < b[1] ? 1 : -1
      // }))
      return totalPerOwner
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
      // console.log('Pixel whales sorted:', Object.entries(totalPerOwner).sort((a, b) => {
      //   if (a[1] === b[1]) { return 0 }
      //   return a[1] < b[1] ? 1 : -1
      // }))
      return totalPerOwner
    })

    const { parcelsById } = useParcels()

    const parcelsToDisplay = computed(() =>
      Object.values(parcelsById.value)
        .map(
          parcel => ({
            ...parcel,
            color: null
          })
        )
    )

    const parcelColors = computed(() => {
      // console.time('parcelColors')
      const colorBy = colorScheme.value.colorBy
      let getColor = () => null
      if (colorBy === 'lastPrice') {
        getColor = parcel => {
          const scale = lastPriceScalesBySize.value[parcel.sizeLabel]
          if (!scale) { return null }
          const lastPrice = pricesByParcelId.value[parcel.id].lastPrice
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
        getColor = parcel => {
          return ownerScale.value(parseInt(ownersByParcelId.value[parcel.id], 16))
        }
      } else if (colorBy === 'whaleGhst') {
        getColor = parcel => {
          const owner = ownersByParcelId.value[parcel.id]
          return whaleGhstScale.value(whalesGhst.value[owner] || 0)
        }
      } else if (colorBy === 'whalePx') {
        getColor = parcel => {
          const owner = ownersByParcelId.value[parcel.id]
          return whalePxScale.value(whalesPx.value[owner] || 0)
        }
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
      const idFilter = getParcelIdsFilter(filters.value.parcelIds)
      const nameFilter = getParcelNamesFilter(filters.value.parcelNames)
      const baazaarFilter = getBaazaarFilter(listingsByParcelId.value, filters.value.baazaar)
      const sizesFilter = getSizesFilter(filters.value.size)
      const wallsFilter = getWallsFilter(filters.value.walls)
      const districtsFilter = getDistrictsFilter(DISTRICTS, filters.value.districts)
      const boostsFilter = getBoostsFilter(filters.value.boosts)

      const applyFilters = [idFilter, nameFilter, baazaarFilter, sizesFilter, wallsFilter, districtsFilter, boostsFilter]

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

    const selectedParcelId = ref(null)
    const selectedParcel = computed(() => {
      const parcelId = selectedParcelId.value
      if (!parcelId) { return null }
      const currentListing = listingsByParcelId.value[parcelId]
      const lastSale = salesByParcelId.value[parcelId]
      if (lastSale) {
        lastSale.formattedDate = format(lastSale.datePurchased, 'yyyy/MM/dd HH:mm:ss')
      }
      const auctionPrice = pricesByParcelId.value[parcelId]?.auctionPrice
      const owner = ownersByParcelId.value[parcelId]
      return {
        ...parcelsById.value[parcelId],
        currentListing,
        lastSale,
        auctionPrice,
        owner
      }
    })
    const onClickParcel = (parcel) => {
      selectedParcelId.value = parcel.id
    }

    const compareIds = function (parcelA, parcelB) {
      if (parcelA.id === parcelB.id) {
        return 0
      }
      return (parcelA.id - 0) < (parcelB.id - 0) ? -1 : 1
    }

    const compareDistricts = function (parcelA, parcelB, fallbackComparison) {
      if (parcelA.district === parcelB.district) {
        if (fallbackComparison) {
          return fallbackComparison(parcelA, parcelB)
        }
        return 0
      }
      return (parcelA.district - 0) < (parcelB.district - 0) ? -1 : 1
    }

    const listParcels = computed(() => {
      // console.time('listParcels')
      const parcels = parcelsToDisplay.value.filter(parcel => parcelsMatchingFilters.value[parcel.id])
      parcels.sort((a, b) => {
        const listingA = listingsByParcelId.value[a.id]
        const listingB = listingsByParcelId.value[b.id]
        if (!listingA && !listingB) {
          // fallback with districts, then ids
          return compareDistricts(a, b, compareIds)
        }
        if (listingA && !listingB) {
          return -1
        }
        if (listingB && !listingA) {
          return 1
        }
        if (listingA.priceInGhst.isEqualTo(listingB.priceInGhst)) {
          // fallback with districts, then ids
          return compareDistricts(a, b, compareIds)
        }
        return listingA.priceInGhst.isLessThan(listingB.priceInGhst) ? -1 : 1
      })
      // console.timeEnd('listParcels')
      return parcels
    })

    const listParcelsShowAll = ref(false)

    const listParcelsTotal = computed(() => listParcels.value.length)

    watch(
      () => listParcelsTotal.value,
      () => { listParcelsShowAll.value = false }
    )

    const listParcelsToDisplay = computed(() => {
      if (listParcelsShowAll.value) {
        return listParcels.value
      }
      return listParcels.value.slice(0, 100)
    })

    return {
      mapConfig,
      filters,
      colorScheme,
      colorSchemeLabel,
      colorSchemeOptions,
      SCALE_NAMES,
      SCALE_GRADIENTS,
      baazaarListingsFetchStatus,
      parcelsToDisplay,
      parcelsMatchingFilters,
      parcelColors,
      onClickParcel,
      selectedParcelId,
      selectedParcel,
      listParcelsShowAll,
      listParcelsToDisplay,
      listParcelsTotal,
      listingsByParcelId,
      salesByParcelId
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

  .selected-parcel-details {
    margin: 0 10px 20px 0;
    border: 1px solid #ccc;
    padding: 10px;
  }
</style>
