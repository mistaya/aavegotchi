import { ref } from 'vue'
import throttle from 'lodash.throttle'

const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

const updateWindowSize = throttle(
  function (width, height) {
    windowWidth.value = width
    windowHeight.value = height
  },
  200,
  { leading: false, trailing: true }
)

window.addEventListener('resize',
  () => {
    updateWindowSize(window.innerWidth, window.innerHeight)
  }
)

export default function () {
  return {
    windowWidth,
    windowHeight
  }
}
