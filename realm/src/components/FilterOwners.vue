<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Owner</h3>
    </summary>

    <label>
      <div>
        Owner addresses
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

const getFilter = function (ownersByParcelId, idsArray) {
  if (idsArray?.length) {
    return (parcel) => {
      const owner = ownersByParcelId[parcel.id]
      return owner && idsArray.includes(owner)
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
