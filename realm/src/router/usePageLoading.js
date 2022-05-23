import { ref } from 'vue'

const pageLoading = ref(false)
const pageLazyLoadError = ref(false)

export default function () {
  return {
    pageLoading,
    pageLazyLoadError
  }
}
