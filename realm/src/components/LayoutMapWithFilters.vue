<template>
  <div class="layout-container">
    <div>
      <slot
        name="sidebar"
        :viewMode="viewMode"
        :setViewModeMap="setViewModeMap"
        :setViewModeList="setViewModeList"
      ></slot>
    </div>
    <div>
      <div class="view-modes">
        <SiteButton
          type="button"
          class="view-mode"
          :aria-pressed="`${viewMode === 'map'}`"
          @click="viewMode = 'map'"
        >
          Map View
        </SiteButton>
        <SiteButton
          type="button"
          class="view-mode"
          :aria-pressed="`${viewMode === 'list'}`"
          @click="viewMode = 'list'"
        >
          List View
        </SiteButton>
        <slot name="top"></slot>
      </div>
      <div>
        <slot
          name="main"
          :viewMode="viewMode"
          :setViewModeMap="setViewModeMap"
          :setViewModeList="setViewModeList"
        ></slot>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  setup (props) {
    const viewMode = ref('map') // or 'list'
    const setViewModeMap = () => { viewMode.value = 'map' }
    const setViewModeList = () => { viewMode.value = 'list' }
    return {
      viewMode,
      setViewModeMap,
      setViewModeList
    }
  }
}
</script>

<style scoped>
  .layout-container {
    display: grid;
    grid-template-columns: 250px 1fr;
  }
  @media (max-width: 800px) {
    .layout-container {
      grid-template-columns: 1fr;
    }
  }

  .view-modes {
    margin-bottom: 10px;
  }
  .view-mode {
    margin-right: 10px;
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
  }
  :deep(details.filter-container summary h3) {
    display: inline;
  }
</style>
