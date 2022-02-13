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
import copySvg from '!!raw-loader!./icons/icon-copy.svg'
import cancelSvg from '!!raw-loader!./icons/icon-cancel.svg'
import arrowUpSvg from '!!raw-loader!./icons/icon-arrow-up.svg'
import arrowDownSvg from '!!raw-loader!./icons/icon-arrow-down.svg'
import arrowLeftSvg from '!!raw-loader!./icons/icon-arrow-left.svg'
import arrowRightSvg from '!!raw-loader!./icons/icon-arrow-right.svg'
import arrowLeftmostSvg from '!!raw-loader!./icons/icon-arrow-leftmost.svg'
import arrowRightmostSvg from '!!raw-loader!./icons/icon-arrow-rightmost.svg'
import openWindowSvg from '!!raw-loader!./icons/icon-open-window.svg'
import checkSvg from '!!raw-loader!./icons/icon-check.svg'
import warningTriangleSvg from '!!raw-loader!./icons/icon-warning-triangle.svg'
import twitterSvg from '!!raw-loader!./icons/icon-twitter.svg'
import sunSvg from '!!raw-loader!./icons/icon-sun.svg'
import moonSvg from '!!raw-loader!./icons/icon-moon.svg'

const icons = [
  { id: 'copy', svg: copySvg },
  { id: 'cancel', svg: cancelSvg },
  { id: 'arrow-up', svg: arrowUpSvg },
  { id: 'arrow-down', svg: arrowDownSvg },
  { id: 'arrow-left', svg: arrowLeftSvg },
  { id: 'arrow-right', svg: arrowRightSvg },
  { id: 'arrow-leftmost', svg: arrowLeftmostSvg },
  { id: 'arrow-rightmost', svg: arrowRightmostSvg },
  { id: 'open-window', svg: openWindowSvg },
  { id: 'check', svg: checkSvg },
  { id: 'warning-triangle', svg: warningTriangleSvg },
  { id: 'twitter', svg: twitterSvg },
  { id: 'sun', svg: sunSvg },
  { id: 'moon', svg: moonSvg }
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
