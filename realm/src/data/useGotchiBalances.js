import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import { useMulticallProvider } from './useProvider'
import useStatus from '@/data/useStatus'
import useGotchis from '@/data/useGotchis'
import useERC20Contract from '@/data/useERC20Contract'
import initialBalancesUrl from './pockets/assetGotchiBalances.json'
import tokens from './pockets/tokens.json'

// Fetch all token balances for each gotchi's escrow address.
// Assume that the gotchi fetch will be triggered separately.

const multicallProvider = useMulticallProvider()
const balanceTokens = []
const balanceContracts = []

for (const tokenLabel of ['GHST', 'vGHST', 'FUD', 'FOMO', 'ALPHA', 'KEK']) {
  const token = Object.values(tokens).find(({ label }) => label === tokenLabel)
  if (token) {
    balanceTokens.push(token)
    balanceContracts.push(useERC20Contract(token.id))
  }
}

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

const requestBalancesForGotchis = async function (gotchis, delayMs) {
  const contractCalls = gotchis.map(gotchi => {
    const calls = []
    for (const contract of balanceContracts) {
      calls.push(contract.balanceOf(gotchi.escrow))
    }
    return calls
  }).flat()

  // pause to avoid overloading RPC
  await new Promise((resolve, reject) => setTimeout(resolve, delayMs))

  const results = await multicallProvider.all(contractCalls)
  // ethers returns the result as its own BigNumber - convert it
  const resultsByGotchiId = {}
  // there will be N token calls per gotchi
  const numTokens = balanceContracts.length
  for (let i = 0; i < results.length; i += numTokens) {
    const gotchiIndex = Math.floor(i / numTokens)
    const tokenBalances = resultsByGotchiId[gotchis[gotchiIndex]?.id] = []
    for (let j = 0; j < numTokens; j++) {
      const tokenFactor = balanceTokens[j].factor
      const tokenBalance = new BigNumber(results[i + j].toString()).div(tokenFactor)
      tokenBalances.push(tokenBalance)
    }
  }
  // console.log('getGotchiBalances: Results', gotchis, resultsByGotchiId)
  return resultsByGotchiId
}

const fetchBalances = function () {
  clearBalances()
  const [isStale, setLoaded, setError] = setLoading()

  // Give the UI a chance to display the loading state before we start fetching
  setTimeout(() => {
    if (isStale()) { return }

    let nextGotchiIndex = 0
    const BATCH_SIZE = Math.floor(800 / balanceTokens.length)
    const requests = []
    console.log(`fetch balances using batch size ${BATCH_SIZE})`)
    const requestsPerSecond = 5
    let delayMs = 0
    while (nextGotchiIndex < gotchisWithEscrow.value.length) {
      const gotchis = gotchisWithEscrow.value.slice(nextGotchiIndex, nextGotchiIndex + BATCH_SIZE)
      console.log('fetch balances for ids', gotchis[0].id, 'to', gotchis[gotchis.length - 1].id, 'delay seconds', delayMs / 1000)
      const request = requestBalancesForGotchis(gotchis, delayMs)
      requests.push(request)
      request.then(
        result => {
          if (isStale()) { return }
          // console.log('batch balances result', { result }, Object.keys(result).length)
          setBalances(result)
        },
        error => {
          if (isStale()) { return }
          console.error(error)
          setError('Error fetching batch of balances')
        }
      )

      nextGotchiIndex += BATCH_SIZE
      delayMs += 1000 / requestsPerSecond
    }

    Promise.allSettled(requests).then(results => {
      if (isStale()) { return }
      setLoaded()
    })
  }, 100)
}

// Use cached initial results
const [isStale, setLoaded, setError] = setLoading()
fetch(initialBalancesUrl)
  .then(response => response.json())
  .then(json => {
    if (isStale()) { return }
    // store values as BigNumber
    const initialBalances = {}
    for (const gotchiId in json) {
      const balances = initialBalances[gotchiId] = []
      for (const item of json[gotchiId]) {
        balances.push(new BigNumber(item))
      }
    }
    setBalances(initialBalances, new Date(1730549412718))
    setLoaded()
  }).catch(error => {
    console.error(error)
    setError('Error loading initial gotchi balances')
  })

export default function useGotchiBalances () {
  return {
    balances,
    balanceTokens,
    canSubmitFetch,
    fetchStatus,
    loadedBalancesDetails,
    fetchBalances,
    lastFetchDate
  }
}
