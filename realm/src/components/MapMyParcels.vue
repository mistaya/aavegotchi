<template>
  <details class="filter-container">
    <summary>
      <h3>My Parcels</h3>
    </summary>

    <div
      class="site-alertbox site-alertbox--info site-alertbox--compact"
      style="margin-right: 10px;"
    >
      <SiteIcon name="info" />
      <div>
        Optionally specify another group of parcels using the filters below.
        <br><br>
        These will always be highlighted on the map, and you can browse them in their own List.
        <br><br>
        Or to see status/cooldowns, go to the
        <router-link :to="{ name: 'lending-lands' }">Land Owner</router-link>
        page.
      </div>
    </div>

    <div style="margin-top: 10px; margin-bottom: 10px">
      <label>
        Color:
        <InputColor
          :modelValue="color"
          @update:modelValue="$emit('update:color', $event)"
        />
      </label>
    </div>

    <FilterOwners
      v-if="filterOwners"
      :modelValue="filterOwners"
      @update:modelValue="$emit('update:filterOwners', $event)"
    >
      <template #heading>
        Find by Owner
      </template>
    </FilterOwners>
    <FilterBidders
      v-if="filterBidders"
      :modelValue="filterBidders"
      @update:modelValue="$emit('update:filterBidders', $event)"
    >
      <template #heading>
        Find by Bidder
      </template>
    </FilterBidders>
    <FilterParcelIds
      :modelValue="filterParcelIds"
      @update:modelValue="$emit('update:filterParcelIds', $event)"
    >
      <template #heading>
        Find by Parcel ID
      </template>
    </FilterParcelIds>
    <FilterParcelNames
      :modelValue="filterParcelNames"
      @update:modelValue="$emit('update:filterParcelNames', $event)"
    >
      <template #heading>
        Find by Parcel Name
      </template>
    </FilterParcelNames>
  </details>
</template>
<script>

import FilterOwners from './FilterOwners.vue'
import FilterBidders from './FilterBidders.vue'
import FilterParcelIds from './FilterParcelIds.vue'
import FilterParcelNames from './FilterParcelNames.vue'
import InputColor from './InputColor.vue'

export default {
  components: {
    FilterOwners,
    FilterBidders,
    FilterParcelIds,
    FilterParcelNames,
    InputColor
  },
  props: {
    color: { type: String, default: null },
    filterOwners: { type: Array, default: null },
    filterBidders: { type: Array, default: null },
    filterParcelIds: { type: Array, default: null },
    filterParcelNames: { type: Array, default: null }
  }
}
</script>
