<template>
  <div
    v-if="vortex"
    class="vortex-details site-card"
  >
    <SiteButton
      type="button"
      style="float: right; display: flex;"
      title="Close"
      @click="$emit('close')"
    >
      <span class="sr-only">Close</span>
      <SiteIcon name="cancel" />
    </SiteButton>

    <h2>Vortex:</h2>

    <div>
      Gotchiverse coordinates:
      ({{ vortex.x * 64 }},
      {{ vortex.y * 64 }})
      <br><br>
      Gotchi-unit coordinates:
      ({{ vortex.x }},
      {{ vortex.y }})
    </div>
  </div>
</template>

<script>

export default {
  props: {
    vortex: { type: Object, required: true }
  }
}
</script>

<style scoped>
  .vortex-details {
    padding: 10px 10px 15px 15px;
  }
</style>
