<template>
  <div>
    <div style="display: none;">
      Coordinates:
      ({{ parcel.coordinateX }},
      {{ parcel.coordinateY }})
    </div>
    <template v-if="gotchiverseCoords">
      Gotchiverse Coords:
      D{{ gotchiverseCoords.districtId }}
      {{ gotchiverseCoords.x }},
      {{ gotchiverseCoords.y }}
    </template>
    <br>Dimensions: {{ parcel.width }} x {{ parcel.height }}
  </div>
</template>

<script>
import { gotchiverseCoordsForParcel } from './gotchiverseCoordinates'

export default {
  props: {
    parcel: { type: Object, required: true }
  },
  computed: {
    gotchiverseCoords () {
      return gotchiverseCoordsForParcel(this.parcel)
    }
  }
}
</script>
