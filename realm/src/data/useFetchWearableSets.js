import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import useAavegotchiContract from '@/data/useAavegotchiContract'
import initialWearableSets from './wearables/wearableSets.json'

// Admin use only, when new wearable sets have been released.
// On normal pages, just import the saved wearableSets.json directly.

// Use cached results
const wearableSets = ref(initialWearableSets)

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(new Date(1660228532931))

const setWearableSets = function (wearableSetsArray, fetchDate = null) {
  wearableSets.value = wearableSetsArray.map(w => ({
    ...w,
    name: w.name.trim() // bugfix: some wearable sets have trailing spaces
  }))
  lastFetchDate.value = fetchDate || new Date()
}

const fetchWearableSets = function () {
  const [isStale, setLoaded, setError] = setLoading()
  // The subgraph uses names as IDs, which means that
  // wearable sets that share the same name are omitted.
  // Fetch the full list from the contract instead.
  const contract = useAavegotchiContract()
  contract.getWearableSets().then(
    response => {
      if (isStale()) { return }
      setWearableSets(response)
      setLoaded()
    },
    error => {
      if (isStale()) { return }
      console.error(error)
      setError('There was an error fetching wearable sets')
    }
  )
}

export default function useFetchWearableSets () {
  return {
    wearableSets,
    canSubmitFetch,
    fetchStatus,
    fetchWearableSets,
    lastFetchDate
  }
}
