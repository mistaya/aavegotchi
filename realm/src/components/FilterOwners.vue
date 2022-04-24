<template>
  <details class="filter-container">
    <summary>
      <h4>Filter by Owner</h4>
    </summary>

    <label>
      <div>
        Owner addresses
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
import TextareaList from './TextareaList.vue'

const getFilter = function (ownersByParcelId, idsArray) {
  if (idsArray?.length) {
    const idsLowercase = idsArray.map(id => id.toLowerCase())
    return (parcel) => {
      const owner = ownersByParcelId[parcel.id]
      return owner && idsLowercase.includes(owner)
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
