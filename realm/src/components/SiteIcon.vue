<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icon"
    aria-hidden="true"
  >
    <use :xlink:href="`#icon_${name}`"></use>
  </svg>
</template>

<script>

export default {
  name: 'SiteIcon',
  props: {
    name: { type: String, required: true }
  }
}
</script>

<style scoped>
  svg.icon {
    width: 16px;
    aspect-ratio: 1/1;
  }
</style>
