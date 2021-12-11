<template>
  <div class="layout-container">
    <div>
      <slot name="sidebar"></slot>
    </div>
    <div>
      <div class="view-modes">
        <button
          type="button"
          class="view-mode"
          :aria-pressed="`${viewMode === 'map'}`"
          @click="viewMode = 'map'"
        >
          Map View
        </button>
        <button
          type="button"
          class="view-mode"
          :aria-pressed="`${viewMode === 'list'}`"
          @click="viewMode = 'list'"
        >
          List View
        </button>
      </div>
      <div>
        <slot
          name="main"
          :viewMode="viewMode"
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
    return {
      viewMode
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
  .view-mode[aria-pressed=true] {
    background: var(--purple);
    color: white;
    font-weight: bold;
  }
</style>
