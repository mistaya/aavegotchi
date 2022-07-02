<template>
  <details class="filter-container">
    <summary>
      <h4>
        <slot name="heading">Filter by Aaltar</slot>
      </h4>
    </summary>

    <div
      v-if="fetchStatus.loading"
      class="site-alertbox site-alertbox--warning site-alertbox--compact"
      style="margin: 10px 10px 10px 0;"
    >
      <div>
        Fetching parcel contents, please wait...
      </div>
    </div>

    <div style="margin-left: 15px">
      <div style="margin-bottom: 8px; margin-left: -3px;">
        <label>
          <input
            type="checkbox"
            :checked="noAltarIsSelected"
            @change="onNoAltarChange($event.target.checked)"
          >
          No altar
        </label>
      </div>

      <CheckboxGroup
        :modelValue="modelValue"
        :children="LE_AALTARS_OPTIONS"
        parentLabel="LE Golden Aaltar"
        style="margin-bottom: 5px;"
        @update:modelValue="$emit('update:modelValue', $event)"
      />

      <CheckboxGroup
        :modelValue="modelValue"
        :children="NORMAL_AALTARS_OPTIONS"
        parentLabel="Aaltar"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </div>
  </details>
</template>

<script>
import { computed } from 'vue'

import useParcelContents from '@/data/useParcelContents'
import CheckboxGroup from './CheckboxGroup.vue'
import INSTALLATIONS from '@/data/parcels/installations.json'

const AALTARS = Object.values(INSTALLATIONS).filter(item => item.installationType === 'aaltar')
const AALTARS_IDS = AALTARS.map(item => item.id)
const LE_AALTARS = AALTARS.filter(item => item.installationGroup === 'LE Golden Aaltar')
const LE_AALTARS_OPTIONS = LE_AALTARS.map(item => ({ id: item.id, label: `Level ${item.level}` }))
const NORMAL_AALTARS = AALTARS.filter(item => item.installationGroup === 'Aaltar')
const NORMAL_AALTARS_OPTIONS = NORMAL_AALTARS.map(item => ({ id: item.id, label: `Level ${item.level}` }))

const NO_AALTARS_ID = 'NONE'

const getDefaultValue = function () {
  return [...AALTARS_IDS, NO_AALTARS_ID]
}

const getFilter = function (installationsByParcelId, filterContentsAaltar) {
  if (filterContentsAaltar?.length) {
    const matchNoAaltar = filterContentsAaltar.includes(NO_AALTARS_ID)
    const matchAllAaltars = AALTARS_IDS.every(id => filterContentsAaltar.includes(id))
    if (matchNoAaltar && matchAllAaltars) {
      // we're matching everything
      return () => true
    }
    return (parcel) => {
      const installations = installationsByParcelId[parcel.id]
      if (!installations) {
        return matchNoAaltar
      }
      // If there are installations, there must be an Aaltar.
      if (matchAllAaltars) {
        return true
      }
      // A parcel can only have one Aaltar.
      // Match if it has an aaltar of one of the selected types.
      return filterContentsAaltar.some(aaltarId => installations[aaltarId])
    }
  }
  return () => false
}
export { getDefaultValue, getFilter }

export default {
  components: {
    CheckboxGroup
  },
  props: {
    modelValue: { type: Array, default: getDefaultValue }
  },
  setup (props, { emit }) {
    const { fetchStatus } = useParcelContents()

    const noAltarIsSelected = computed(() => props.modelValue.includes(NO_AALTARS_ID))

    const onNoAltarChange = function (checked) {
      if (checked) {
        if (!props.modelValue.includes(NO_AALTARS_ID)) {
          emit('update:modelValue', [...props.modelValue, NO_AALTARS_ID])
        }
      } else {
        if (props.modelValue.includes(NO_AALTARS_ID)) {
          emit('update:modelValue', props.modelValue.filter(id => id !== NO_AALTARS_ID))
        }
      }
    }

    return {
      fetchStatus,
      LE_AALTARS_OPTIONS,
      NORMAL_AALTARS_OPTIONS,
      NO_AALTARS_ID,
      noAltarIsSelected,
      onNoAltarChange
    }
  }
}
</script>

<style scoped>
</style>
