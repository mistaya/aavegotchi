<template>
  <div v-if="fetchStatus.loading">
    <LoadingSpinner style="position: relative; top: 2px; margin-right: 2px;" />
    Loading parcels...

    <div style="margin-top: 20px;">
      This site works best on fast computers - if this is taking a long time, it probably won't work very well on your current device, sorry! You can try using a desktop or laptop instead.
    </div>
  </div>
  <div v-else-if="fetchStatus.error">
    Error loading parcels
  </div>
  <slot v-else></slot>
</template>
<script>
import useParcels from '@/data/useParcels'
import LoadingSpinner from './LoadingSpinner.vue'

export default {
  components: {
    LoadingSpinner
  },
  setup (props) {
    const { fetchStatus } = useParcels()
    return { fetchStatus }
  }
}
</script>

<style scoped>
</style>
