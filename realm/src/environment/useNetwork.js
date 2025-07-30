import { ref, computed } from 'vue'

const NETWORKS = {
  base: 'base',
  polygon: 'polygon'
}

const selectedNetwork = ref(NETWORKS.base)
const isPolygonNetwork = computed(() => selectedNetwork.value === NETWORKS.polygon)
const isBaseNetwork = computed(() => selectedNetwork.value === NETWORKS.base)

const polygonAllowed = ref(true)
const baseAllowed = ref(true)

export default function () {
  return {
    NETWORKS,
    selectedNetwork,
    isPolygonNetwork,
    isBaseNetwork,
    polygonAllowed,
    baseAllowed
  }
}
