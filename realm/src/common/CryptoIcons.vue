<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="symbols"
  >
    <symbol
      v-for="symbol in symbols"
      :key="symbol.id"
      :id="`icon_${symbol.id}`"
      :data-label="symbol.label"
      viewBox="0 0 32 32"
      v-html="symbol.svg"
    />
  </svg>
</template>

<script>
import tokens from '@/data/pockets/tokens'

export default {
  computed: {
    symbols () {
      return [
        ...tokens.polygon.collaterals,
        ...tokens.polygon.tokens,
        ...tokens.base.tokens
      ]
    }
  }
}
</script>

<style scoped>
  svg.symbols {
    display: none;
  }
</style>
