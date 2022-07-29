import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'

// We need to fetch all parcels in full to get accurate info.
// Use cached results just for development
// import initialOwners from './parcels/parcelOwners.json'
// const ownersByParcelId = ref(initialOwners)

const ownersByParcelId = ref({})

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
const FETCH_PAGE_SIZE = 1000

const resetOwners = function () {
  ownersByParcelId.value = {}
  lastFetchDate.value = null
}

const setOwners = function (parcels) {
  for (const parcel of parcels) {
    ownersByParcelId.value[parcel.tokenId] = parcel.owner?.id
  }
}

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const fetchOwners = function () {
  const [isStale, setLoaded, setError] = setLoading()
  let lastIdNum = 0
  let parcels = []
  const fetchOwnersFromSubgraph = function () {
    fetch(SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          parcels(first: ${FETCH_PAGE_SIZE}, orderBy: tokenId, where: { tokenId_gt: ${lastIdNum} }) {
            tokenId
            owner {
              id
            }
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching parcel owners')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.parcels) {
        parcels = parcels.concat(responseJson.data.parcels)
        if (responseJson.data.parcels.length < FETCH_PAGE_SIZE) {
          // finished fetching all pages
          resetOwners()
          setOwners(parcels)
          lastFetchDate.value = new Date()
          setLoaded()
          return
        }
        // fetch the next page of results
        lastIdNum = responseJson.data.parcels[responseJson.data.parcels.length - 1].tokenId - 0
        fetchOwnersFromSubgraph()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching parcel owners')
    })
  }

  fetchOwnersFromSubgraph()
}

export default function useParcelOwners () {
  return {
    ownersByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchOwners,
    lastFetchDate
  }
}
