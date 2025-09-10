<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    :viewBox="`0 0 ${parcelWidth} ${parcelHeight}`"
    class="parcel-grid"
    :style="{
      'width': size ? `${size.width}px` : undefined,
      'height': size ? `${size.height}px` : undefined,
    }"
  >
    <!-- workaround white gaps between tiles by making a slightly offset copy -->
    <image
      v-for="{ type, grid } in tiles"
      :key="`tile-copy__${type.id}`"
      :x="grid.x + 0.01"
      :y="grid.y + 0.01"
      :width="type.width"
      :height="type.height"
      :href="`/map/tile_${type.id}.png`"
    />
    <!-- tiles -->
    <image
      v-for="{ type, grid } in tiles"
      :key="`tile__${type.id}`"
      :x="grid.x"
      :y="grid.y"
      :width="type.width"
      :height="type.height"
      :href="`/map/tile_${type.id}.png`"
    />
    <!-- installations -->
    <image
      v-for="{ type, grid } in installationsSorted"
      :key="`installation${type.id}`"
      :x="type.image && type.image.baseOffsetLeft ? grid.x - (type.width * (type.image.baseOffsetLeft / type.image.baseWidth)) : grid.x"
      :y="type.image && type.image.baseOffsetTop ? grid.y - (type.height * (type.image.baseOffsetTop / type.image.baseHeight)) : grid.y"
      :width="type.image ? type.width * (type.image.width / type.image.baseWidth) : type.width"
      :height="type.image ? type.height * (type.image.height / type.image.baseHeight) : type.height"
      :href="`/map/installation_${type.id}.png`"
    />
    <!-- aaltar -->
    <image
      v-if="aaltar"
      :x="aaltar.type.image && aaltar.type.image.baseOffsetLeft ? aaltar.grid.x - (aaltar.type.width * (aaltar.type.image.baseOffsetLeft / aaltar.type.image.baseWidth)) : aaltar.grid.x"
      :y="aaltar.type.image && aaltar.type.image.baseOffsetTop ? aaltar.grid.y - (aaltar.type.height * (aaltar.type.image.baseOffsetTop / aaltar.type.image.baseHeight)) : aaltar.grid.y"
      :width="aaltar.type.image ? aaltar.type.width * (aaltar.type.image.width / aaltar.type.image.baseWidth) : aaltar.type.width"
      :height="aaltar.type.image ? aaltar.type.height * (aaltar.type.image.height / aaltar.type.image.baseHeight) : aaltar.type.height"
      :href="`/map/installation_${aaltar.type.id}.png`"
    />
  </svg>
</template>
<script>
import { computed } from 'vue'
import orderBy from 'lodash.orderby'
import useWindowSize from '@/environment/useWindowSize'

const MAX_PIXELS_PER_GOTCHI_UNIT = 24

export default {
  props: {
    parcelWidth: { type: Number, required: true },
    parcelHeight: { type: Number, required: true },
    tiles: { type: Array, required: true },
    aaltar: { type: Object, default: null },
    installations: { type: Array, required: true },
    fullscreen: { type: Boolean, default: false }
  },
  setup (props) {
    const { windowWidth, windowHeight } = useWindowSize()

    const aspectRatio = computed(() => props.parcelWidth / props.parcelHeight)
    const maxWidth = computed(() => props.parcelWidth * MAX_PIXELS_PER_GOTCHI_UNIT)
    const maxHeight = computed(() => props.parcelHeight * MAX_PIXELS_PER_GOTCHI_UNIT)

    const size = computed(() => {
      if (!props.fullscreen) { return null }
      // If fullscreen, calculate the exact display size of the parcel
      // calculate the max sizes based on MAX_PIXELS_PER_GOTCHI_UNIT and space for the modal UI
      const maxPossibleWidth = Math.min(maxWidth.value, windowWidth.value - 100)
      const maxPossibleHeight = Math.min(maxHeight.value, windowHeight.value - 150)
      const maxPossibleAspectRatio = maxPossibleWidth / maxPossibleHeight
      let width = maxPossibleWidth
      let height = maxPossibleHeight
      if (maxPossibleAspectRatio > aspectRatio.value) {
        // constrained by height
        width = height * aspectRatio.value
      } else {
        // constrained by width
        height = width / aspectRatio.value
      }

      return {
        width,
        height
      }
    })

    // Sort installations so they render in correct z-index order, with the topmost and leftmost behind the others.
    const installationsSorted = computed(() => orderBy(props.installations, [item => item.grid.y, item => item.grid.x]))

    return {
      size,
      installationsSorted
    }
  }
}
</script>
<style scoped>
  .parcel-grid {
    overflow: visible;
    pointer-events: none; /* avoid overflowing images blocking other parts of the UI */
    /* use border in preference to outline, because outline renders on top of overflowing image content */
    border: 1px solid var(--site-border-color--transparent);
    background-color: var(--site-background-color);
  }
</style>
