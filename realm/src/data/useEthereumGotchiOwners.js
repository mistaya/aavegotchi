import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'
import initialOwnersUrl from './pockets/assetEthereumGotchiOwners.json'

const SUBGRAPH_URL = apis.ETHEREUM_GOTCHIS_SUBGRAPH
const FETCH_PAGE_SIZE = 1000

const ownersByGotchi = ref({})

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const clearOwnersByGotchi = function () {
  ownersByGotchi.value = {}
  lastFetchDate.value = null
}
const setOwnersByGotchi = function (ownersByGotchiMap, fetchDate = null) {
  Object.assign(ownersByGotchi.value, ownersByGotchiMap)
  lastFetchDate.value = fetchDate || new Date()
}

// Note that this produces an imperfect list:
// - it includes gotchis that have been sacrificed
// - it doesn't include every gotchi that is 'on ethereum' according to their owner address
//   (perhaps stuck on bridge?)
const fetchOwners = function () {
  clearOwnersByGotchi()
  const [isStale, setLoaded, setError] = setLoading()
  let lastIdNum = 0
  let aavegotchis = []
  const fetchOwnersFromSubgraph = function () {
    fetch(SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          aavegotchis(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: { id_gt: ${lastIdNum} }) {
            id
            owner {
              id
            }
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching ethereum gotchi owners')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.aavegotchis) {
        aavegotchis = aavegotchis.concat(responseJson.data.aavegotchis)
        if (responseJson.data.aavegotchis.length < FETCH_PAGE_SIZE) {
          // finished fetching all pages
          setOwnersByGotchi(
            Object.fromEntries(
              aavegotchis.map(({ id, owner }) => [id + '', owner.id])
            )
          )
          lastFetchDate.value = new Date()
          setLoaded()
          return
        }
        // fetch the next page of results
        lastIdNum = responseJson.data.aavegotchis[responseJson.data.aavegotchis.length - 1].id - 0
        fetchOwnersFromSubgraph()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching ethereum gotchi owners')
    })
  }

  fetchOwnersFromSubgraph()
}

// Use cached initial results
const [isStale, setLoaded, setError] = setLoading()
fetch(initialOwnersUrl)
  .then(response => response.json())
  .then(json => {
    if (isStale()) { return }
    setOwnersByGotchi(json, new Date(1675441774006))
    setLoaded()
  }).catch(error => {
    console.error(error)
    setError('Error loading initial ethereum gotchi owners')
  })

export default function () {
  return {
    ownersByGotchi,
    canSubmitFetch,
    fetchStatus,
    fetchOwners,
    lastFetchDate
  }
}
