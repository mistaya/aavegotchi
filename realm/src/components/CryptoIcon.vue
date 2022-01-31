<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="symbol"
    :style="{
      '--icon-size': `${size}px`
    }"
  >
    <use :xlink:href="`#icon_${address}`"></use>
  </svg>
</template>

<script>

export default {
  props: {
    address: { type: String, required: true },
    size: { type: Number, default: 16 }
  }
}
</script>

<style scoped>
  svg.symbol {
    width: var(--icon-size);
    height: var(--icon-size);
    /* aspect-ratio not supported in Safari 14, so for now we still need to specify height */
    aspect-ratio: 1/1;
  }
</style>
