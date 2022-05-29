import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import moreTokens from './pockets/tokens.json'

const TOKEN_LABELS = ['GHST', 'FUD', 'FOMO', 'ALPHA', 'KEK']
const usdPrices = ref({})
const ghstPrices = ref({})

const tokens = Object.values(moreTokens).filter(token => TOKEN_LABELS.includes(token.label))
const tokenIdsForCoingeckoUrl = tokens.map(c => encodeURIComponent(c.coingeckoId)).join(',')
const API_URL_COINGECKO = 'https://api.coingecko.com/api/v3/simple/price'

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const setPrices = function (usdPricesMap, ghstPricesMap) {
  usdPrices.value = usdPricesMap
  ghstPrices.value = ghstPricesMap
  lastFetchDate.value = new Date()
}

const fetchPrices = function () {
  const [isStale, setLoaded, setError] = setLoading()
  const coingeckoUrl = `${API_URL_COINGECKO}?ids=${tokenIdsForCoingeckoUrl}&vs_currencies=usd`

  fetch(coingeckoUrl).then(
    async (coingeckoResponse) => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!coingeckoResponse.ok) {
        setError('There was an error fetching prices')
        return
      }
      const usdPricesMap = {}
      const ghstPricesMap = {}
      const coingeckoJson = await coingeckoResponse.json()
      if (coingeckoJson[tokens[0].coingeckoId]) {
        for (const token of tokens) {
          usdPricesMap[token.id] = usdPricesMap[token.label] = coingeckoJson[token.coingeckoId]?.usd || null
        }
      } else {
        setError('Unexpected response')
        return
      }

      // Calculate GHST prices
      const ghstToken = Object.values(tokens).find(token => token.label === 'GHST')
      const ghstUsdPrice = ghstToken ? usdPricesMap[ghstToken.id] : null
      if (!ghstUsdPrice) {
        setError('Error fetching GHST price')
        return
      }
      for (const token of tokens) {
        if (token.label === 'GHST') {
          ghstPricesMap[ghstToken.id] = ghstPricesMap.GHST = 1
        } else {
          ghstPricesMap[token.id] = ghstPricesMap[token.label] = usdPricesMap[token.id] / ghstUsdPrice
        }
      }

      setPrices(usdPricesMap, ghstPricesMap)
      console.log({ usdPricesMap, ghstPricesMap })
      setLoaded()
    }
  ).catch(error => {
    console.error(error)
    setError('There was an error fetching prices')
  })
}

export default function () {
  return {
    tokens,
    usdPrices,
    ghstPrices,
    canSubmitFetch,
    fetchStatus,
    fetchPrices,
    lastFetchDate
  }
}
