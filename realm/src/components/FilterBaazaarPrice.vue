<template>
  <details class="filter-container">
    <summary>
      <h4>Filter by Baazaar Price</h4>
    </summary>

    <div
      v-for="type in PARCEL_TYPES"
      :key="type"
    >
      <h4 style="text-transform: capitalize;">
        {{ type }}
      </h4>

      <div class="range-container" style="margin-top: 8px">
        <label>
          <span>Min:</span>
          <input
            :value="modelValue[type].min"
            type="text"
            class="price-range-input"
            @input="debouncedRangeChanged(type, 'min', $event.target.value)"
          />
          <span>GHST</span>
        </label>
        <label>
          <span>Max:</span>
          <input
            :value="modelValue[type].max"
            type="text"
            class="price-range-input"
            @input="debouncedRangeChanged(type, 'max', $event.target.value)"
          />
          <span>GHST</span>
        </label>
      </div>
    </div>

    <div style="margin: 15px 10px 10px 0px; display: flex; font-size: 0.9em; font-style: italic;">
      <SiteIcon
        name="info"
        style="flex: 0 0 auto; margin-right: 5px;"
      />
      <div style="flex: 1 1 auto">
        Only parcels listed in the Baazaar will be displayed when this filter is active.
      </div>
    </div>
  </details>
</template>

<script>
import debounce from 'lodash.debounce'

const PARCEL_TYPES = ['humble', 'reasonable', 'spacious']

const getDefaultValue = function () {
  return Object.fromEntries(
    PARCEL_TYPES.map(type => [
      type,
      {
        min: '',
        max: ''
      }
    ])
  )
}

const getFilter = function (listingsByParcelId, filterValue) {
  const ranges = Object.fromEntries(
    Object.entries(filterValue).map(([type, range]) => {
      const min = range.min !== '' ? range.min - 0 : NaN
      const hasMin = !Number.isNaN(min)
      const max = range.max !== '' ? range.max - 0 : NaN
      const hasMax = !Number.isNaN(max)
      return [
        type,
        {
          min,
          hasMin,
          max,
          hasMax
        }
      ]
    })
  )
  const filterSpecified = !!Object.values(ranges).find(range => range.hasMin || range.hasMax)

  return function (parcel) {
    if (!filterSpecified) {
      return true
    }
    const parcelListing = listingsByParcelId[parcel.id]
    if (!parcelListing) {
      return false
    }
    const rangeForParcel = ranges[parcel.sizeLabel]
    if (!rangeForParcel) {
      console.error('No range found for parcel of size', parcel.sizeLabel)
      return false
    }
    const price = parcelListing.priceInGhst.toNumber()
    if (rangeForParcel.hasMin && price < rangeForParcel.min) {
      return false
    }
    if (rangeForParcel.hasMax && price > rangeForParcel.max) {
      return false
    }
    return true
  }
}
export { getFilter, getDefaultValue }

export default {
  props: {
    modelValue: { type: Object, default: () => getDefaultValue() }
  },
  setup (props, ctx) {
    const rangeChanged = function (type, bound, value) {
      const newTypeEntry = {
        ...props.modelValue[type],
        [bound]: value
      }
      const newModelValue = {
        ...props.modelValue,
        [type]: newTypeEntry
      }
      ctx.emit('update:modelValue', newModelValue)
    }

    const debouncedRangeChanged = debounce(rangeChanged, 300)

    return {
      PARCEL_TYPES,
      debouncedRangeChanged
    }
  }
}
</script>

<style scoped>
  .range-container {
    display: table;
  }
  .range-container label {
    display: table-row;
  }
  .range-container label span,
  .range-container label input {
    display: table-cell;
    margin-bottom: 5px;
  }
  .range-container span:first-child {
    padding-right: 5px;
  }
  .range-container span:last-child {
    padding-left: 5px;
    padding-right: 10px;
  }
  .range-container label input {
    width: 100%;
  }
</style>
