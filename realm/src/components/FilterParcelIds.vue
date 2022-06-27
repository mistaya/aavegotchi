<template>
  <details class="filter-container">
    <summary>
      <h4>
        <slot name="heading">Filter by Parcel ID</slot>
      </h4>
    </summary>

    <label>
      <div>
        Parcel IDs, e.g. <kbd>12345</kbd>. (Exact match)
      </div>
      <TextareaList
        class="ids-textarea"
        :modelValue="modelValue"
        :delimiterRegexp="/[^0-9]+/"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </label>
  </details>
</template>

<script>
import TextareaList from '@/common/TextareaList.vue'

const getFilter = function (idsArray, requireMatch) {
  if (idsArray?.length) {
    return (parcel) => idsArray.includes(parcel.tokenId)
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
  .ids-textarea {
    width: 90%;
    height: 40px;
    margin-top: 5px;
  }
</style>
