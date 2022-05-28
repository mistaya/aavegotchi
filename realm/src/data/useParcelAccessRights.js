import { ref } from 'vue'
import useStatus from '@/data/useStatus'
import useRealmContract from '@/data/useRealmContract'

// TODO this limit is untested
const FETCH_PAGE_SIZE = 1000
const realm = useRealmContract()

// https://github.com/aavegotchi/aavegotchi-realm-diamond/blob/master/contracts/libraries/AppStorage.sol#L90
// actions:
//   0 Alchemical Channeling
//   1 Emptying Reservoirs
// permissions:
//   0 Owner only
//   1 Owner + Borrowed Gotchis
//   2 Any Gotchi
// const ACTION_TYPES = [0, 1]
const ACTION_TYPES = [0]

export default function () {
  const { status: fetchStatus, setLoading, reset } = useStatus()
  const ACCESS_RIGHTS_TEMPLATE = ACTION_TYPES.map(type => ({}))
  const parcelAccessRights = ref([...ACCESS_RIGHTS_TEMPLATE]) // store one object per action type, with keys = parcel ID

  const lastFetchDate = ref(null)

  const resetResult = function () {
    reset()
    parcelAccessRights.value = [...ACCESS_RIGHTS_TEMPLATE]
    lastFetchDate.value = null
  }

  const fetchParcelAccessRights = function (parcelIds) {
    // console.log('fetchParcelAccessRights', parcelIds)
    resetResult()
    const [isStale, setLoaded, setError] = setLoading()
    if (!parcelIds || !parcelIds.length) {
      lastFetchDate.value = new Date()
      setLoaded()
      return
    }

    let lastIndex = 0
    const newResult = [...ACCESS_RIGHTS_TEMPLATE]
    const fetchAccessRightsFromContract = function () {
      const idsToFetch = parcelIds.slice(lastIndex, lastIndex + FETCH_PAGE_SIZE)
      lastIndex += idsToFetch.length
      realm.getParcelsAccessRights(idsToFetch, ACTION_TYPES).then(async results => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (results) {
          // we have one array per action type, ordered by the requested parcel IDs
          for (let i = 0; i < results.length; i++) {
            const rightsForActionType = results[i]
            for (let j = 0; j < rightsForActionType.length; j++) {
              const parcelId = idsToFetch[j]
              newResult[i][parcelId] = rightsForActionType[j]
            }
          }

          if (lastIndex >= parcelIds.length) {
            // finished fetching all pages
            parcelAccessRights.value = newResult
            lastFetchDate.value = new Date()
            // console.log(newResult)
            setLoaded()
            return
          }
          // fetch the next page of results
          fetchAccessRightsFromContract()
        } else {
          setError('Unexpected response')
        }
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching parcel access rights')
      })
    }

    fetchAccessRightsFromContract()
  }

  return {
    fetchParcelAccessRights,
    fetchStatus,
    lastFetchDate,
    parcelAccessRights,
    ACTION_TYPES
  }
}
