import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import initialGotchisUrl from './pockets/assetGotchis.json'

// Fetch all gotchis to find their escrow addresses
const gotchis = ref([])

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
const FETCH_PAGE_SIZE = 1000

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const setGotchis = function (gotchisArray, fetchDate = null) {
  gotchis.value = gotchisArray
  lastFetchDate.value = fetchDate || new Date()
}

const fetchGotchis = function () {
  const [isStale, setLoaded, setError] = setLoading()
  let lastIdNum = 0
  let fetchedGotchis = []
  const fetchGotchisFromSubgraph = function () {
    fetch(SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          aavegotchis(first: ${FETCH_PAGE_SIZE}, orderBy: gotchiId, where: { gotchiId_gt: ${lastIdNum}, owner_not: "0x0000000000000000000000000000000000000000" }) {
            id
            owner {
              id
            }
            name
            collateral
            stakedAmount
            minimumStake
            escrow
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching gotchis')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.aavegotchis) {
        fetchedGotchis = fetchedGotchis.concat(responseJson.data.aavegotchis)
        if (responseJson.data.aavegotchis.length < FETCH_PAGE_SIZE) {
          // finished fetching all pages
          setGotchis(fetchedGotchis)
          setLoaded()
          return
        }
        // fetch the next page of results
        lastIdNum = responseJson.data.aavegotchis[responseJson.data.aavegotchis.length - 1].id - 0
        fetchGotchisFromSubgraph()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching gotchis')
    })
  }

  fetchGotchisFromSubgraph()
}

// Use cached results just for development
const [isStale, setLoaded, setError] = setLoading()
fetch(initialGotchisUrl)
  .then(response => response.json())
  .then(json => {
    if (isStale()) { return }
    setGotchis(json, new Date(1642334104961))
    setLoaded()
  }).catch(error => {
    console.error(error)
    setError('Error loading initial gotchis')
  })

export default function useGotchis () {
  return {
    gotchis,
    canSubmitFetch,
    fetchStatus,
    fetchGotchis,
    lastFetchDate
  }
}
