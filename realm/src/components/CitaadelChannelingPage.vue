<template>
  <PrereqParcels>
    <LayoutMapWithFilters
      class="citaadel-page"
      withoutViewModes
    >
      <template #sidebar>
        <h1>Channelings (last {{ RECENT_MINUTES }} minutes)</h1>

        <div>
          <template v-if="latestChanneling">
            {{ annotatedChannelings.length }}
            {{ annotatedChannelings.length === 1 ? 'channeling' : 'channelings' }}
            <br>
            <br>
            Latest:
            Parcel {{ latestChanneling.parcel.parcelHash }}
            in District {{ latestChanneling.parcel.district }},
            <DateFriendly
              :date="latestChanneling.date"
            />
          </template>
        </div>

        <!-- TODO bring out the color scheme handling so we don't need an instance of MapConfig -->
        <MapConfig
          v-show="false"
          v-model="mapConfig"
        />
      </template>
      <template #top>
        <template v-if="channelingsFetchStatus.error">
          Error fetching data
        </template>
        <template v-if="channelingsFetchStatus.loading">
          Loading...
        </template>
        &nbsp;
      </template>
      <template #main>
        <CitaadelMap
          :mapConfig="mapConfig"
          :channelings="annotatedChannelings"
        />
      </template>
    </LayoutMapWithFilters>
  </PrereqParcels>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'
import useParcels from '@/data/useParcels'
import useRecentChannelings from '@/data/useRecentChannelings'

import CitaadelMap from './CitaadelMap.vue'
import DateFriendly from './DateFriendly.vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import MapConfig, { getDefaultValue as getDefaultMapConfigValue } from './MapConfig.vue'
import PrereqParcels from './PrereqParcels.vue'

const POLL_SECONDS = 5
const RECENT_MINUTES = 3

export default {
  components: {
    CitaadelMap,
    DateFriendly,
    LayoutMapWithFilters,
    MapConfig,
    PrereqParcels
  },
  setup () {
    const { parcelsById, fetchStatus: parcelsFetchStatus } = useParcels()
    const { fetchStatus: channelingsFetchStatus, channelings, fetchChannelings } = useRecentChannelings(RECENT_MINUTES)

    const annotatedChannelings = computed(() => {
      if (!channelings.value || !parcelsFetchStatus.value.loaded) { return [] }
      return channelings.value.map(channeling => ({
        ...channeling,
        parcel: parcelsById.value[channeling.parcelId]
      }))
    })
    const latestChanneling = computed(() => {
      // console.log({ annotatedChannelings })
      return annotatedChannelings.value?.[0] || null
    })

    const fetchingInterval = setInterval(fetchChannelings, POLL_SECONDS * 1000)
    onUnmounted(() => {
      clearInterval(fetchingInterval)
    })
    fetchChannelings()

    const mapConfig = ref({
      ...getDefaultMapConfigValue(),
      showPaartners: false,
      showLandmarks: false,
      showVortexes: false,
      showAlchemicaFud: false,
      showAlchemicaFomo: false,
      showAlchemicaAlpha: false,
      showAlchemicaKek: false
    })

    return {
      RECENT_MINUTES,
      channelingsFetchStatus,
      annotatedChannelings,
      latestChanneling,
      mapConfig
    }
  }
}
</script>

<style scoped>
  .citaadel-page {
    height: 100%;
  }
</style>
