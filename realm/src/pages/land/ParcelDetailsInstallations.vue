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
            >
              (<template v-if="aaltarCooldown">
                Ready
                <template v-if="aaltarCooldown.isReady">
                  now
                </template>
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
              (Last emptied reservoir:
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

const SIZE_WIDTHS_BY_ID = [8, 16, 32, 64, 64]
const SIZE_HEIGHTS_BY_ID = [8, 16, 64, 32, 64]

export default {
  components: {
    SiteDialog,
    DateFriendly,
    ParcelGridSvg
  },
  props: {
    id: { type: String, required: true },
    sizeNum: { type: [String, Number], required: true }
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

    const aaltarCooldown = computed(() => {
      if (!aaltar.value?.type?.cooldownHours) {
        return null
      }
      const cooldownHours = aaltar.value.type.cooldownHours
      const lastChanneledTimestamp = lastActivity.value?.lastChanneledTimestamp
      let cooldownTimestamp = null
      let cooldownDate = null
      if (lastChanneledTimestamp) {
        cooldownTimestamp = lastChanneledTimestamp + (cooldownHours * 60 * 60 * 1000)
        cooldownDate = new Date(cooldownTimestamp)
      } else {
        // there is an altar but it hasn't been channeled yet, so it's available
        cooldownTimestamp = 0
      }
      const isReady = cooldownTimestamp < tickerTimestamp.value
      return {
        isReady,
        date: cooldownDate
      }
    })

    return {
      fetchStatus,
      aaltar,
      aaltarCooldown,
      groupedInstallations,
      groupedTiles,
      parcelWidth,
      parcelHeight,
      installations,
      tiles,
      lastActivity,
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
</style>
