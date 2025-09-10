<template>
  <PrereqParcels>
    <LayoutMapWithFilters
      class="citaadel-page"
      withoutViewModes
    >
      <template #sidebar>
        <h1>Spillover events (last {{ recentMinutes }} minutes)</h1>

        <div style="margin-bottom: 20px; margin-right: 20px;">
          <div class="site-alertbox site-alertbox--warning site-alertbox--compact">
            <SiteIcon name="warning-triangle" />
            <div>
              Warning: channeling/harvesting spillover will only occur during the Saturday hangouts (2pm - 4pm UTC). See the announcements in Discord for details.
            </div>
          </div>
        </div>

        <div>
          <template v-if="!recentEventsAnnotated.length">
            No events found.
          </template>
          <template v-else>
            {{ recentEventsAnnotated.length }}
            {{ recentEventsAnnotated.length === 1 ? 'event' : 'events' }}

            <div
              style="margin-top: 20px;"
              class="spillovers-tg-container"
            >
              <TransitionGroup
                name="spillovers-tg"
                tag="ul"
                class="spillovers-list"
              >
                <li
                  v-for="event in eventsToDisplay"
                  :key="event.id"
                >
                  <DateFriendly
                    :date="event.date"
                  />:
                  D{{ event.parcel.district }},
                  <template v-if="event.isChanneling">
                    Channelled {{ event.aaltar?.label }},
                  </template>
                  <template v-else>
                    Harvested
                  </template>
                  <span class="parcel-name">{{ event.parcel.parcelHash }}</span>
                  <span class="parcel-coords"> (D{{ event.parcelCoordinates.districtId }}
                    {{ event.parcelCoordinates.x }}, {{ event.parcelCoordinates.y }})</span>,
                  spillover:
                  <br>
                  <div
                    v-for="token in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
                    :key="token"
                    class="alchemica-amount"
                    :style="{
                      display: event.spillover[token] ? undefined : 'none'
                    }"
                  >
                    <CryptoIcon :label="token" />
                    <NumberDisplay
                      :number="event.spillover[token]"
                    />
                  </div>
                </li>
              </TransitionGroup>
              <i v-if="recentEventsAnnotated.length > N_EVENTS">
                + {{ recentEventsAnnotated.length - N_EVENTS }} more event(s)
              </i>
            </div>
          </template>
        </div>

        <!-- TODO bring out the color scheme handling so we don't need an instance of MapConfig -->
        <MapConfig
          v-show="false"
          v-model="mapConfig"
        />
      </template>
      <template #top>
        <template v-if="spilloverFetchStatus.error">
          Error fetching data
        </template>
        <template v-if="spilloverFetchStatus.loading">
          Loading...
        </template>
        &nbsp;
      </template>
      <template #main>
        <CitaadelMap
          :mapConfig="mapConfig"
          :channelings="recentEventsAnnotated"
        />
      </template>
    </LayoutMapWithFilters>
  </PrereqParcels>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'
import BigNumber from 'bignumber.js'
import useParcels from '@/data/useParcels'
import useRecentSpillover from '@/data/useRecentSpillover'
import { gotchiverseCoordsForParcel } from './gotchiverseCoordinates'

import CryptoIcon from '@/common/CryptoIcon.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'

import PrereqParcels from './PrereqParcels.vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import CitaadelMap from './CitaadelMap.vue'
import MapConfig, { getDefaultValue as getDefaultMapConfigValue } from './MapConfig.vue'

const POLL_SECONDS = 5
const N_EVENTS = 30

export default {
  components: {
    CryptoIcon,
    CitaadelMap,
    DateFriendly,
    NumberDisplay,
    LayoutMapWithFilters,
    MapConfig,
    PrereqParcels
  },
  setup () {
    const { parcelsById, fetchStatus: parcelsFetchStatus } = useParcels()
    const { recentMinutes, fetchStatus: spilloverFetchStatus, channelings, claimed, fetchSpillover } = useRecentSpillover()

    const recentEventsAnnotated = computed(() => {
      if (!channelings.value || !claimed.value || !parcelsFetchStatus.value.loaded) { return [] }
      const events = [
        ...channelings.value.map(item => ({ ...item, isChanneling: true })),
        ...claimed.value
      ]
      events.sort((a, b) => b.date - a.date)
      return events.map(event => {
        const parcel = parcelsById.value[event.parcelId]
        return {
          ...event,
          parcel,
          parcelCoordinates: gotchiverseCoordsForParcel(parcel)
        }
      })
    })
    const eventsToDisplay = computed(() => {
      return recentEventsAnnotated.value.slice(0, N_EVENTS).map(event => {
        const spilloverRates = event.spilloverRate
        const spillover = {
          FUD: new BigNumber(event.alchemica.FUD).times(spilloverRates.FUD).decimalPlaces(1).toNumber(),
          FOMO: new BigNumber(event.alchemica.FOMO).times(spilloverRates.FOMO).decimalPlaces(1).toNumber(),
          ALPHA: new BigNumber(event.alchemica.ALPHA).times(spilloverRates.ALPHA).decimalPlaces(1).toNumber(),
          KEK: new BigNumber(event.alchemica.KEK).times(spilloverRates.KEK).decimalPlaces(1).toNumber()
        }
        return {
          ...event,
          spillover
        }
      })
    })

    const fetchData = function () {
      fetchSpillover.value()
    }
    // No need to watch for network changes, since we are frequently polling and replacing data
    const fetchingInterval = setInterval(fetchData, POLL_SECONDS * 1000)
    onUnmounted(() => {
      clearInterval(fetchingInterval)
    })
    fetchData()

    const mapConfig = ref({
      ...getDefaultMapConfigValue(),
      showPaartners: false,
      showLandmarks: false,
      showVortexes: false,
      showAlchemicaFud: false,
      showAlchemicaFomo: false,
      showAlchemicaAlpha: false,
      showAlchemicaKek: false,
      showBackgroundImage: true
    })

    return {
      recentMinutes,
      spilloverFetchStatus,
      recentEventsAnnotated,
      N_EVENTS,
      eventsToDisplay,
      mapConfig
    }
  }
}
</script>

<style scoped>
  .citaadel-page {
    height: 100%;
  }
  .parcel-name {
    font-family: monospace;
    font-size: 0.9em;
  }
  .alchemica-amount {
    margin: 0 8px 5px 0;
    display: inline-flex;
    align-items: center;
    font-size: 0.9em;
  }
  .alchemica-amount > svg {
    margin-right: 3px;
    opacity: 0.6;
  }
  .spillovers-list {
    margin: 0;
    padding: 10px;
    list-style-type: none;
  }
  .spillovers-list > li {
    margin-bottom: 15px;
  }

  /* TransitionGroup */
  .spillovers-tg-move,
  .spillovers-tg-enter-active,
  .spillovers-tg-leave-active {
    transition: all 0.5s ease;
  }
  .spillovers-tg-enter-from,
  .spillovers-tg-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
  /* ensure leaving items are taken out of layout flow so that moving
     animations can be calculated correctly. */
  .spillovers-tg-leave-active {
    position: absolute;
  }

  .spillovers-tg-container {
    position: relative; /* avoid whole-page scrollbar when list item leaves */
  }
</style>
