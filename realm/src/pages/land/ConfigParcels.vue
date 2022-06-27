<template>
  <PrereqParcels>
    <LayoutMapWithFilters style="height: 100%;">
      <template #sidebar>
        <h1>Config Parcels</h1>
        <section>
          <h2>Custom Parcel Lists</h2>

          <div v-if="parcelListsFetchStatus.loading">
            <LoadingSpinner style="position: relative; top: 2px; margin-right: 2px;" />
            loading initial lists...
          </div>
          <div v-if="parcelListsFetchStatus.error">
            Error fetching initial parcel lists
          </div>
          <div v-if="parcelListsFetchStatus.loaded">
            <div style="margin-top: 20px">
              <label>
                Select a list to edit:
                <br>
                <select v-model="selectedListId">
                  <option value="">
                    --- Select List ---
                  </option>
                  <option
                    v-for="availableList in availableLists"
                    :key="availableList.id"
                    :value="availableList.id"
                  >
                    {{ availableList.label }}
                  </option>
                </select>
              </label>
            </div>

            <div
              v-if="selectedList"
              style="margin: 20px 0"
            >
              {{ selectedList.label }} has {{ selectedList.parcels.length }} parcel IDs

              <div style="margin-top: 10px; margin-bottom: 10px;">
                <label>
                  Label:
                  <input
                    v-model="selectedList.label"
                    type="text"
                  >
                </label>
              </div>
              <div>
                <label>
                  Parcel IDs:
                  <TextareaList
                    :modelValue="selectedList.parcels"
                    :delimiterRegexp="/[^0-9]+/"
                    @update:modelValue="selectedList.parcels = $event"
                  />
                </label>
              </div>
            </div>
          </div>

          <div style="margin: 20px 0">
            <h3>Add new list</h3>

            <div style="margin-bottom: 10px">
              <label>
                ID:
                <input
                  v-model="newListId"
                  type="text"
                />
              </label>
            </div>

            <div style="margin-bottom: 10px">
              <label>
                Label:
                <input
                  v-model="newListLabel"
                  type="text"
                />
              </label>
            </div>

            <div style="margin-bottom: 10px">
              <SiteButton
                type="button"
                :disabled="!canAddNewList"
                @click="addNewList"
              >
                Add List
              </SiteButton>
            </div>
          </div>

          <div style="margin: 20px 0 10px 0;">
            <SiteButton
              type="button"
              :aria-pressed="`${showJson}`"
              @click="showJson = !showJson"
            >
              {{ showJson ? 'Hide' : 'Show' }}
              JSON
            </SiteButton>
          </div>

          <textarea
            v-if="showJson"
            :value="listsJson"
            style="width: 95%; min-height: 200px;"
          />
        </section>
      </template>
      <template #top>
      </template>
      <template #main>
        <CitaadelMap
          :parcels="parcelsToDisplay"
          :parcelsMatchingFilters="parcelsMatchingFilters"
          :parcelColors="parcelColors"
          @click:parcel="onClickParcel"
        />
      </template>
    </LayoutMapWithFilters>
  </PrereqParcels>
</template>

<script>
import { ref, computed } from 'vue'
import useColorScheme from '@/environment/useColorScheme'
import useParcels from '@/data/useParcels'
import useParcelLists from '@/data/useParcelLists'
import LoadingSpinner from '@/common/LoadingSpinner.vue'
import TextareaList from '@/common/TextareaList.vue'
import PrereqParcels from './PrereqParcels.vue'
import LayoutMapWithFilters from './LayoutMapWithFilters.vue'
import CitaadelMap from './CitaadelMap.vue'

export default {
  components: {
    PrereqParcels,
    LoadingSpinner,
    LayoutMapWithFilters,
    CitaadelMap,
    TextareaList
  },
  setup () {
    const { colorScheme } = useColorScheme()
    const parcelFill = computed(() => colorScheme.value === 'light' ? '#00f' : '#dfdfdf')

    const { parcelsById } = useParcels()
    const parcelsToDisplay = computed(() => Object.values(parcelsById.value))

    const { parcelListsById, fetchStatus: parcelListsFetchStatus, addNewParcelList } = useParcelLists()

    const selectedListId = ref('')
    const selectedList = computed(() => parcelListsById.value[selectedListId.value])
    const availableLists = computed(() => Object.entries(parcelListsById.value).map(([id, { label }]) => ({ id, label })))

    const newListId = ref('')
    const newListLabel = ref('')
    const canAddNewList = computed(() =>
      newListId.value &&
      newListLabel.value &&
      !Object.keys(parcelListsById.value).includes(newListId.value)
    )
    const addNewList = function () {
      if (!canAddNewList.value) { return }
      addNewParcelList({
        id: newListId.value,
        label: newListLabel.value
      })
      selectedListId.value = newListId.value
      newListId.value = ''
      newListLabel.value = ''
    }

    const showJson = ref(false)
    const listsJson = computed(() => JSON.stringify(parcelListsById.value))

    const onClickParcel = function (parcel) {
      if (selectedList.value) {
        const existingIndex = selectedList.value.parcels.indexOf(parcel.id)
        if (existingIndex === -1) {
          selectedList.value.parcels.push(parcel.id)
        } else {
          selectedList.value.parcels.splice(existingIndex, 1)
        }
      }
    }

    const parcelsMatchingFilters = computed(() => {
      if (!selectedList.value) {
        return {}
      }
      return Object.fromEntries(selectedList.value.parcels.map(parcelId => [parcelId, true]))
    })
    const parcelColors = computed(() => {
      if (!selectedList.value) {
        return {}
      }
      const color = parcelFill.value
      return Object.fromEntries(selectedList.value.parcels.map(parcelId => [parcelId, color]))
    })

    return {
      parcelListsFetchStatus,
      parcelListsById,
      parcelsToDisplay,
      parcelsMatchingFilters,
      parcelColors,
      onClickParcel,
      newListId,
      newListLabel,
      addNewList,
      canAddNewList,
      availableLists,
      selectedListId,
      selectedList,
      showJson,
      listsJson
    }
  }
}
</script>

<style scoped>
</style>
