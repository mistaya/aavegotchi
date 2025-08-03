import { ref, computed } from 'vue'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import useVghstContract from '@/data/useVghstContract'
import tokens from './pockets/tokens'

const { selectedNetwork, NETWORKS } = useNetwork()

const vghst = useVghstContract()

const usePricesForNetwork = function (network) {
  const allTokens = network === NETWORKS.polygon ? {
    ...tokens.polygon.collateralsByAddress,
    ...tokens.polygon.tokensByAddress
  } : tokens.base.tokensByAddress

  const usdPrices = ref({})

  const allTokensList = Object.values(allTokens)
  const tokensForCoingecko = allTokensList.filter(t => t.coingeckoId)
  const tokenIdsForCoingeckoUrl = tokensForCoingecko.map(c => encodeURIComponent(c.coingeckoId)).join(',')
  const API_URL_COINGECKO = 'https://api.coingecko.com/api/v3/simple/price'

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const setPrices = function (pricesMap) {
    usdPrices.value = pricesMap
    lastFetchDate.value = new Date()
  }

  const fetchPrices = function () {
    const [isStale, setLoaded, setError] = setLoading()
    const coingeckoUrl = `${API_URL_COINGECKO}?ids=${tokenIdsForCoingeckoUrl}&vs_currencies=usd`
    const fetchingCoingecko = fetch(coingeckoUrl)

    const vghstToken = allTokensList.find(token => token.label === 'vGHST')
    const fetchingVghst = vghstToken ? vghst.getGhstExchangeRate() : null

    Promise.all([fetchingCoingecko, fetchingVghst]).then(
      async ([coingeckoResponse, vghstResponse]) => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!coingeckoResponse.ok) {
          setError('There was an error fetching prices')
          return
        }
        const pricesMap = {}
        const coingeckoJson = await coingeckoResponse.json()
        if (coingeckoJson[tokensForCoingecko[0].coingeckoId]) {
          for (const token of tokensForCoingecko) {
            pricesMap[token.id] = coingeckoJson[token.coingeckoId]?.usd || null
          }
        } else {
          setError('Unexpected response')
          return
        }

        // Special handling for vGHST
        if (vghstToken) {
          const ghstToken = allTokensList.find(token => token.label === 'GHST')
          const ghstPrice = ghstToken ? pricesMap[ghstToken.id] : null
          if (vghstToken && vghstResponse?.times && ghstPrice) {
            // vghstResponse is the exchange rate of 1 vghst to ghst
            const vghstPrice = vghstResponse.times(ghstPrice).toNumber()
            pricesMap[vghstToken.id] = vghstPrice
          }
        }

        setPrices(pricesMap)
        setLoaded()
      }
    ).catch(error => {
      console.error(error)
      setError('There was an error fetching prices')
    })
  }
  return {
    tokens: allTokens,
    usdPrices,
    canSubmitFetch,
    fetchStatus,
    fetchPrices,
    lastFetchDate
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => usePricesForNetwork(network) })

export default function useTokenPrices () {
  // use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const tokens = computed(() => resultToUse.value.tokens)
  const usdPrices = computed(() => resultToUse.value.usdPrices.value)
  const canSubmitFetch = computed(() => resultToUse.value.canSubmitFetch.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchPrices = computed(() => resultToUse.value.fetchPrices)
  const lastFetchDate = computed(() => resultToUse.value.lastFetchDate.value)

  return {
    tokens,
    usdPrices,
    canSubmitFetch,
    fetchStatus,
    fetchPrices,
    lastFetchDate
  }
}
