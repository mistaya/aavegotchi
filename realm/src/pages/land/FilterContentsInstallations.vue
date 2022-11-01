<template>
  <details class="filter-container">
    <summary>
      <h4>
        <slot name="heading">Filter by Installation</slot>
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
      <div style="margin-bottom: 15px; margin-left: -3px;">
        <label>
          <input
            type="checkbox"
            :checked="noInstallationIsSelected"
            @change="onNoInstallationChange($event.target.checked)"
          >
          No installations
        </label>
      </div>

      <div style="margin-bottom: 8px;">
        Match
        <label>
          <input
            type="radio"
            name="mode"
            :value="MODES.OR"
            :checked="modelValue.mode === MODES.OR"
            @change="$emit('update:modelValue', { ids: modelValue.ids, mode: MODES.OR })"
          >
          Any
        </label>
        <label>
          <input
            type="radio"
            name="mode"
            :value="MODES.AND"
            :checked="modelValue.mode === MODES.AND"
            @change="$emit('update:modelValue', { ids: modelValue.ids, mode: MODES.AND })"
          >
          All
        </label>
      </div>

      <CheckboxGroup
        v-for="group in INSTALLATION_GROUPS"
        :key="group.id"
        :modelValue="modelValue.ids"
        :children="group.children"
        :parentLabel="group.label"
        class="filter-installation-group"
        @update:modelValue="$emit('update:modelValue', { ids: $event, mode: modelValue.mode })"
      />

      <CheckboxGroup
        key="UNGROUPED_INSTALLATIONS"
        :modelValue="modelValue.ids"
        :children="UNGROUPED_INSTALLATIONS"
        parentLabel="Misc"
        class="filter-installation-group"
        @update:modelValue="$emit('update:modelValue', { ids: $event, mode: modelValue.mode })"
      />
    </div>
  </details>
</template>

<script>
import { computed } from 'vue'

import useParcelContents from '@/data/useParcelContents'
import CheckboxGroup from './CheckboxGroup.vue'
import ALL_INSTALLATIONS from '@/data/parcels/installations.json'

const AALTAR_IDS = Object.values(ALL_INSTALLATIONS).filter(item => item.installationType === 'aaltar').map(item => item.id)
const INSTALLATIONS = Object.values(ALL_INSTALLATIONS).filter(item => item.installationType !== 'aaltar')
const INSTALLATION_IDS = INSTALLATIONS.map(item => item.id)
const INSTALLATION_GROUPS_BY_ID = {}
const UNGROUPED_INSTALLATIONS = []
for (const item of INSTALLATIONS) {
  if (item.installationGroup) {
    if (!INSTALLATION_GROUPS_BY_ID[item.installationGroup]) {
      INSTALLATION_GROUPS_BY_ID[item.installationGroup] = {
        label: item.installationGroup,
        children: []
      }
    }
    INSTALLATION_GROUPS_BY_ID[item.installationGroup].children.push({
      id: item.id,
      label: item.labelForFilter || item.rarity || `Level ${item.level}` // currently, decorations have 'rarity' and installations have 'level'
    })
  } else {
    UNGROUPED_INSTALLATIONS.push({
      id: item.id,
      label: item.label
    })
  }
}
const INSTALLATION_GROUPS = Object.values(INSTALLATION_GROUPS_BY_ID)

const NO_INSTALLATIONS_ID = 'NONE'

const MODES = {
  OR: 'OR',
  AND: 'AND'
}

const getDefaultValue = function () {
  return {
    ids: [...INSTALLATION_IDS, NO_INSTALLATIONS_ID],
    mode: MODES.OR
  }
}

const getFilter = function (installationsByParcelId, filterContentsInstallations) {
  const { ids: filterIds, mode: filterMode } = filterContentsInstallations
  if (filterIds?.length) {
    const matchNoInstallation = filterIds.includes(NO_INSTALLATIONS_ID)
    const filterInstallationIds = matchNoInstallation ? filterIds.filter(id => id !== NO_INSTALLATIONS_ID) : filterIds

    // check to see if the filters would match everything
    if (matchNoInstallation) {
      // parcels without installations match
      // for parcels with installations...
      if (filterMode === MODES.OR) {
        // if 'any' selected installation qualifies as a match,
        // we match all when all installations are checked
        const matchAllInstallations = INSTALLATION_IDS.every(id => filterInstallationIds.includes(id))
        if (matchAllInstallations) {
          return () => true
        }
      }
    }
    return (parcel) => {
      const installations = installationsByParcelId[parcel.id]

      // First see if there are no non-aaltar installations on the parcel
      if (!installations) {
        return matchNoInstallation
      }
      const parcelInstallationIds = Object.keys(installations).filter(id => !AALTAR_IDS.includes(id))
      if (parcelInstallationIds.length === 0) {
        return matchNoInstallation
      }

      // For parcels with installations, if there are no selected types, the parcel cannot match.
      // (this means it's possible to select only parcels with no installations by deselecting all types)
      if (filterInstallationIds.length === 0) {
        return false
      }
      if (filterMode === MODES.OR) {
        // Match if it has an installation of one of the selected types.
        return filterInstallationIds.some(installationId => installations[installationId])
      } else {
        // Match if it has all of the selected types of installation.
        return filterInstallationIds.every(installationId => installations[installationId])
      }
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
    modelValue: { type: Object, default: getDefaultValue }
  },
  setup (props, { emit }) {
    const { fetchStatus } = useParcelContents()

    const noInstallationIsSelected = computed(() => props.modelValue.ids.includes(NO_INSTALLATIONS_ID))

    const onNoInstallationChange = function (checked) {
      if (checked) {
        if (!props.modelValue.ids.includes(NO_INSTALLATIONS_ID)) {
          emit('update:modelValue', {
            ids: [...props.modelValue.ids, NO_INSTALLATIONS_ID],
            mode: props.modelValue.mode
          })
        }
      } else {
        if (props.modelValue.ids.includes(NO_INSTALLATIONS_ID)) {
          emit('update:modelValue', {
            ids: props.modelValue.ids.filter(id => id !== NO_INSTALLATIONS_ID),
            mode: props.modelValue.mode
          })
        }
      }
    }

    return {
      fetchStatus,
      INSTALLATION_GROUPS,
      UNGROUPED_INSTALLATIONS,
      NO_INSTALLATIONS_ID,
      noInstallationIsSelected,
      onNoInstallationChange,
      MODES
    }
  }
}
</script>

<style scoped>
  .filter-installation-group + .filter-installation-group {
    margin-top: 5px;
  }
</style>
