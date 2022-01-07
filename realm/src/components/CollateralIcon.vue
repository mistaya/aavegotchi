<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="symbol"
  >
    <use :xlink:href="`#icon_${address}`"></use>
  </svg>
</template>

<script>

export default {
  props: {
    address: { type: String, required: true }
  }
}
</script>

<style scoped>
  svg.symbol {
    width: 100%;
    aspect-ratio: 1/1;
  }
</style>
