import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import useRealmContract from '@/data/useRealmContract'

const realm = useRealmContract()

export default function () {
  const rounds = ref([])

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const resetAlchemica = function () {
    rounds.value = []
    lastFetchDate.value = null
  }

  const fetchAlchemica = function (parcelId) {
    resetAlchemica()
    const [isStale, setLoaded, setError] = setLoading()
    realm.getParcelAlchemica(parcelId).then(async result => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (result && result.rounds) {
        rounds.value = result.rounds
        lastFetchDate.value = new Date()
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching the parcel alchemica')
    })
  }

  return {
    rounds,
    canSubmitFetch,
    fetchStatus,
    fetchAlchemica,
    lastFetchDate
  }
}
