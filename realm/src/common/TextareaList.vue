<template>
  <textarea
    v-model="myString"
    @input="onInput"
  />
</template>

<script>
import debounce from 'lodash.debounce'
import isEqual from 'lodash.isequal'

export default {
  props: {
    modelValue: { type: Array, default: () => [] },
    delimiterRegexp: { type: RegExp, required: true }
  },
  // make a local copy of modelValue as a string for the textarea
  data () {
    return {
      myString: ''
    }
  },
  computed: {
    myArray () {
      return (this.myString && this.myString.trim())
        ? this.myString.toLowerCase().split(this.delimiterRegexp)
          .filter(name => name.trim().length)
        : []
    }
  },
  watch: {
    modelValue: {
      immediate: true,
      deep: true,
      handler (newVal, oldVal) {
        if (!isEqual(this.modelValue, this.myArray)) {
          this.myString = this.modelValue?.join(',') || ''
        }
      }
    }
  },
  methods: {
    onInput () {
      this.debouncedOnInput()
    },
    // gets debounced in 'created' to avoid cross-instance pollution
    debouncedOnInput () {
      // avoid emitting event early when user has typed a delimiter
      if (!isEqual(this.myArray, this.modelValue)) {
        this.$emit('update:modelValue', this.myArray)
      }
    }
  },
  created () {
    this.debouncedOnInput = debounce(this.debouncedOnInput, 500)
  },
  beforeUnmount () {
    this.debouncedOnInput.cancel()
  }
}
</script>

<style scoped>
</style>
