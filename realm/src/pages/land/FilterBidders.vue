<template>
  <details class="filter-container">
    <summary>
      <h4>
        <slot name="heading">Filter by Bidder</slot>
      </h4>
    </summary>

    <label>
      <div>
        Bidder addresses
      </div>
      <TextareaList
        class="addresses-textarea"
        :modelValue="modelValue"
        :delimiterRegexp="/[^x0-9a-fA-F]+/"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </label>
  </details>
</template>

<script>
import TextareaList from '@/common/TextareaList.vue'

const getFilter = function (parcelAuctionsByParcelId, idsArray, requireMatch) {
  if (idsArray?.length) {
    const idsLowercase = idsArray.map(id => id.toLowerCase())
    return (parcel) => {
      const bidder = parcelAuctionsByParcelId[parcel.id]?.highestBidder
      return bidder && idsLowercase.includes(bidder)
    }
  }
  if (requireMatch) {
    return () => false
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
