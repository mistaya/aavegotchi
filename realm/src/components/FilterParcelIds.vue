<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Parcel ID</h3>
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
import TextareaList from './TextareaList.vue'

const getFilter = function (idsArray) {
  if (idsArray?.length) {
    return (parcel) => idsArray.includes(parcel.tokenId)
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
