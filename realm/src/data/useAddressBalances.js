import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import { useMulticallProvider } from './useProvider'
import useStatus from '@/data/useStatus'
import useERC20Contract from '@/data/useERC20Contract'
import tokens from './pockets/tokens.json'

// Not currently in use - this queries the token contracts, but subgraph is now available for alchemica.
// Fetch requested token balances for addresses.

const multicallProvider = useMulticallProvider()

export default function useAddressBalances ({ tokenLabels, addresses }) {
  const balanceAddresses = ref(addresses || [])

  const tokenDetails = computed(() => {
    const allTokens = Object.values(tokens)
    return tokenLabels
      .map(label => allTokens.find(token => token.label === label))
      .filter(item => !!item)
  })

  const tokenContracts = computed(() => tokenDetails.value.map(token => useERC20Contract(token.id)))

  const balances = ref({})

  const { status: fetchStatus, setLoading, reset: resetFetch } = useStatus()
  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const clearBalances = function () {
    balances.value = {}
    lastFetchDate.value = null
  }

  const setBalances = function (balancesByAddress, fetchDate = null) {
    Object.assign(balances.value, balancesByAddress)
    lastFetchDate.value = fetchDate || new Date()
  }

  // Addresses can be changed after initialization
  const setAddresses = function (addresses) {
    balanceAddresses.value = addresses
    resetFetch()
    clearBalances()
  }

  const requestBalancesForAddresses = async function () {
    const contractCalls = balanceAddresses.value.map(address => {
      const calls = []
      for (const contract of tokenContracts.value) {
        calls.push(contract.balanceOf(address))
      }
      return calls
    }).flat()

    const results = await multicallProvider.all(contractCalls)
    // ethers returns the result as its own BigNumber - convert it
    const resultsByAddress = {}
    // there will be N token calls per address
    const numTokens = tokenContracts.value.length
    for (let i = 0; i < results.length; i += numTokens) {
      const addressIndex = Math.floor(i / numTokens)
      const tokenBalances = resultsByAddress[balanceAddresses.value[addressIndex]] = {}
      for (let j = 0; j < numTokens; j++) {
        const details = tokenDetails.value[j]
        const tokenFactor = details.factor
        const tokenBalance = new BigNumber(results[i + j].toString()).div(tokenFactor)
        tokenBalances[details.label] = tokenBalance
      }
    }
    // console.log('requestBalancesForAddresses: Results', resultsByAddress)
    return resultsByAddress
  }

  const fetchBalances = function () {
    clearBalances()
    const [isStale, setLoaded, setError] = setLoading()

    // Give the UI a chance to display the loading state before we start fetching
    setTimeout(() => {
      if (isStale()) { return }

      let nextAddressIndex = 0
      const BATCH_SIZE = Math.floor(800 / tokenDetails.value.length)
      const requests = []
      console.log(`fetch balances using batch size ${BATCH_SIZE}`)
      while (nextAddressIndex < balanceAddresses.value.length) {
        const addressesToFetch = balanceAddresses.value.slice(nextAddressIndex, nextAddressIndex + BATCH_SIZE)
        console.log('fetch balances for addresses', addressesToFetch[0], 'to', addressesToFetch[addressesToFetch.length - 1])

        const request = requestBalancesForAddresses(addressesToFetch)
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

        nextAddressIndex += BATCH_SIZE
      }

      Promise.allSettled(requests).then(results => {
        if (isStale()) { return }
        if (results.find(result => result.status === 'rejected')) {
          setError('Error fetching batch of balances')
          return
        }
        setLoaded()
      })
    }, 100)
  }

  return {
    setAddresses,
    tokenDetails,
    balances,
    canSubmitFetch,
    fetchStatus,
    fetchBalances,
    lastFetchDate
  }
}
