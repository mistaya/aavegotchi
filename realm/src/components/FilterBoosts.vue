<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Alchemica Boost</h3>
    </summary>

    <div
      v-for="typeEntry in modelValue"
      :key="typeEntry.id"
    >
      <h4 style="text-transform: uppercase;">
        {{ typeEntry.id }}
      </h4>

      <div>
        <div
          v-for="option in modeOptions"
          :key="option.id"
        >
          <label>
            <input
              :checked="typeEntry.selectionMode === option.id"
              type="radio"
              :name="`${typeEntry.id}_selectionMode`"
              :value="option.id"
              @change="selectionModeChanged(typeEntry, $event.target.value)"
            />
              {{ option.label }}
          </label>
        </div>
      </div>

      <div
        v-if="typeEntry.selectionMode === 'range'"
        style="margin-top: 8px"
      >
        <label>
          Min:
          <input
            :value="typeEntry.selectRange.min"
            type="number"
            class="boosts-range-input"
            @input="rangeChanged(typeEntry, 'min', $event.target.value)"
          />
        </label>
        <label>
          Max:
          <input
            :value="typeEntry.selectRange.max"
            type="number"
            class="boosts-range-input"
            @input="rangeChanged(typeEntry, 'max', $event.target.value)"
          />
        </label>
      </div>
    </div>
  </details>
</template>

<script>
import { ALCHEMICA_TYPES } from '@/data/alchemica'

const getDefaultValue = function () {
  return ALCHEMICA_TYPES.map(type => ({
    id: type,
    selectionMode: 'ignore', // or 'some' or 'range'
    selectRange: {
      min: 1,
      max: 30
    }
  }))
}

const getFilter = function (filterBoosts) {
  return function (parcel) {
    for (const typeEntry of filterBoosts) {
      if (typeEntry.selectionMode === 'ignore') {
        // do nothing
      } else {
        const boost = parcel[`${typeEntry.id}Boost`] - 0
        if (typeEntry.selectionMode === 'some') {
          if (boost <= 0) {
            return false
          }
        } else {
          const min = typeEntry.selectRange.min - 0
          const max = typeEntry.selectRange.max - 0
          if (boost < min || boost > max) {
            return false
          }
        }
      }
    }
    return true
  }
}
export { getFilter, getDefaultValue }

export default {
  props: {
    modelValue: { type: Array, default: () => getDefaultValue() }
  },
  computed: {
    modeOptions () {
      return [
        { id: 'ignore', label: "Don't care, show all" },
        { id: 'some', label: 'With boost, any amount' },
        { id: 'range', label: 'Specific range of boost' }
      ]
    }
  },
  methods: {
    selectionModeChanged (typeEntry, selectionMode) {
      this.$emit('update:modelValue', this.modelValue.map(entry => {
        if (entry.id !== typeEntry.id) {
          return { ...entry }
        }
        return {
          ...entry,
          selectionMode
        }
      }))
    },
    rangeChanged (typeEntry, bound, value) {
      this.$emit('update:modelValue', this.modelValue.map(entry => {
        if (entry.id !== typeEntry.id) {
          return { ...entry }
        }
        return {
          ...entry,
          selectRange: {
            ...entry.selectRange,
            [bound]: value
          }
        }
      }))
    }
  }
}
</script>

<style scoped>
  .boosts-range-input {
    width: 60px;
  }
</style>
