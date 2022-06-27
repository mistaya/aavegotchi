<template>
    <div>
      <div v-if="fetchStatus.loading || fetchStatus.error">
        <span class="parcel-details__label">
          Contents:
        </span>
        <div v-if="fetchStatus.loading">
          loading...
        </div>
        <div v-if="fetchStatus.error">
          Error fetching parcel contents.
        </div>
      </div>
      <div v-if="fetchStatus.loaded">
        <div
          v-if="aaltar || tiles.length || installations.length"
          style="margin-top: 8px"
        >
          <a
            href="#"
            @click.prevent="parcelGridPopupIsOpen = true"
          >
            <ParcelGridSvg
              :parcelWidth="parcelWidth"
              :parcelHeight="parcelHeight"
              :tiles="tiles"
              :aaltar="aaltar"
              :installations="installations"
              style="max-height: 250px;"
            />
          </a>

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
import useParcelContentsSingleFromContract from '@/data/useParcelContentsSingleFromContract'
import SiteDialog from '@/site/SiteDialog.vue'
import ParcelGridSvg from './ParcelGridSvg.vue'

const SIZE_WIDTHS_BY_ID = [8, 16, 32, 64, 64]
const SIZE_HEIGHTS_BY_ID = [8, 16, 64, 32, 64]

export default {
  components: {
    SiteDialog,
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
      fetchContents
    } = useParcelContentsSingleFromContract()

    fetchContents(props.id, props.sizeNum - 0)

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

    return {
      fetchStatus,
      aaltar,
      groupedInstallations,
      groupedTiles,
      parcelWidth,
      parcelHeight,
      installations,
      tiles,
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
