<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Walls</h3>
    </summary>

    <div
      v-for="wallId in wallIds"
      :key="wallId"
    >
      <label>
        <input
          v-model="myModel"
          type="checkbox"
          :value="wallId"
          @change="$emit('update:modelValue', myModel)"
        />
        <span style="text-transform: capitalize;">
          {{ wallId }}
        </span>
      </label>
    </div>
  </details>
</template>

<script>
import { WALLS } from '@/data/walls'
const WALL_IDS = WALLS.map(wall => wall.id)

const getFilter = function (filterWalls) {
  const wallsToExclude = WALL_IDS.filter(wall => !filterWalls.includes(wall))
  return function (parcel) {
    if (wallsToExclude.length && wallsToExclude.includes(parcel.wall)) {
      return false
    }
    return true
  }
}
export { getFilter }

export default {
  props: {
    modelValue: { type: Array, default: () => [...WALL_IDS] }
  },
  // make a local copy of modelValue so we can use Vue's smart v-model handling of arrays
  data () {
    return {
      myModel: []
    }
  },
  computed: {
    wallIds () {
      return WALL_IDS
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler (newVal, oldVal) {
        this.myModel = [...this.modelValue]
      }
    }
  }
}
</script>

<style scoped>
</style>
