<template>
  <div
    class="layout-container"
    :class="`layout-container--mode-${viewMode}`"
  >
    <div class="layout-container__sidebar visible-scrollbar">
      <slot
        name="sidebar"
        :viewMode="viewMode"
        :setViewModeMap="setViewModeMap"
        :setViewModeList="setViewModeList"
      ></slot>
    </div>
    <div class="layout-container__main">
      <div class="view-modes">
        <SiteButton
          type="button"
          class="view-mode"
          :aria-pressed="`${viewMode === 'map'}`"
          @click="setViewModeMap"
        >
          Map View
        </SiteButton>
        <SiteButton
          type="button"
          class="view-mode"
          :aria-pressed="`${viewMode === 'list'}`"
          @click="setViewModeList"
        >
          List View
        </SiteButton>
        <SiteButton
          type="button"
          class="view-mode"
          :aria-pressed="`${viewMode === 'both'}`"
          @click="setViewModeBoth"
        >
          Map + List
        </SiteButton>
        <slot name="top"></slot>
      </div>
      <div
        class="layout-container__main-content"
        :class="{
          'visible-scrollbar': viewMode === 'list'
        }"
      >
        <slot
          name="main"
          :viewMode="viewMode"
          :setViewModeMap="setViewModeMap"
          :setViewModeList="setViewModeList"
          :setViewModeBoth="setViewModeBoth"
        ></slot>
      </div>
    </div>
    <div
      v-if="viewMode === 'both'"
      class="layout-container__sidebar2 visible-scrollbar"
    >
      <slot
        name="sidebar2"
        :viewMode="viewMode"
        :setViewModeMap="setViewModeMap"
        :setViewModeList="setViewModeList"
        :setViewModeBoth="setViewModeBoth"
      ></slot>
    </div>
  </div>
</template>

<script>
import { ref, onBeforeUnmount } from 'vue'
import useAppLayout from '@/useAppLayout'

export default {
  setup (props) {
    const { largeScreenFitHeight } = useAppLayout()
    const originalLargeScreenFitHeight = largeScreenFitHeight.value
    largeScreenFitHeight.value = true
    onBeforeUnmount(() => { largeScreenFitHeight.value = originalLargeScreenFitHeight })

    const viewMode = ref('map') // or 'list', or 'both'
    const setViewModeMap = () => { viewMode.value = 'map' }
    const setViewModeList = () => { viewMode.value = 'list' }
    const setViewModeBoth = () => { viewMode.value = 'both' }

    return {
      viewMode,
      setViewModeMap,
      setViewModeList,
      setViewModeBoth
    }
  }
}
</script>

<style scoped>
  .layout-container {
    display: grid;
    grid-template-columns: 1fr;
    row-gap: 20px;
  }
  @media (min-width: 800px) {
    .layout-container {
      /* columns: sidebar and main */;
      grid-template-columns: 250px 1fr;
    }
    /* spread the sidebar2 across the full width */
    .layout-container--mode-both .layout-container__sidebar2 {
      grid-column:  1 / 3;
    }
  }
  @media (min-height: 600px) and (min-width: 1100px) {
    .layout-container {
      /* a single row that fills the available height, but doesn't extend longer than it (we'll use internal scrollbars) */
      grid-template-rows: minmax(10px, 1fr);
    }
    .layout-container--mode-both {
      /* in 'both' mode, we have 3 columns: sidebar, main, sidebar2 */
      grid-template-columns: 250px 1fr minmax(250px, 25%);
    }
    /* let the sidebar2 flow on the grid normally, now we have a column for it */
    .layout-container--mode-both .layout-container__sidebar2 {
      grid-column:  auto;
    }
    /* internal scrolling */
    .layout-container__sidebar,
    .layout-container__sidebar2,
    .layout-container--mode-list .layout-container__main-content {
      overflow-y: auto;
    }
    .layout-container__main {
      margin-left: 8px;
      display: grid;
      /* view modes are one row, and the main content row fills the available height */
      grid-template-rows: auto minmax(10px, 1fr);
    }
    /* map style overrides to fill the available space */
    .layout-container--mode-map .layout-container__main-content :deep(.citaadel-map),
    .layout-container--mode-both .layout-container__main-content :deep(.citaadel-map) {
      height: 100%;
      display: grid;
      grid-template-rows: minmax(10px, 1fr);
    }
    .layout-container--mode-map .layout-container__main-content :deep(.citaadel-map .map-svg-container),
    .layout-container--mode-both .layout-container__main-content :deep(.citaadel-map .map-svg-container) {
      padding-top: 0; /* undo the padding/aspect-ratio hack */
    }
  }

  .view-modes {
    margin-bottom: 2px;
  }
  .view-mode {
    margin-right: 10px;
    margin-bottom: 8px;
    padding: 5px 10px;
  }

  /* common styles for filters inside this layout */
  :deep(details.filter-container) {
    margin-bottom: 15px;
  }
  :deep(details.filter-container[open]) {
    margin-bottom: 30px;
  }
  :deep(details.filter-container summary) {
    margin-bottom: 5px;
    cursor: pointer;
  }
  :deep(details.filter-container summary h3),
  :deep(details.filter-container summary h4) {
    display: inline;
  }
</style>
