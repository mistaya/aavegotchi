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
      <textarea
        v-model="namesString"
        @input="onInput"
      />
    </label>
  </details>
</template>

<script>
import debounce from 'lodash.debounce'

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
  props: {
    modelValue: { type: Array, default: () => [] }
  },
  // make a local copy of modelValue as a string for the textarea
  data () {
    return {
      namesString: ''
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      handler (newVal, oldVal) {
        this.namesString = this.modelValue?.join(',') || ''
      }
    }
  },
  methods: {
    onInput: debounce(function () {
      const namesArray = (this.namesString && this.namesString.trim())
        ? this.namesString.toLowerCase().split(/[^\-a-z]+/)
          .filter(name => name.trim().length)
        : null
      // avoid emitting event early when user has typed a delimiter
      if (namesArray?.join(',') !== this.modelValue?.join(',')) {
        this.$emit('update:modelValue', namesArray)
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
    height: 70px;
    margin-top: 5px;
  }
</style>
