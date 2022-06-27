<template>
  <slot v-if="fetchStatus.loaded"></slot>
  <div v-else>
    <div v-if="fetchStatus.error">
      Error loading parcels
    </div>
    <div v-else>
      <DataFetcher
        subject="parcels"
        :use="useParcels"
        fetchProperty="initParcels"
        resultProperty="parcelsById"
      >
        <template #loaded>
          Parcels fetched
        </template>
      </DataFetcher>

      <div style="margin: 20px 0;">
        The Realm maps on this site work best on fast computers - if loading parcels takes a long time, it probably won't work very well on your current device, sorry! You can try using a desktop or laptop instead.
      </div>

      <div
        v-if="!fetchStatus.loading"
        style="margin: 20px 0; font-size: 1.4em; font-weight: bold; text-align: center;"
      >
        Click the 'Fetch' button above to start.
      </div>
    </div>
  </div>
</template>
<script>
import useCapabilities from '@/environment/useCapabilities'
import useParcels from '@/data/useParcels'
import DataFetcher from '@/common/DataFetcher.vue'

export default {
  components: {
    DataFetcher
  },
  setup (props) {
    const { initParcels, fetchStatus } = useParcels()
    const { isNetworkSlow, isDeviceSlow } = useCapabilities()
    if (!isNetworkSlow.value && !isDeviceSlow.value) {
      initParcels()
    }
    return { fetchStatus, useParcels }
  }
}
</script>

<style scoped>
</style>
