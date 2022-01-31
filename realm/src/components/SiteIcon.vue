<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon"
    :style="{
      '--icon-size': `${size}px`
    }"
    aria-hidden="true"
  >
    <use :xlink:href="`#icon_${name}`"></use>
  </svg>
</template>

<script>

export default {
  name: 'SiteIcon',
  props: {
    name: { type: String, required: true },
    size: { type: Number, default: 16 }
  }
}
</script>

<style scoped>
  svg.icon {
    width: var(--icon-size);
    height: var(--icon-size);
    /* aspect-ratio not supported in Safari 14, so for now we still need to specify height */
    aspect-ratio: 1/1;
  }
</style>
