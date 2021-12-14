<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Baazaar Listings</h3>
    </summary>

    <div
      v-for="{ id, label } in OPTIONS"
      :key="id"
    >
      <label>
        <input
          type="radio"
          :value="id"
          name="baazaarFilterOptions"
          :checked="modelValue === id"
          @change="$emit('update:modelValue', id)"
        />
        <span>
          {{ label }}
        </span>
      </label>
    </div>
  </details>
</template>

<script>

const OPTIONS = [
  { id: 'all', label: 'All parcels' },
  { id: 'listed', label: 'Parcels listed on Baazaar' },
  { id: 'unlisted', label: 'Parcels that are not listed on Baazaar' }
]

const getDefaultValue = () => 'all'

const getFilter = function (listingsByParcel, filterBaazaar) {
  return function (parcel) {
    if (filterBaazaar === 'all') { return true }
    if (filterBaazaar === 'listed') { return !!listingsByParcel[parcel.id] }
    return !listingsByParcel[parcel.id]
  }
}
export { getDefaultValue, getFilter }

export default {
  props: {
    modelValue: { type: String, default: 'all' }
  },
  computed: {
    OPTIONS () { return OPTIONS }
  }
}
</script>

<style scoped>
</style>
