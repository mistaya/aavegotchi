<template>
    <div>
      <div v-if="fetchStatus.loading || fetchStatus.error">
        <span class="parcel-details__label">
          Contents:
        </span>
        <span v-if="fetchStatus.loading">
          loading...
        </span>
        <div v-if="fetchStatus.error">
          Error fetching parcel contents.
        </div>
      </div>
      <div v-if="fetchStatus.loaded">
        <div
          v-if="aaltar || tiles.length || installations.length"
          style="margin-top: 8px"
        >
          <ParcelGridSvg
            :parcelWidth="parcelWidth"
            :parcelHeight="parcelHeight"
            :tiles="tiles"
            :aaltar="aaltar"
            :installations="installations"
            style="max-height: 250px;"
          />
          <div style="margin-bottom: 15px;">
            <a
              href="#"
              @click.prevent="parcelGridPopupIsOpen = true"
            >
              View in popup
            </a>
          </div>

          <SiteDialog
            v-model:isOpen="parcelGridPopupIsOpen"
          >
            <div class="parcel-details__grid-modal-content">
              <SiteButton
                class="parcel-details__grid-modal-close"
                @click="parcelGridPopupIsOpen = false"
              >
                Close
              </SiteButton>
              <div class="parcel-details__grid-modal-grid-container">
                <ParcelGridSvg
                  :parcelWidth="parcelWidth"
                  :parcelHeight="parcelHeight"
                  :tiles="tiles"
                  :aaltar="aaltar"
                  :installations="installations"
                  fullscreen
                />
              </div>
            </div>
          </SiteDialog>
        </div>
        <div style="margin-bottom: 8px;">
          <span class="parcel-details__label">
            Aaltar:
          </span>
          <template v-if="!aaltar">
            None
          </template>
          <template v-else>
            {{ aaltar.type.label }}
            <div
              v-if="lastActivity && lastActivity.lastChanneledDate"
              class="parcel-details__last-activity"
            >(<template v-if="aaltarCooldown"
              >Ready
                <template v-if="aaltarCooldown.isReady">now</template>
                <DateFriendly
                  v-else-if="aaltarCooldown.date"
                  :date="aaltarCooldown.date"
                  enableToggle
                />;
              </template>
              Last channeled
              <DateFriendly
                :date="lastActivity.lastChanneledDate"
                enableToggle
              />)
            </div>
          </template>
        </div>
        <div style="margin-bottom: 8px;">
          <span class="parcel-details__label">
            Installations:
          </span>
          <template v-if="!groupedInstallations.length">
            None
          </template>
          <template v-else>
            <div
              v-if="lastActivity && lastActivity.lastClaimedDate"
              class="parcel-details__last-activity"
            >
              (<template v-if="reservoirCooldown"
              >Ready
                <template v-if="reservoirCooldown.isReady">now</template>
                <DateFriendly
                  v-else-if="reservoirCooldown.date"
                  :date="reservoirCooldown.date"
                  enableToggle
                />;
              </template>
              Last emptied reservoir
              <DateFriendly
                :date="lastActivity.lastClaimedDate"
                enableToggle
              />)
            </div>
            <ul class="parcel-details__installations">
              <li
                v-for="installation in groupedInstallations"
                :key="installation.type.id"
              >
                {{ installation.count }}x {{ installation.type.label }}
              </li>
            </ul>
          </template>
        </div>
        <div style="margin-bottom: 8px;">
          <span class="parcel-details__label">
            Tiles:
          </span>
          <template v-if="!groupedTiles.length">
            None
          </template>
          <template v-else>
            <ul class="parcel-details__installations">
              <li
                v-for="tile in groupedTiles"
                :key="tile.type.id"
              >
                {{ tile.count }}x {{ tile.type.label }}
              </li>
            </ul>
          </template>
        </div>
        <div
          v-if="includeFarming && farmingDetails"
          style="margin-bottom: 8px;"
        >
          <span class="parcel-details__label">
            Farming:
          </span>
          <div class="parcel-details__farming">
            <span>Harvest rate (daily):</span>
            <div class="parcel-details__farming-alchemica">
              <div
                v-for="token in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
                :key="token"
                v-show="farmingDetails.totalHarvestRate[token] > 0"
              >
                <CryptoIcon
                  :label="token"
                  style="margin-right: 5px"
                />
                <NumberDisplay
                  :number="farmingDetails.totalHarvestRate[token]"
                />
              </div>
            </div>
          </div>
          <div class="parcel-details__farming">
            <span>Reservoir capacity:</span>
            <div class="parcel-details__farming-alchemica">
              <div
                v-for="token in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
                :key="token"
                v-show="farmingDetails.totalReservoirCapacity[token] > 0"
              >
                <CryptoIcon
                  :label="token"
                  style="margin-right: 5px"
                />
                <NumberDisplay
                  :number="farmingDetails.totalReservoirCapacity[token]"
                />
              </div>
            </div>
          </div>
          <div
            v-if="farmingUnclaimedAlchemica"
            class="parcel-details__farming"
          >
            <span>Alchemica to claim:</span>
            <div class="parcel-details__farming-alchemica">
              <div
                v-for="token in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
                :key="token"
                v-show="farmingDetails.totalReservoirCapacity[token] > 0"
              >
                <CryptoIcon
                  :label="token"
                  style="margin-right: 5px"
                />
                <NumberDisplay
                  :number="farmingUnclaimedAlchemica[token]"
                  :style="{
                    'font-weight': farmingDetails.totalReservoirCapacity[token] > 0 && farmingUnclaimedAlchemica[token] === farmingDetails.totalReservoirCapacity[token] ? 'bold': undefined
                  }"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
import { ref, computed } from 'vue'
import useParcelContentsSingle from '@/data/useParcelContentsSingle'
import useReactiveDate from '@/environment/useReactiveDate'
import SiteDialog from '@/site/SiteDialog.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import ParcelGridSvg from './ParcelGridSvg.vue'
import CryptoIcon from '@/common/CryptoIcon.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import installationsFarming from '@/data/parcels/installationsFarming.json'

const SIZE_WIDTHS_BY_ID = [8, 16, 32, 64, 64]
const SIZE_HEIGHTS_BY_ID = [8, 16, 64, 32, 64]

export default {
  components: {
    SiteDialog,
    DateFriendly,
    ParcelGridSvg,
    CryptoIcon,
    NumberDisplay
  },
  props: {
    id: { type: String, required: true },
    sizeNum: { type: [String, Number], required: true },
    includeFarming: { type: Boolean, default: false }
  },
  setup (props) {
    const {
      fetchStatus,
      aaltar,
      installations,
      tiles,
      lastActivity,
      fetchContents
    } = useParcelContentsSingle()

    fetchContents(props.id, props.sizeNum)

    const groupWithCounts = function (items) {
      const groupedById = {}
      for (const item of items) {
        if (!groupedById[item.type.id]) {
          groupedById[item.type.id] = {
            type: item.type,
            count: 0
          }
        }
        groupedById[item.type.id].count++
      }

      return Object.values(groupedById)
    }
    const groupedInstallations = computed(() => {
      if (!fetchStatus.value.loaded) { return [] }
      return groupWithCounts(installations.value)
    })
    const groupedTiles = computed(() => {
      if (!fetchStatus.value.loaded) { return [] }
      return groupWithCounts(tiles.value)
    })

    const parcelWidth = computed(() => SIZE_WIDTHS_BY_ID[props.sizeNum - 0])
    const parcelHeight = computed(() => SIZE_HEIGHTS_BY_ID[props.sizeNum - 0])

    const parcelGridPopupIsOpen = ref(false)

    const { tickerDate } = useReactiveDate()
    const tickerTimestamp = computed(() => tickerDate.value - 0)

    const calculateCooldown = function ({ cooldownHours, lastActivityTimestamp }) {
      if (!aaltar.value) {
        return null
      }
      let cooldownTimestamp = null
      let cooldownDate = null
      if (lastActivityTimestamp) {
        cooldownTimestamp = lastActivityTimestamp + (cooldownHours * 60 * 60 * 1000)
        cooldownDate = new Date(cooldownTimestamp)
      } else {
        // there is an altar but no activity yet, so it's available
        cooldownTimestamp = 0
      }
      const isReady = cooldownTimestamp < tickerTimestamp.value
      return {
        isReady,
        date: cooldownDate
      }
    }

    const aaltarCooldown = computed(() => calculateCooldown({
      cooldownHours: aaltar.value?.type?.cooldownHours,
      lastActivityTimestamp: lastActivity.value?.lastChanneledTimestamp
    }))

    const reservoirCooldown = computed(() => calculateCooldown({
      cooldownHours: 8,
      lastActivityTimestamp: lastActivity.value?.lastClaimedTimestamp
    }))

    const farmingDetails = computed(() => {
      if (!aaltar) { return null }

      const reservoirs = installations.value.filter(
        item => item.type.installationType === 'reservoir'
      ).map(item => installationsFarming.reservoirs[item.type.id])

      const harvesters = installations.value.filter(
        item => item.type.installationType === 'harvester'
      ).map(item => installationsFarming.harvesters[item.type.id])

      if (harvesters.length === 0 || reservoirs.length === 0) {
        return null
      }

      const totalHarvestRate = {
        FUD: 0,
        FOMO: 0,
        ALPHA: 0,
        KEK: 0
      }
      for (const harvester of harvesters) {
        totalHarvestRate[harvester.alchemicaType] += harvester.harvestRate
      }

      const totalReservoirCapacity = {
        FUD: 0,
        FOMO: 0,
        ALPHA: 0,
        KEK: 0
      }
      for (const reservoir of reservoirs) {
        totalReservoirCapacity[reservoir.alchemicaType] += reservoir.capacity
      }

      return { totalHarvestRate, totalReservoirCapacity }
    })

    const farmingUnclaimedAlchemica = computed(() => {
      if (!farmingDetails.value) { return null }
      const lastClaimedTimestamp = lastActivity.value?.lastClaimedTimestamp
      if (!lastClaimedTimestamp) { return null }
      const nowTimestamp = tickerTimestamp.value
      const alchemica = {
        FUD: 0,
        FOMO: 0,
        ALPHA: 0,
        KEK: 0
      }
      if (lastClaimedTimestamp >= nowTimestamp) {
        return alchemica
      }
      const fractionOfDay = (nowTimestamp - lastClaimedTimestamp) / (1000 * 60 * 60 * 24)
      for (const alchemicaType in alchemica) {
        alchemica[alchemicaType] = Math.min(
          farmingDetails.value.totalReservoirCapacity[alchemicaType],
          fractionOfDay * farmingDetails.value.totalHarvestRate[alchemicaType]
        )
      }
      return alchemica
    })

    return {
      fetchStatus,
      aaltar,
      aaltarCooldown,
      reservoirCooldown,
      groupedInstallations,
      groupedTiles,
      parcelWidth,
      parcelHeight,
      installations,
      tiles,
      lastActivity,
      farmingDetails,
      farmingUnclaimedAlchemica,
      parcelGridPopupIsOpen
    }
  }
}
</script>
<style scoped>
  .parcel-details__label {
    margin-right: 5px;
    font-size: 0.9em;
    color: var(--site-text-color--subtle);
  }

  .parcel-details__last-activity {
    font-size:  0.9em;
  }

  .parcel-details__installations {
    margin: 5px 0 0 0;
    padding-left: 20px;
    font-size: 0.85em;
  }

  .parcel-details__grid-modal-content {
    display: grid;
    grid-template-rows: auto minmax(10px, 1fr);
  }
  .parcel-details__grid-modal-close {
    justify-self: end;
    margin-top: 10px;
    margin-right: 10px;
    padding: 10px 25px
  }
  .parcel-details__grid-modal-grid-container {
    padding: 10px;
    text-align: center;
  }
  @media (min-width: 1000px) {
    .parcel-details__grid-modal-grid-container {
      padding: 30px;
    }
  }
  .parcel-details__farming {
    margin-bottom: 10px;
  }
  .parcel-details__farming > span {
    font-size: 0.85em;
  }
  .parcel-details__farming-alchemica {
    margin: 5px 10px 0px 8px;
  }
  .parcel-details__farming-alchemica > div {
    margin-bottom: 5px;
    display: flex;
    align-items: center;
  }
</style>
