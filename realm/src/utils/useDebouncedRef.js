import { ref, watch } from 'vue'
import debounce from 'lodash.debounce'

const useDebouncedRef = function (sourceFn, delay) {
  const debouncedRef = ref(null)
  watch(
    sourceFn,
    debounce(() => {
      debouncedRef.value = sourceFn()
    }, delay),
    { immediate: true }
  )
  return {
    debouncedRef
  }
}

export default useDebouncedRef
