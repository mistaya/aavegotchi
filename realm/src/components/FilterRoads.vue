<template>
  <details
    v-if="roadSizeOptions.length"
    class="filter-container"
  >
    <summary>
      <h4>Filter by Roads/Corners</h4>
    </summary>

    <div style="margin-bottom: 8px">
      <div
        v-for="option in [{ id: 'none', label: 'Show all parcels' }, { id: 'corner', label: 'Corners' }, { id: 'roadside', label: 'Roadside' }]"
        :key="option.id"
      >
        <label>
          <input
            :checked="modelValue.selectionMode === option.id"
            type="radio"
            name="filterRoadsSelectionMode"
            :value="option.id"
            @change="selectionModeChanged(option.id)"
          />
          {{ option.label }}
        </label>
      </div>
    </div>

    <div
      v-if="modelValue.selectionMode === 'roadside'"
      style="margin-left: 20px;"
    >
      <div
        v-for="roadSize in roadSizeOptions"
        :key="roadSize.id"
      >
        <label>
          <input
            v-model="mySelectRoadSizes"
            type="checkbox"
            :value="roadSize.id"
            @change="roadSizesChanged(mySelectRoadSizes)"
          />
            {{ roadSize.label }}
        </label>
      </div>
    </div>
  </details>
</template>

<script>
import useParcelLists from '@/data/useParcelLists'
const { parcelListsById } = useParcelLists()

const CORNER_LIST_ID = 'corner'
const ROADSIDE_LIST_IDS = ['road32', 'road16'/* , 'road8', 'road2' */]
const getDefaultValue = function () {
  return {
    selectionMode: 'none',
    roadSizes: ROADSIDE_LIST_IDS
  }
}

const getFilter = function ({ selectionMode, roadSizes }) {
  if (selectionMode === 'corner' && parcelListsById.value[CORNER_LIST_ID]) {
    const matchesMap = Object.fromEntries(parcelListsById.value[CORNER_LIST_ID].parcels.map(id => [id, true]))
    return (parcel) => matchesMap[parcel.id]
  }
  if (selectionMode === 'roadside' && parcelListsById.value[ROADSIDE_LIST_IDS[0]]) {
    const matchingIds = roadSizes.map(size => parcelListsById.value[size]?.parcels || []).flat()
    const matchesMap = Object.fromEntries(matchingIds.map(id => [id, true]))
    return (parcel) => matchesMap[parcel.id]
  }
  return () => true
}

export { getDefaultValue, getFilter }

export default {
  props: {
    modelValue: { type: Object, default: getDefaultValue }
  },
  // make a local copy of roadSizes so we can use Vue's smart v-model handling of arrays
  data () {
    return {
      mySelectRoadSizes: []
    }
  },
  computed: {
    roadSizeOptions () {
      return Object.entries(parcelListsById.value)
        .filter(([id]) => ROADSIDE_LIST_IDS.includes(id))
        .map(([id, { label }]) => ({ id, label }))
    }
  },
  watch: {
    'modelValue.roadSizes': {
      immediate: true,
      handler (newVal, oldVal) {
        this.mySelectRoadSizes = [...this.modelValue.roadSizes]
      }
    }
  },
  methods: {
    selectionModeChanged (selectionMode) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        selectionMode
      })
    },
    roadSizesChanged (roadSizes) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        roadSizes: [...roadSizes]
      })
    }
  }
}
</script>

<style scoped>
  label {
    margin-top: 10px;
  }
  .ids-textarea {
    width: 90%;
    height: 40px;
    margin-top: 5px;
  }
</style>
