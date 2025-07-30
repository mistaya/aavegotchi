<template>
  <div
    v-if="showToggle"
    class="site-networks"
  >
    <label
      v-for="network in NETWORKS"
      :key="network"
      class="site-network"
      :class="{
        'site-network--selected': network === selectedNetwork
      }"
    >
      <input
        v-model="selectedNetwork"
        type="radio"
        name="network"
        :value="network"
        class="sr-only"
      />
      <SiteIcon :name="`network-${network}`" />
      <span
        v-if="network === selectedNetwork"
        class="site-network__name"
      >
        {{ network }}
      </span>
    </label>
  </div>
  <div
    v-else-if="showPolygon"
    class="site-network"
  >
    <SiteIcon name="polygon" />
    <span class="site-network__name">
      Polygon
    </span>
  </div>
</template>

<script>
import useNetwork from '@/environment/useNetwork'
import { computed } from 'vue'

export default {
  setup () {
    const { NETWORKS, selectedNetwork, polygonAllowed, baseAllowed } = useNetwork()

    const showToggle = computed(() => polygonAllowed.value && baseAllowed.value)

    const showPolygon = computed(() => polygonAllowed.value && !baseAllowed.value)
    return {
      NETWORKS,
      selectedNetwork,
      showToggle,
      showPolygon
    }
  }
}
</script>

<style scoped>
  .site-networks {
    display: flex;
    align-items: center;
    column-gap: 15px;
  }
  .site-network {
    position: relative;
    display: flex;
    align-items: center;
  }
  .site-network__name {
    margin-left: 5px;
    text-transform: capitalize;
    font-size: 0.9em;
    font-weight: bold;
  }
  .site-networks .site-network:not(:last-child)::after {
    content: '/';
    position: absolute;
    right: -10px;
    top: 1px;
    opacity: 0.5;
  }
  .site-network:has(input[type=radio]:focus-visible) {
    outline: 1px solid white;
    outline-offset: 4px;
  }
  .site-networks .site-network:not(.site-network--selected):hover {
    filter: drop-shadow(1px 1px 1px rgba(255, 255, 255, 1));
  }

</style>
