<template>
  <input
    type="color"
    :value="modelValue"
    @input="debouncedColorChanged"
  >
</template>

<script>
import debounce from 'lodash.debounce'

export default {
  props: {
    modelValue: { type: String, default: null }
  },
  setup (props, ctx) {
    const colorChanged = function (event) {
      ctx.emit('update:modelValue', event.target.value)
    }
    const debouncedColorChanged = debounce(colorChanged, 300)

    return {
      debouncedColorChanged
    }
  }
}
</script>
