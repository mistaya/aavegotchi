import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import useStatus from '@/data/useStatus'
import tokens from './pockets/tokens.json'

// Fetch requested alchemica token balances for addresses.

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-alchemica'
const FETCH_PAGE_SIZE = 1000

export default function useAddressBalances ({ addresses }) {
  const balanceAddresses = ref(addresses || [])

  const tokenDetails = computed(() => {
    const allTokens = Object.values(tokens)
    return ['FUD', 'FOMO', 'ALPHA', 'KEK']
      .map(label => allTokens.find(token => token.label === label))
      .filter(item => !!item)
  })

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

  const fetchBalances = function () {
    const [isStale, setLoaded, setError] = setLoading()
    const allAddresses = balanceAddresses.value
    let nextIndex = 0
    let results = []
    // console.log('fetching balances for', allAddresses.length, 'addresses')
    const fetchFromSubgraph = function () {
      const addressesToFetch = allAddresses.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      fetch(SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            accounts(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: { id_in: ${JSON.stringify(addressesToFetch)} }) {
              id
              ERC20balances {
                id
                contract {
                  id
                }
                valueExact
              }
            }
          }`
        })
      }).then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          setError('There was an error fetching alchemica balances')
          return
        }
        const responseJson = await response.json()
        if (responseJson.data?.accounts) {
          results = results.concat(responseJson.data.accounts)
          if (responseJson.data.accounts.length < FETCH_PAGE_SIZE) {
            // finished fetching all pages
            const balances = {}
            const tokens = tokenDetails.value
            for (const result of results) {
              balances[result.id] = {}
              for (const token of tokens) {
                const balance = result.ERC20balances.find(({ contract }) => contract?.id === token.id)
                balances[result.id][token.label] = new BigNumber(balance?.valueExact || 0).div(token.factor)
              }
            }
            // console.log({ balances })
            setBalances(balances)
            setLoaded()
            return
          }
          // fetch the next page of results
          nextIndex += FETCH_PAGE_SIZE
          fetchFromSubgraph()
        } else {
          setError('Unexpected response')
        }
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching alchemica balances')
      })
    }

    fetchFromSubgraph()
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
