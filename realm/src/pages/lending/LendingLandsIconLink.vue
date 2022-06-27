<template>
  <router-link
    v-if="address"
    :to="{ name: 'lending-lands', query: { address } }"
    :title="`View lands belonging to ${address.substring(0, 5)}`"
    class="lending-lands-icon-link"
  >
    <SiteIcon
      name="home"
      style="margin-right: 2px"
    />
    <div class="sr-only">
      View lands belonging to {{ address.substring(0, 5) }}
    </div>
  </router-link>
</template>

<script>
export default {
  props: {
    address: { type: String, required: true }
  }
}
</script>

<style scoped>
  .lending-lands-icon-link:hover {
    filter: drop-shadow(1px 1px 1px rgba(255, 150, 255, 1));
  }
</style>
