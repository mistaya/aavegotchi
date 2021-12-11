<template>
  <div>
    <h1>The Citaadel</h1>

    <CitaadelMap
      :viewBox="viewBox"
      :aspectRatio="aspectRatio"
      filterDisplayMode="outline"
      :parcels="parcelsToDisplay"
      @click:parcel="onClickParcel"
    />
  </div>
</template>

<script>
import { computed } from 'vue'
import CitaadelMap from './CitaadelMap.vue'
import useParcels from '../data/useParcels'

export default {
  components: {
    CitaadelMap
  },
  setup () {
    const { parcelsById } = useParcels()

    const parcelsToDisplay = computed(() =>
      Object.values(parcelsById.value)
        .map(
          parcel => ({
            ...parcel,
            show: true,
            color: 'white'
          })
        )
    )

    const onClickParcel = (parcel) => {
      console.log({ parcel })
    }
    return {
      viewBox: '0 0 9000 6000',
      aspectRatio: '9 / 6',
      parcelsToDisplay,
      onClickParcel
    }
  }
}
</script>

<style scoped>
</style>
