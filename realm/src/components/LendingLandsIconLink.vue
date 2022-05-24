<template>
  <router-link
    v-if="address"
    :to="{ name: 'lending-lands', query: { address } }"
    :title="`View lands belonging to ${address.substring(0, 5)}`"
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
