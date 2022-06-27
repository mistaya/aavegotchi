<template>
  <PrereqParcels>
    <CryptoIcons />
    <LayoutMapWithFilters
      class="citaadel-page"
      withoutViewModes
    >
      <template #sidebar>
        <h1>Channelings (last {{ RECENT_MINUTES }} minutes)</h1>

        <div style="margin-bottom: 20px; margin-right: 20px;">
          <div class="site-alertbox site-alertbox--warning site-alertbox--compact">
            <SiteIcon name="warning-triangle" />
            <div>
              Warning: channeling spillover will only occur during the Saturday hangouts (2pm - 4pm UTC). See the announcements in Discord for details.
            </div>
          </div>
        </div>

        <div>
          <template v-if="!annotatedChannelings.length">
            No channelings found.
          </template>
          <template v-else>
            {{ annotatedChannelings.length }}
            {{ annotatedChannelings.length === 1 ? 'channeling' : 'channelings' }}

            <div
              style="margin-top: 20px;"
              class="channelings-tg-container"
            >
              <TransitionGroup
                name="channelings-tg"
                tag="ul"
                class="channelings-list"
              >
                <li
                  v-for="channeling in channelingsToDisplay"
                  :key="channeling.id"
                >
                  <DateFriendly
                    :date="channeling.date"
                  />:
                  D{{ channeling.parcel.district }}, {{ channeling.aaltar.label }},
                  <span class="parcel-name">{{ channeling.parcel.parcelHash }}</span>,
                  spillover:
                  <br>
                  <div
                    v-for="token in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
                    :key="token"
                    class="alchemica-amount"
                  >
                    <CryptoIcon :address="TOKEN_ADDRESSES[token]" />
                    <NumberDisplay
                      :number="channeling.spillover[token]"
                    />
                  </div>
                </li>
              </TransitionGroup>
              <i v-if="annotatedChannelings.length > N_CHANNELINGS">
                + {{ annotatedChannelings.length - N_CHANNELINGS }} more channeling(s)
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
import BigNumber from 'bignumber.js'
import useParcels from '@/data/useParcels'
import useRecentChannelings from '@/data/useRecentChannelings'

import CryptoIcon from '@/common/CryptoIcon.vue'
import CryptoIcons from '@/common/CryptoIcons.vue'
import CitaadelMap from './CitaadelMap.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import MapConfig, { getDefaultValue as getDefaultMapConfigValue } from './MapConfig.vue'
import PrereqParcels from './PrereqParcels.vue'

import tokens from '@/data/pockets/tokens.json'

const tokensList = Object.values(tokens)
const TOKEN_ADDRESSES = {
  FUD: tokensList.find(({ label }) => label === 'FUD').id,
  FOMO: tokensList.find(({ label }) => label === 'FOMO').id,
  ALPHA: tokensList.find(({ label }) => label === 'ALPHA').id,
  KEK: tokensList.find(({ label }) => label === 'KEK').id
}

const POLL_SECONDS = 5
const RECENT_MINUTES = 3
const N_CHANNELINGS = 20

export default {
  components: {
    CryptoIcons,
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
    const { fetchStatus: channelingsFetchStatus, channelings, fetchChannelings } = useRecentChannelings(RECENT_MINUTES)

    const annotatedChannelings = computed(() => {
      if (!channelings.value || !parcelsFetchStatus.value.loaded) { return [] }
      return channelings.value.map(channeling => ({
        ...channeling,
        parcel: parcelsById.value[channeling.parcelId],
        aaltar: channeling.aaltar
      }))
    })
    const channelingsToDisplay = computed(() => {
      // console.log({ annotatedChannelings })
      return annotatedChannelings.value.slice(0, N_CHANNELINGS).map(channeling => {
        const spilloverMultiplier = channeling.spilloverRate
        const spillover = {
          FUD: new BigNumber(channeling.alchemica.FUD).times(spilloverMultiplier).decimalPlaces(1).toNumber(),
          FOMO: new BigNumber(channeling.alchemica.FOMO).times(spilloverMultiplier).decimalPlaces(1).toNumber(),
          ALPHA: new BigNumber(channeling.alchemica.ALPHA).times(spilloverMultiplier).decimalPlaces(1).toNumber(),
          KEK: new BigNumber(channeling.alchemica.KEK).times(spilloverMultiplier).decimalPlaces(1).toNumber()
        }
        return {
          ...channeling,
          spillover
        }
      })
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
      N_CHANNELINGS,
      channelingsToDisplay,
      mapConfig,
      TOKEN_ADDRESSES
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
  .channelings-list {
    margin: 0;
    padding: 10px;
    list-style-type: none;
  }
  .channelings-list > li {
    margin-bottom: 15px;
  }

  /* TransitionGroup */
  .channelings-tg-move,
  .channelings-tg-enter-active,
  .channelings-tg-leave-active {
    transition: all 0.5s ease;
  }
  .channelings-tg-enter-from,
  .channelings-tg-leave-to {
    opacity: 0;
    transform: translateY(-30px);
  }
  /* ensure leaving items are taken out of layout flow so that moving
     animations can be calculated correctly. */
  .channelings-tg-leave-active {
    position: absolute;
  }

  .channelings-tg-container {
    position: relative; /* avoid whole-page scrollbar when list item leaves */
  }
</style>
