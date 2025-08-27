import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import { useMulticallProvider } from './useProvider'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import useGotchis from '@/data/useGotchis'
import useERC20Contract from '@/data/useERC20Contract'
import initialBalancesUrlPolygon from './pockets/assetGotchiBalancesPolygon.json'
import initialBalancesUrlBase from './pockets/assetGotchiBalancesBase.json'
import tokens from './pockets/tokens'

const { selectedNetwork, NETWORKS } = useNetwork()

const useGotchiBalancesForNetwork = function (network) {
  // Fetch all token balances for each gotchi's escrow address.
  // Assume that the gotchi fetch will be triggered separately.

  const multicallProvider = useMulticallProvider(network)
  const balanceTokens = []
  const balanceContracts = []

  const tokenLabels = network === NETWORKS.polygon ? ['GHST', 'vGHST', 'FUD', 'FOMO', 'ALPHA', 'KEK'] : ['GHST', 'FUD', 'FOMO', 'ALPHA', 'KEK']
  const tokensByLabelForNetwork = tokens[network].tokensByLabel
  for (const tokenLabel of tokenLabels) {
    const token = tokensByLabelForNetwork[tokenLabel]
    if (token) {
      balanceTokens.push(token)
      balanceContracts.push(useERC20Contract(token.id))
    }
  }

  const {
    gotchis,
    fetchStatus: gotchisFetchStatus
  } = useGotchis(network)

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
    console.log('fetchBalances', network)
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
  const initialBalancesUrl = network === NETWORKS.polygon ? initialBalancesUrlPolygon : initialBalancesUrlBase
  const initialBalancesTimestamp = network === NETWORKS.polygon ? 1756326492595 : 1756326492595
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
      setBalances(initialBalances, new Date(initialBalancesTimestamp))
      setLoaded()
    }).catch(error => {
      console.error(error)
      setError('Error loading initial gotchi balances')
    })

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

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useGotchiBalancesForNetwork(network) })

export default function useGotchiBalances () {
  // use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const balances = computed(() => resultToUse.value.balances.value)
  const balanceTokens = computed(() => resultToUse.value.balanceTokens)
  const canSubmitFetch = computed(() => resultToUse.value.canSubmitFetch.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const loadedBalancesDetails = computed(() => resultToUse.value.loadedBalancesDetails.value)
  const fetchBalances = computed(() => resultToUse.value.fetchBalances)
  const lastFetchDate = computed(() => resultToUse.value.lastFetchDate.value)

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
