<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="symbols"
  >
    <symbol
      v-for="symbol in symbols"
      :key="symbol.id"
      :id="`icon_${symbol.id}`"
      viewBox="0 0 32 32"
      v-html="symbol.svg"
    />
  </svg>
</template>

<script>
import collaterals from '@/data/pockets/collaterals.json'

export default {
  computed: {
    symbols () {
      return collaterals
    }
  }
}
</script>

<style scoped>
  svg.symbols {
    display: none;
  }
</style>
