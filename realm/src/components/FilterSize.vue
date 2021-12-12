<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Size</h3>
    </summary>

    <div
      v-for="sizeLabel in ['humble', 'reasonable', 'spacious']"
      :key="sizeLabel"
    >
      <label>
        <input
          v-model="myModel"
          type="checkbox"
          :value="sizeLabel"
          @change="$emit('update:modelValue', myModel)"
        />
        <span style="text-transform: capitalize;">
          {{ sizeLabel }}
        </span>
      </label>
    </div>
  </details>
</template>

<script>

const SIZES = ['humble', 'reasonable', 'spacious']

const getFilter = function (filterSizes) {
  return function (parcel) {
    // size filters
    if (!filterSizes.includes('humble') && parcel.sizeLabel === 'humble') {
      return false
    }
    if (!filterSizes.includes('reasonable') && parcel.sizeLabel === 'reasonable') {
      return false
    }
    if (!filterSizes.includes('spacious') && parcel.sizeLabel === 'spacious') {
      return false
    }
    return true
  }
}
export { SIZES, getFilter }

export default {
  props: {
    modelValue: { type: Array, default: () => [...SIZES] }
  },
  // make a local copy of modelValue so we can use Vue's smart v-model handling of arrays
  data () {
    return {
      myModel: []
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
