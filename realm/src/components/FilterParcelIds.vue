<template>
  <details class="filter-container">
    <summary>
      <h3>Filter by Parcel ID</h3>
    </summary>

    <label>
      <div>
        Parcel IDs, e.g. <kbd>12345</kbd>. (Exact match)
      </div>
      <textarea
        v-model="idsString"
        @input="onInput"
      />
    </label>
  </details>
</template>

<script>
import debounce from 'lodash.debounce'

const getFilter = function (idsArray) {
  if (idsArray?.length) {
    return (parcel) => idsArray.includes(parcel.tokenId)
  }
  return () => true
}
export { getFilter }

export default {
  props: {
    modelValue: { type: Array, default: () => [] }
  },
  // make a local copy of modelValue as a string for the textarea
  data () {
    return {
      idsString: ''
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler (newVal, oldVal) {
        this.idsString = this.modelValue?.join(',') || ''
      }
    }
  },
  methods: {
    onInput: debounce(function () {
      const idsArray = (this.idsString && this.idsString.trim())
        ? this.idsString.split(/[^0-9]+/).filter(id => id.length)
        : null
      // avoid emitting event early when user has typed a delimiter
      if (idsArray?.join(',') !== this.modelValue?.join(',')) {
        this.$emit('update:modelValue', idsArray)
      }
    }, 500)
  }
}
</script>

<style scoped>
  label {
    margin-top: 10px;
  }
  textarea {
    width: 90%;
    height: 40px;
    margin-top: 5px;
  }
</style>
