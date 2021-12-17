<template>
  <details class="filter-container">
    <summary>
      <h3>Map Display Options</h3>
    </summary>
    <div style="margin-top: 10px">
      Parcels that don't match current filters:
      <div
        v-for="option in [{ id: 'outline', label: 'Show outline' }, { id: 'hide', label: 'Hide' }]"
        :key="option.id"
      >
        <label>
          <input
            type="radio"
            name="mapConfigUnmatchedDisplay"
            :value="option.id"
            :checked="modelValue.unmatchedDisplay === option.id"
            @change="unmatchedDisplayChanged(option.id)"
          />
          {{ option.label }}
        </label>
      </div>
    </div>

    <div style="margin-top: 15px">
      Map features:
      <div
        v-for="feature in [
          { id: 'Roads', label: 'roads' },
          { id: 'Walls', label: 'walls' },
          { id: 'Paartners', label: 'paartner parcels' },
          { id: 'Landmarks', label: 'landmarks' }
        ]"
        :key="feature.id"
        style="margin-top: 5px"
      >
        <label style="margin-right: 7px">
          <input
            type="checkbox"
            :checked="modelValue[`show${feature.id}`]"
            @input="showChanged($event.target.checked, `show${feature.id}`)"
          />
          Show {{ feature.label }}
        </label>
        <input
          type="color"
          :aria-label="`Color for ${feature.label}`"
          :value="modelValue[`color${feature.id}`]"
          @input="debouncedColorChanged($event.target.value, `color${feature.id}`)"
        >
      </div>
    </div>
  </details>
</template>

<script>
import debounce from 'lodash.debounce'

const getDefaultValue = function () {
  return {
    unmatchedDisplay: 'outline', /* or 'hide' */
    showRoads: true,
    showWalls: true,
    showPaartners: true,
    showLandmarks: true,
    colorRoads: '#bbbbbb',
    colorWalls: '#000000',
    colorPaartners: '#bf91ff',
    colorLandmarks: '#FA34F3'
  }
}
export { getDefaultValue }

export default {
  props: {
    modelValue: { type: Object, default: getDefaultValue }
  },
  created () {
    this.debouncedColorChanged = debounce(this.colorChanged, 300)
  },
  unmounted () {
    this.debouncedColorChanged.cancel()
  },
  methods: {
    unmatchedDisplayChanged (unmatchedDisplay) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        unmatchedDisplay
      })
    },
    showChanged (show, property) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [property]: show
      })
    },
    colorChanged (color, property) {
      this.$emit('update:modelValue', {
        ...this.modelValue,
        [property]: color
      })
    }
  }
}
</script>

<style scoped>
</style>
