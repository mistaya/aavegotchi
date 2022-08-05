<template>
  <details class="filter-container">
    <summary>
      <h4>
        <slot name="heading">Filter by Tile</slot>
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
            :checked="noTileIsSelected"
            @change="onNoTileChange($event.target.checked)"
          >
          No tiles
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
        v-for="group in TILE_GROUPS"
        :key="group.id"
        :modelValue="modelValue.ids"
        :children="group.children"
        :parentLabel="group.label"
        class="filter-tile-group"
        @update:modelValue="$emit('update:modelValue', { ids: $event, mode: modelValue.mode })"
      />

      <CheckboxGroup
        v-if="UNGROUPED_TILES.length"
        key="UNGROUPED_TILES"
        :modelValue="modelValue.ids"
        :children="UNGROUPED_TILES"
        parentLabel="Misc"
        class="filter-tile-group"
        @update:modelValue="$emit('update:modelValue', { ids: $event, mode: modelValue.mode })"
      />
    </div>
  </details>
</template>

<script>
import { computed } from 'vue'

import useParcelContents from '@/data/useParcelContents'
import CheckboxGroup from './CheckboxGroup.vue'
import TILES from '@/data/parcels/tiles.json'

const TILE_IDS = Object.keys(TILES)
const TILE_GROUPS_BY_ID = {}
const UNGROUPED_TILES = []
for (const item of Object.values(TILES)) {
  if (item.tileGroup) {
    if (!TILE_GROUPS_BY_ID[item.tileGroup]) {
      TILE_GROUPS_BY_ID[item.tileGroup] = {
        label: item.tileGroup,
        children: []
      }
    }
    TILE_GROUPS_BY_ID[item.tileGroup].children.push({
      id: item.id,
      label: item.label
    })
  } else {
    UNGROUPED_TILES.push({
      id: item.id,
      label: item.label
    })
  }
}
const TILE_GROUPS = Object.values(TILE_GROUPS_BY_ID)

const NO_TILES_ID = 'NONE'

const MODES = {
  OR: 'OR',
  AND: 'AND'
}

const getDefaultValue = function () {
  return {
    ids: [...TILE_IDS, NO_TILES_ID],
    mode: MODES.OR
  }
}

const getFilter = function (tilesByParcelId, filterContentsTiles) {
  const { ids: filterIds, mode: filterMode } = filterContentsTiles
  if (filterIds?.length) {
    const matchNoTile = filterIds.includes(NO_TILES_ID)
    const filterTileIds = matchNoTile ? filterIds.filter(id => id !== NO_TILES_ID) : filterIds

    // check to see if the filters would match everything
    if (matchNoTile) {
      // parcels without tiles match
      // for parcels with tiles...
      if (filterMode === MODES.OR) {
        // if 'any' selected tile qualifies as a match,
        // we match all when all tiles are checked
        const matchAllTiles = TILE_IDS.every(id => filterTileIds.includes(id))
        if (matchAllTiles) {
          return () => true
        }
      }
    }
    return (parcel) => {
      const tiles = tilesByParcelId[parcel.id]

      // First see if there are no tiles on the parcel
      if (!tiles) {
        return matchNoTile
      }
      const parcelTileIds = Object.keys(tiles)
      if (parcelTileIds.length === 0) {
        return matchNoTile
      }

      // For parcels with tiles, if there are no selected types, the parcel cannot match.
      // (this means it's possible to select only parcels with no tiles by deselecting all types)
      if (filterTileIds.length === 0) {
        return false
      }
      if (filterMode === MODES.OR) {
        // Match if it has a tile of one of the selected types.
        return filterTileIds.some(tileId => tiles[tileId])
      } else {
        // Match if it has all of the selected types of tile.
        return filterTileIds.every(tileId => tiles[tileId])
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

    const noTileIsSelected = computed(() => props.modelValue.ids.includes(NO_TILES_ID))

    const onNoTileChange = function (checked) {
      if (checked) {
        if (!props.modelValue.ids.includes(NO_TILES_ID)) {
          emit('update:modelValue', {
            ids: [...props.modelValue.ids, NO_TILES_ID],
            mode: props.modelValue.mode
          })
        }
      } else {
        if (props.modelValue.ids.includes(NO_TILES_ID)) {
          emit('update:modelValue', {
            ids: props.modelValue.ids.filter(id => id !== NO_TILES_ID),
            mode: props.modelValue.mode
          })
        }
      }
    }

    return {
      fetchStatus,
      TILE_GROUPS,
      UNGROUPED_TILES,
      NO_TILES_ID,
      noTileIsSelected,
      onNoTileChange,
      MODES
    }
  }
}
</script>

<style scoped>
  .filter-tile-group + .filter-tile-group {
    margin-top: 5px;
  }
</style>
