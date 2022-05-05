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
      Map features - show...
      <div
        v-for="feature in [
          { id: 'Roads', label: 'roads' },
          { id: 'Walls', label: 'walls' },
          { id: 'Districts', label: 'districts' },
          { id: 'Paartners', label: 'paartner parcels' },
          { id: 'Landmarks', label: 'landmarks' },
          { id: 'AlchemicaFud', label: 'FUD deposits' },
          { id: 'AlchemicaFomo', label: 'FOMO deposits' },
          { id: 'AlchemicaAlpha', label: 'ALPHA deposits' },
          { id: 'AlchemicaKek', label: 'KEK deposits' },
        ]"
        :key="feature.id"
        style="margin-top: 5px"
      >
        <label style="margin-right: 7px; text-transform: capitalize;">
          <input
            type="checkbox"
            :checked="modelValue[`show${feature.id}`]"
            @input="showChanged($event.target.checked, `show${feature.id}`)"
          />
          {{ feature.label }}
        </label>
        <input
          type="color"
          :aria-label="`Color for ${feature.label}`"
          :value="modelValue[`color${feature.id}`]"
          @input="debouncedColorChanged($event.target.value, `color${feature.id}`)"
        >
      </div>
      <div style="margin-top: 10px">
        <label style="margin-right: 7px">
          <input
            type="checkbox"
            :checked="modelValue.useOneAlchemicaColor"
            @input="showChanged($event.target.checked, 'useOneAlchemicaColor')"
          />
          Same color for all deposits:
        </label>
        <input
          type="color"
          :aria-label="`Color for all alchemica deposits`"
          :value="modelValue.colorAlchemica"
          @input="debouncedColorChanged($event.target.value, 'colorAlchemica')"
        >
      </div>
    </div>
  </details>
</template>

<script>
import { watch } from 'vue'
import debounce from 'lodash.debounce'
import useColorScheme from '@/data/useColorScheme'

const DEFAULT_COLORS = {
  light: {
    colorRoads: '#bbbbbb',
    colorWalls: '#000000',
    colorDistricts: '#FA34F3',
    colorPaartners: '#bf91ff',
    colorLandmarks: '#FA34F3',
    colorAlchemicaFud: '#C8E4C8',
    colorAlchemicaFomo: '#F0DAD1',
    colorAlchemicaAlpha: '#D7EEEE',
    colorAlchemicaKek: '#F0D9F2',
    colorAlchemica: '#E3E3E3'
  },
  dark: {
    colorRoads: '#4A4A4A',
    colorWalls: '#A3A3A3',
    colorDistricts: '#FA34F3',
    colorPaartners: '#bf91ff',
    colorLandmarks: '#FA34F3',
    colorAlchemicaFud: '#475C47',
    colorAlchemicaFomo: '#5B4A43',
    colorAlchemicaAlpha: '#476262',
    colorAlchemicaKek: '#533A55',
    colorAlchemica: '#292929'
  }
}

const getDefaultValue = function () {
  const { colorScheme } = useColorScheme()
  const colors = DEFAULT_COLORS[colorScheme.value] || DEFAULT_COLORS.light
  return {
    unmatchedDisplay: 'outline', /* or 'hide' */
    showRoads: true,
    showWalls: true,
    showDistricts: false,
    showPaartners: true,
    showLandmarks: true,
    showAlchemicaFud: true,
    showAlchemicaFomo: true,
    showAlchemicaAlpha: true,
    showAlchemicaKek: true,
    ...colors,
    useOneAlchemicaColor: false,
    flagSelected: false
  }
}
export { getDefaultValue }

export default {
  props: {
    modelValue: { type: Object, default: getDefaultValue }
  },
  setup (props, { emit }) {
    const { colorScheme } = useColorScheme()
    watch(
      () => colorScheme.value,
      () => {
        // if previous colors were the default, change them to the new default for the scheme
        const previousScheme = colorScheme.value === 'light' ? 'dark' : 'light'
        const previousDefaultColors = DEFAULT_COLORS[previousScheme]
        const newDefaultColors = DEFAULT_COLORS[colorScheme.value]
        const newColors = {}
        for (const key in previousDefaultColors) {
          if (props.modelValue[key] === previousDefaultColors[key] &&
            props.modelValue[key] !== newDefaultColors[key]) {
            newColors[key] = newDefaultColors[key]
          }
        }
        if (Object.keys(newColors).length) {
          emit('update:modelValue', {
            ...props.modelValue,
            ...newColors
          })
        }
      }
    )
    return {}
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
