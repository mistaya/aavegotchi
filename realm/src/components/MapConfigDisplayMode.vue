<template>
  <details class="filter-container">
    <summary>
      <h3>Filter Style</h3>
    </summary>

    <label
      v-for="option in [{ id: 'outline', label: 'Show outline' }, { id: 'hide', label: 'Hide' }]"
      :key="option.id"
    >
      <input
        type="radio"
        name="displayMode"
        :value="option.id"
        :checked="modelValue === option.id"
        @change="this.$emit('update:modelValue', option.id)"
      />
      {{ option.label }}
    </label>
  </details>
</template>

<script>
export default {
  props: {
    modelValue: { type: String, default: 'outline' /* or 'hide' */ }
  }
}
</script>

<style scoped>
</style>
