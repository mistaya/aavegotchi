import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import { useMulticallProvider } from './useProvider'
import useStatus from '@/data/useStatus'
import useERC20Contract from '@/data/useERC20Contract'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import tokens from './pockets/tokens'

const { selectedNetwork } = useNetwork()

export default function useAddressBalances ({ tokenLabels, addresses }) {
  const balanceAddresses = ref(addresses || [])

  const useAddressBalancesForNetwork = function (network) {
    // Fetch requested token balances for addresses.

    const multicallProvider = useMulticallProvider(network)

    const tokensByLabelForNetwork = tokens[network].tokensByLabel
    const tokenDetails = computed(() => {
      return tokenLabels
        .map(label => tokensByLabelForNetwork[label])
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
      console.log('fetchBalances', network)
      clearBalances()
      const [isStale, setLoaded, setError] = setLoading()
      if (tokenDetails.value.length === 0) {
        console.log('useAddressBalances: no tokens to fetch')
        setLoaded()
        return
      }

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
      tokenDetails,
      balances,
      canSubmitFetch,
      fetchStatus,
      fetchBalances,
      lastFetchDate,
      // expose the following so we can reset when balanceAddresses changes
      resetFetch,
      clearBalances
    }
  }

  const { getItemForNetwork, initializedItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useAddressBalancesForNetwork(network) })

  // Addresses can be changed after initialization
  const setAddresses = function (addresses) {
    balanceAddresses.value = addresses
    // do resets synchronously - using watch is too slow, as likely will try to fetch immediately after setting addresses
    if (initializedItemForNetwork('polygon')) {
      const result = getItemForNetwork('polygon')
      result.resetFetch()
      result.clearBalances()
    }
    if (initializedItemForNetwork('base')) {
      const result = getItemForNetwork('base')
      result.resetFetch()
      result.clearBalances()
    }
  }

  // use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const tokenDetails = computed(() => resultToUse.value.tokenDetails.value)
  const balances = computed(() => resultToUse.value.balances.value)
  const canSubmitFetch = computed(() => resultToUse.value.canSubmitFetch.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchBalances = computed(() => resultToUse.value.fetchBalances)
  const lastFetchDate = computed(() => resultToUse.value.lastFetchDate.value)

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
