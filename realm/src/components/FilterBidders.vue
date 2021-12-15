<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Bidder</h3>
    </summary>

    <label>
      <div>
        Bidder addresses
      </div>
      <TextareaList
        class="addresses-textarea"
        :modelValue="modelValue"
        :delimiterRegexp="/[^x0-9a-f]+/"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </label>
  </details>
</template>

<script>
import TextareaList from './TextareaList.vue'

const getFilter = function (parcelAuctionsByParcelId, idsArray) {
  if (idsArray?.length) {
    return (parcel) => {
      const bidder = parcelAuctionsByParcelId[parcel.id]?.highestBidder
      return bidder && idsArray.includes(bidder)
    }
  }
  return () => true
}
export { getFilter }

export default {
  components: {
    TextareaList
  },
  props: {
    modelValue: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
  label {
    margin-top: 10px;
  }
  .addresses-textarea {
    width: 90%;
    height: 70px;
    margin-top: 5px;
  }
</style>
