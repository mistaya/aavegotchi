<template>
  <details class="filter-container">
    <summary>
      <h4>Filter by GBM Auction Listings</h4>
    </summary>

    <div
      v-for="{ id, label } in OPTIONS"
      :key="id"
    >
      <label>
        <input
          type="radio"
          :value="id"
          name="gbmFilterOptions"
          :checked="modelValue === id"
          @change="$emit('update:modelValue', id)"
        />
        <span>
          {{ label }}
        </span>
      </label>
      <div
        v-if="id === 'listed' && modelValue === id"
        style="margin: 5px 10px 10px 15px; display: flex; font-size: 0.9em; font-style: italic;"
      >
        <SiteIcon
          name="info"
          style="flex: 0 0 auto; margin-right: 5px;"
        />
        <div style="flex: 1 1 auto">
          There is a "GBM Auction Listing Price" Color Scheme that goes well with this.
          <SiteButton
            type="button"
            @click="$emit('requestGBMColorScheme')"
          >
            Try it
          </SiteButton>
        </div>
      </div>
    </div>
  </details>
</template>

<script>
import SiteButton from '@/site/SiteButton.vue'
import SiteIcon from '@/site/SiteIcon.vue'

const OPTIONS = [
  { id: 'all', label: 'All parcels' },
  { id: 'listed', label: 'Parcels currently up for GBM Auction' },
  { id: 'unlisted', label: 'Parcels that are not up for GBM Auction' }
]

const getDefaultValue = () => 'all'

const getFilter = function (listingsByParcel, filterGbm) {
  return function (parcel) {
    if (filterGbm === 'all') { return true }
    if (filterGbm === 'listed') { return !!listingsByParcel[parcel.id] }
    return !listingsByParcel[parcel.id]
  }
}
export { getDefaultValue, getFilter }

export default {
  components: {
    SiteButton,
    SiteIcon
  },
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
