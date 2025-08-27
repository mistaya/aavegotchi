import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'
import initialWearables from './wearables/wearables.json'

// Admin use only, when new wearables have been released.
// On normal pages, just import the saved wearables.json directly.

// Use cached results
const wearables = ref(initialWearables)

const SUBGRAPH_URL = apis.base.CORE_SUBGRAPH

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(new Date(1641853552901))

const setWearables = function (wearablesArray, fetchDate = null) {
  wearables.value = wearablesArray.map(w => ({
    ...w,
    id: w.id - 0 // store numeric wearable id for consistency with wearable sets
  }))
  lastFetchDate.value = fetchDate || new Date()
}

const fetchWearables = function () {
  const [isStale, setLoaded, setError] = setLoading()
  fetch(SUBGRAPH_URL, {
    method: 'POST',
    body: JSON.stringify({
      query: `{
        itemTypes(first: 1000, where: { category: 0 }) {
          id
          name
          rarityScoreModifier
          slotPositions
          traitModifiers
        }
      }`
    })
  }).then(
    async response => {
      if (isStale()) { return }
      if (!response.ok) {
        setError('There was an error fetching wearable sets')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.itemTypes) {
        setWearables(responseJson.data.itemTypes)
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    },
    error => {
      if (isStale()) { return }
      console.error(error)
      setError('There was an error fetching wearables')
    }
  )
}

export default function useFetchWearableSets () {
  return {
    wearables,
    canSubmitFetch,
    fetchStatus,
    fetchWearables,
    lastFetchDate
  }
}
