import { ref } from 'vue'

export default function useStatus () {
  const status = ref({
    loading: false,
    loaded: false,
    error: false,
    errorMessage: null,
    counter: 0
  })

  const setLoading = () => {
    status.value.loading = true
    status.value.loaded = false
    status.value.error = false
    status.value.errorMessage = null
    status.value.counter++

    const counter = status.value.counter
    const isStale = () => status.value.counter !== counter
    const setLoaded = () => {
      status.value.loading = false
      status.value.loaded = true
      status.value.error = false
      status.value.errorMessage = null
    }
    const setError = (errorMessage) => {
      status.value.loading = false
      status.value.loaded = false
      status.value.error = true
      status.value.errorMessage = errorMessage
    }
    return [isStale, setLoaded, setError]
  }

  const reset = () => {
    status.value.loading = false
    status.value.loaded = false
    status.value.error = false
    status.value.errorMessage = null
    status.value.counter++
  }

  return {
    status,
    setLoading,
    reset
  }
}
