import { ref } from 'vue'

const NETWORKS = {
  base: 'base',
  polygon: 'polygon'
}

const selectedNetwork = ref(NETWORKS.base)

const polygonAllowed = ref(true)
const baseAllowed = ref(true)

export default function () {
  return {
    NETWORKS,
    selectedNetwork,
    polygonAllowed,
    baseAllowed
  }
}
