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

const useNetworkCachedItem = function ({ initItem }) {
  let initializedPolygon = false
  let itemForPolygon = null
  let initializedBase = false
  let itemForBase = null

  const getItemForNetwork = function (network) {
    if (network === NETWORKS.polygon) {
      if (!initializedPolygon) {
        itemForPolygon = initItem(network)
        initializedPolygon = true
      }
      return itemForPolygon
    }
    if (network === NETWORKS.base) {
      if (!initializedBase) {
        itemForBase = initItem(network)
        initializedBase = true
      }
      return itemForBase
    }
  }

  return {
    getItemForNetwork
  }
}

export {
  useNetworkCachedItem
}
