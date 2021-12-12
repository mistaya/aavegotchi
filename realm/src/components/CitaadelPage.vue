<template>
  <LayoutMapWithFilters>
    <template #sidebar>
      <h1>The Citaadel</h1>

      <MapConfigDisplayMode v-model="mapConfig.displayMode" />
      <FilterSize v-model="filters.size" />
      <FilterWalls v-model="filters.walls" />
      <FilterDistricts v-model="filters.districts" />
      <FilterParcelIds v-model="filters.parcelIds" />
      <FilterParcelNames v-model="filters.parcelNames" />
      <FilterBoosts v-model="filters.boosts" />
    </template>
    <template #main="{ viewMode }">
      <CitaadelMap
        v-show="viewMode === 'map'"
        :viewBox="mapConfig.viewBox"
        :aspectRatio="mapConfig.aspectRatio"
        :filterDisplayMode="mapConfig.displayMode"
        :parcels="parcelsToDisplay"
        @click:parcel="onClickParcel"
      />
      <div v-show="viewMode === 'list'">
        List view TODO
      </div>
    </template>
  </LayoutMapWithFilters>
</template>

<script>
import { ref, computed } from 'vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import CitaadelMap from './CitaadelMap.vue'
import MapConfigDisplayMode from './MapConfigDisplayMode.vue'
import FilterSize, { SIZES, getFilter as getSizesFilter } from './FilterSize.vue'
import FilterWalls, { getFilter as getWallsFilter } from './FilterWalls.vue'
import FilterDistricts, { DISTRICTS, getDefaultValue as getDefaultDistrictsValue, getFilter as getDistrictsFilter } from './FilterDistricts.vue'
import FilterParcelIds, { getFilter as getParcelIdsFilter } from './FilterParcelIds.vue'
import FilterParcelNames, { getFilter as getParcelNamesFilter } from './FilterParcelNames.vue'
import FilterBoosts, { getDefaultValue as getDefaultBoostsValue, getFilter as getBoostsFilter } from './FilterBoosts.vue'
import useParcels from '@/data/useParcels'
import { WALLS } from '@/data/walls'

export default {
  components: {
    LayoutMapWithFilters,
    CitaadelMap,
    MapConfigDisplayMode,
    FilterSize,
    FilterWalls,
    FilterDistricts,
    FilterParcelIds,
    FilterParcelNames,
    FilterBoosts
  },
  setup () {
    const mapConfig = ref({
      displayMode: 'outline',
      viewBox: '0 0 9000 6000',
      aspectRatio: '9 / 6'
    })
    const filters = ref({
      size: [...SIZES],
      walls: WALLS.map(wall => wall.id),
      districts: getDefaultDistrictsValue([...DISTRICTS]),
      parcelIds: [],
      parcelNames: [],
      boosts: getDefaultBoostsValue()
    })
    const { parcelsById } = useParcels()

    const parcelsToDisplay = computed(() =>
      Object.values(parcelsById.value)
        .map(
          parcel => ({
            ...parcel,
            color: 'white'
          })
        )
    )

    const filteredParcelsToDisplay = computed(() => {
      // console.time('filteredParcelsToDisplay')
      const idFilter = getParcelIdsFilter(filters.value.parcelIds)
      const nameFilter = getParcelNamesFilter(filters.value.parcelNames)
      const sizesFilter = getSizesFilter(filters.value.size)
      const wallsFilter = getWallsFilter(filters.value.walls)
      const districtsFilter = getDistrictsFilter(DISTRICTS, filters.value.districts)
      const boostsFilter = getBoostsFilter(filters.value.boosts)

      const applyFilters = [idFilter, nameFilter, sizesFilter, wallsFilter, districtsFilter, boostsFilter]

      const result = parcelsToDisplay.value.map(parcel => {
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

    const onClickParcel = (parcel) => {
      console.log({ parcel })
    }
    return {
      mapConfig,
      filters,
      parcelsToDisplay: filteredParcelsToDisplay,
      onClickParcel
    }
  }
}
</script>

<style scoped>
</style>
