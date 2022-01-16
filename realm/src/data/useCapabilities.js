import { ref } from 'vue'

// Not all browsers support these APIs,
// but if they do we can try to adapt the experience.
// Store results as reactive refs, as theoretically these
// could change in future (e.g. start watching for network changes)

let maybeNetworkSlow = false
if (navigator.connection) {
  if (['slow-2g', '2g', '3g'].includes(navigator.connection.effectiveType)) {
    maybeNetworkSlow = true
  } else if (navigator.connection.saveData) {
    maybeNetworkSlow = true
  }
}
const isNetworkSlow = ref(maybeNetworkSlow)

let maybeDeviceSlow = false
// Brave doesn't report the correct deviceMemory (anti-fingerprinting)
if (!navigator.brave && navigator.deviceMemory && navigator.deviceMemory < 4) {
  maybeDeviceSlow = true
} else {
  // *assume* that if the primary input device is touch ('coarse'),
  // the device is likely a phone/tablet and may be slow
  const coarseMediaQuery = window.matchMedia('(pointer: coarse)')
  if (coarseMediaQuery.matches) {
    maybeDeviceSlow = true
  }
}
const isDeviceSlow = ref(maybeDeviceSlow)

export default function () {
  return {
    isNetworkSlow,
    isDeviceSlow
  }
}
