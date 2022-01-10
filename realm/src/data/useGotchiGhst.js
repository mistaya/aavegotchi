import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import useStatus from '@/data/useStatus'
import useGotchis from '@/data/useGotchis'
import useGhstContract from '@/data/useGhstContract'
import initialGhstUrl from './pockets/assetGotchiGhst.json'

// Fetch all GHST balances for each gotchi's escrow address.
// Assume that the gotchi fetch will be triggered separately.

const ghstContract = useGhstContract()

const {
  gotchis,
  fetchStatus: gotchisFetchStatus
} = useGotchis()

const balances = ref({})

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => gotchisFetchStatus.value.loaded && !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const clearBalances = function () {
  balances.value = {}
  lastFetchDate.value = null
}
const setBalances = function (balancesByGotchi, fetchDate = null) {
  Object.assign(balances.value, balancesByGotchi)
  lastFetchDate.value = fetchDate || new Date()
}

const gotchisWithEscrow = computed(() => gotchis.value.filter(gotchi => gotchi.escrow))

const loadedBalancesDetails = computed(() => {
  return {
    numGotchis: gotchisWithEscrow.value.length,
    numBalancesFetched: Object.keys(balances.value).length
  }
})

const fetchBalances = function () {
  clearBalances()
  const [isStale, setLoaded, setError] = setLoading()

  let nextGotchiIndex = 0
  const BATCH_SIZE = 800
  const requests = []

  while (nextGotchiIndex < gotchisWithEscrow.value.length) {
    const gotchis = gotchisWithEscrow.value.slice(nextGotchiIndex, nextGotchiIndex + BATCH_SIZE)
    console.log('fetch balances for ids', gotchis[0].id, 'to', gotchis[gotchis.length - 1].id)

    const request = ghstContract.getGotchiBalances(gotchis)
    requests.push(request)
    request.then(
      result => {
        if (isStale()) { return }
        console.log('batch balances result', { result }, Object.keys(result).length)
        setBalances(result)
      },
      error => {
        if (isStale()) { return }
        console.error(error)
        setError('Error fetching batch of balances')
      }
    )

    nextGotchiIndex += BATCH_SIZE
  }

  Promise.allSettled(requests).then(results => {
    if (isStale()) { return }
    setLoaded()
  })
}

// Use cached initial results
const [isStale, setLoaded, setError] = setLoading()
fetch(initialGhstUrl)
  .then(response => response.json())
  .then(json => {
    if (isStale()) { return }
    // store values as BigNumber
    const initialBalances = {}
    for (var key in json) {
      initialBalances[key] = new BigNumber(json[key])
    }
    setBalances(initialBalances, new Date(1641776626065))
    setLoaded()
  }).catch(error => {
    console.error(error)
    setError('Error loading initial gotchis')
  })

export default function useGotchiGhst () {
  return {
    balances,
    canSubmitFetch,
    fetchStatus,
    loadedBalancesDetails,
    fetchBalances,
    lastFetchDate
  }
}
