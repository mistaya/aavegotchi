<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="icons"
  >
    <symbol
      v-for="icon in icons"
      :key="icon.id"
      :id="`icon_${icon.id}`"
      :viewBox="icon.viewBox"
      v-html="icon.svg"
    />
  </svg>
</template>

<script>
/* eslint import/no-webpack-loader-syntax: off */
/* Icons from https://iconoir.com/ */
import copySvg from '!!raw-loader!@/assets/icons/icon-copy.svg'
import cancelSvg from '!!raw-loader!@/assets/icons/icon-cancel.svg'
import arrowUpSvg from '!!raw-loader!@/assets/icons/icon-arrow-up.svg'
import arrowDownSvg from '!!raw-loader!@/assets/icons/icon-arrow-down.svg'
import arrowLeftSvg from '!!raw-loader!@/assets/icons/icon-arrow-left.svg'
import arrowRightSvg from '!!raw-loader!@/assets/icons/icon-arrow-right.svg'
import arrowUpDownSvg from '!!raw-loader!@/assets/icons/icon-arrow-up-down.svg'
import arrowLeftmostSvg from '!!raw-loader!@/assets/icons/icon-arrow-leftmost.svg'
import arrowRightmostSvg from '!!raw-loader!@/assets/icons/icon-arrow-rightmost.svg'
import openWindowSvg from '!!raw-loader!@/assets/icons/icon-open-window.svg'
import zoomInSvg from '!!raw-loader!@/assets/icons/icon-zoom-in.svg'
import checkSvg from '!!raw-loader!@/assets/icons/icon-check.svg'
import warningTriangleSvg from '!!raw-loader!@/assets/icons/icon-warning-triangle.svg'
import infoSvg from '!!raw-loader!@/assets/icons/icon-info-empty.svg'
import clockSvg from '!!raw-loader!@/assets/icons/icon-clock.svg'
import sunSvg from '!!raw-loader!@/assets/icons/icon-sun.svg'
import moonSvg from '!!raw-loader!@/assets/icons/icon-moon.svg'
import channelSvg from '!!raw-loader!@/assets/icons/icon-channel.svg'
import homeSvg from '!!raw-loader!@/assets/icons/icon-home.svg'

const icons = [
  { id: 'copy', svg: copySvg },
  { id: 'cancel', svg: cancelSvg },
  { id: 'arrow-up', svg: arrowUpSvg },
  { id: 'arrow-down', svg: arrowDownSvg },
  { id: 'arrow-left', svg: arrowLeftSvg },
  { id: 'arrow-right', svg: arrowRightSvg },
  { id: 'arrow-up-down', svg: arrowUpDownSvg },
  { id: 'arrow-leftmost', svg: arrowLeftmostSvg },
  { id: 'arrow-rightmost', svg: arrowRightmostSvg },
  { id: 'open-window', svg: openWindowSvg },
  { id: 'zoom-in', svg: zoomInSvg },
  { id: 'check', svg: checkSvg },
  { id: 'warning-triangle', svg: warningTriangleSvg },
  { id: 'info', svg: infoSvg },
  { id: 'clock', svg: clockSvg },
  { id: 'sun', svg: sunSvg },
  { id: 'moon', svg: moonSvg },
  { id: 'channel', svg: channelSvg },
  { id: 'home', svg: homeSvg }
]
icons.forEach(icon => {
  icon.viewBox = icon.svg.match(/viewBox="([^"]+)"/)?.[1]
  // increase the stroke-width
  icon.svg = icon.svg.replace(/stroke-width="1\.5"/, 'stroke-width="1.75"')
})

export default {
  computed: {
    icons () {
      return icons
    }
  }
}
</script>

<style scoped>
  svg.icons {
    display: none;
  }
</style>
