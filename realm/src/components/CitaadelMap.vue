<template>
  <div>
    <svg
      ref="svgRef"
      xmlns="http://www.w3.org/2000/svg"
      :viewBox="viewBox"
      class="map-svg"
      :class="{
        'map-svg--filter-hide': filterDisplayMode === 'hide',
        'map-svg--filter-outline': filterDisplayMode === 'outline'
      }"
      :style="{
        'aspect-ratio': aspectRatio
      }"
    >
      <g>
        <a
          v-for="parcel in parcels"
          :key="parcel.id"
          xlink:href="#"
          @click.prevent="onClickParcel(parcel)"
        >
          <rect
            class="parcel"
            :class="{
              'parcel--hidden-by-filter': !parcel.show
            }"
            :x="parcel.coordinateX"
            :y="parcel.coordinateY"
            :width="parcel.width"
            :height="parcel.height"
            stroke="#777"
            :fill="parcel.color"
          />
        </a>
      </g>
    </svg>
    <button
      type="button"
      style="margin-top: 8px"
      @click="resetZoom"
    >
      Reset map zoom
    </button>
    <span style="margin-left: 20px; font-size: 0.9em; font-style: italic; color: #888">
      {{ parcels.length }} parcels total
    </span>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import svgPanZoom from 'svg-pan-zoom'
import Hammer from 'hammerjs'

export default {
  props: {
    viewBox: { type: String, default: '0 0 10000 10000' },
    aspectRatio: { type: String, default: '1 / 1' },
    filterDisplayMode: { type: String, default: 'outline' /* or 'hide' */ },
    parcels: { type: Array, default: () => [] }
  },
  setup (props, { emit }) {
    // console.time('setup CitaadelMap')
    const svgRef = ref(null)

    const onClickParcel = function (parcel) {
      emit('click:parcel', parcel)
    }

    const panZoom = ref(null)
    const resetZoom = function () {
      if (!panZoom.value) { return }
      panZoom.value.reset()
    }
    onMounted(() => {
      // console.timeLog('mount CitaadelMap')
      // mobile example code https://bumbu.me/svg-pan-zoom/demo/mobile.html
      // limit panning example code https://bumbu.me/svg-pan-zoom/demo/limit-pan.html
      panZoom.value = svgPanZoom(svgRef.value, {
        dblClickZoomEnabled: false,
        // TODO this example code doesn't calculate the limits correctly at high zoom
        /*
        beforePan: function (oldPan, newPan) {
          const gutterWidth = 100
          const gutterHeight = 100
          // Computed variables
          const sizes = this.getSizes()
          const leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth
          const rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom)
          const topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight
          const bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom)

          const customPan = {
            x: Math.max(leftLimit, Math.min(rightLimit, newPan.x)),
            y: Math.max(topLimit, Math.min(bottomLimit, newPan.y))
          }
          return customPan
        },
        */
        customEventsHandler: {
          haltEventListeners: ['touchstart', 'touchend', 'touchmove', 'touchleave', 'touchcancel'],
          init: function (options) {
            const instance = options.instance
            let initialScale = 1
            let pannedX = 0
            let pannedY = 0

            // Init Hammer
            // Listen only for pointer and touch events
            this.hammer = Hammer(options.svgElement, {
              inputClass: Hammer.SUPPORT_POINTER_EVENTS ? Hammer.PointerEventInput : Hammer.TouchInput
            })

            // Enable pinch
            this.hammer.get('pinch').set({ enable: true })

            // Handle double tap
            this.hammer.on('doubletap', function (ev) {
              instance.zoomIn()
            })

            // Handle pan
            this.hammer.on('panstart panmove', function (ev) {
              // On pan start reset panned variables
              if (ev.type === 'panstart') {
                pannedX = 0
                pannedY = 0
              }

              // Pan only the difference
              instance.panBy({ x: ev.deltaX - pannedX, y: ev.deltaY - pannedY })
              pannedX = ev.deltaX
              pannedY = ev.deltaY
            })

            // Handle pinch
            this.hammer.on('pinchstart pinchmove', function (ev) {
              // On pinch start remember initial zoom
              if (ev.type === 'pinchstart') {
                initialScale = instance.getZoom()
                instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y })
              }

              instance.zoomAtPoint(initialScale * ev.scale, { x: ev.center.x, y: ev.center.y })
            })

            // Prevent moving the page on some devices when panning over SVG
            options.svgElement.addEventListener('touchmove', function (e) { e.preventDefault() })
          },
          destroy: function () {
            this.hammer.destroy()
          }
        }
      })
      // console.timeEnd('mount CitaadelMap')
    })
    // console.timeEnd('setup CitaadelMap')
    // console.time('mount CitaadelMap')
    return {
      svgRef,
      resetZoom,
      onClickParcel
    }
  }
}
</script>

<style scoped>
  .map-svg {
    border: 1px solid #ccc;
    width: 100%;
  }

  .map-svg--filter-hide .parcel--hidden-by-filter {
    display: none;
  }
  .map-svg--filter-outline .parcel--hidden-by-filter {
    stroke: #aaa;
    fill: white;
  }
</style>
