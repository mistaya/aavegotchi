import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import allTokens from './pockets/tokens'

const TOKEN_LABELS = ['GHST', 'FUD', 'FOMO', 'ALPHA', 'KEK']
const usdPrices = ref({})
const ghstPrices = ref({})

const tokens = TOKEN_LABELS.map(label => allTokens.polygon.tokensByLabel[label]).filter(t => t)
const tokenIdsForCoingeckoUrl = tokens.map(c => encodeURIComponent(c.coingeckoId)).join(',')
const API_URL_COINGECKO = 'https://api.coingecko.com/api/v3/simple/price'
const CACHE_TIME_SECONDS = 300

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const setPrices = function (usdPricesMap, ghstPricesMap) {
  usdPrices.value = usdPricesMap
  ghstPrices.value = ghstPricesMap
  lastFetchDate.value = new Date()

  // cache the prices
  localStorage.setItem('prices-aavegotchi-usd', JSON.stringify(usdPricesMap))
  localStorage.setItem('prices-aavegotchi-ghst', JSON.stringify(ghstPricesMap))
  localStorage.setItem('prices-aavegotchi-date', `${lastFetchDate.value - 0}`)
}

const fetchPrices = function () {
  // If we already have recent prices, use them
  if (lastFetchDate.value && (Date.now() - lastFetchDate.value) < (CACHE_TIME_SECONDS * 1000)) {
    // console.log('Using cached prices', (Date.now() - lastFetchDate.value), (CACHE_TIME_SECONDS * 1000), lastFetchDate.value)
    return
  } else {
    // check localStorage
    const storedDateString = localStorage.getItem('prices-aavegotchi-date')
    // console.log('Checking localStorage', storedDateString)
    if (storedDateString) {
      const storedDateMs = storedDateString - 0
      if ((Date.now() - storedDateMs) < (CACHE_TIME_SECONDS * 1000)) {
        // console.log('Use localStorage prices')
        try {
          const storedUsd = JSON.parse(localStorage.getItem('prices-aavegotchi-usd'))
          const storedGhst = JSON.parse(localStorage.getItem('prices-aavegotchi-ghst'))
          if (storedUsd && storedGhst) {
            usdPrices.value = storedUsd
            ghstPrices.value = storedGhst
            lastFetchDate.value = new Date(storedDateMs)
            if (!fetchStatus.loaded) {
              // eslint-disable-next-line no-unused-vars
              const [isStale, setLoaded, setError] = setLoading()
              setLoaded()
            }
            // console.log('Using prices', storedUsd, storedGhst, lastFetchDate.value)
            return
          }
        } catch (e) {
          console.error('Error loading cached prices from localStorage', e)
        }
      }
    }
  }
  // console.log('Fetching prices')

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
      // console.log({ usdPricesMap, ghstPricesMap })
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
