<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Parcel Name</h3>
    </summary>

    <label>
      <div>
        Parcel Names, e.g. <kbd>accurate-mystical-shall</kbd>.
        <br>Partial matches will be displayed if you don't provide a full name.
      </div>
      <TextareaList
        class="names-textarea"
        :modelValue="modelValue"
        :delimiterRegexp="/[^\-a-z]+/"
        @update:modelValue="$emit('update:modelValue', $event)"
      />
    </label>
  </details>
</template>

<script>
import TextareaList from './TextareaList.vue'

const getFilter = function (namesArray) {
  if (namesArray?.length) {
    const names = namesArray.map(name => ({ name, full: name.split('-').length === 3 }))
    return (parcel) => {
      // show parcel if it matches any of the provided names (or partial names)
      let hasAnyName = false
      for (const name of names) {
        if (name.full) {
          if (parcel.parcelHash === name.name) {
            hasAnyName = true
          }
        } else {
          if (parcel.parcelHash.includes(name.name)) {
            hasAnyName = true
          }
        }
      }
      return hasAnyName
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
  .names-textarea {
    width: 90%;
    height: 70px;
    margin-top: 5px;
  }
</style>
