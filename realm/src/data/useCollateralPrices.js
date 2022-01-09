import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import collaterals from './pockets/collaterals.json'
import moreTokens from './pockets/tokens.json'

const usdPrices = ref({})

const tokens = Object.values(moreTokens).concat(Object.values(collaterals))

const API_URL = 'https://api.coingecko.com/api/v3/simple/price'
const tokenIdsForUrl = tokens.map(c => encodeURIComponent(c.coingeckoId)).join(',')

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const setPrices = function (gotchisArray) {
  usdPrices.value = gotchisArray
  lastFetchDate.value = new Date()
}

const fetchPrices = function () {
  const [isStale, setLoaded, setError] = setLoading()
  const url = `${API_URL}?ids=${tokenIdsForUrl}&vs_currencies=usd`
  fetch(url).then(async response => {
    if (isStale()) { console.log('Stale request, ignoring'); return }
    if (!response.ok) {
      setError('There was an error fetching gotchis')
      return
    }
    const responseJson = await response.json()
    if (responseJson[tokens[0].coingeckoId]) {
      const pricesMap = {}
      for (const token of tokens) {
        pricesMap[token.id] = responseJson[token.coingeckoId]?.usd || null
      }
      setPrices(pricesMap)
      // console.log(JSON.stringify(pricesMap))
      setLoaded()
    } else {
      setError('Unexpected response')
    }
  }).catch(error => {
    console.error(error)
    setError('There was an error fetching gotchis')
  })
}

// Use cached results just for development
// eslint-disable-next-line no-unused-vars
// const [isStale, setLoaded, setError] = setLoading()
// import('./pockets/collateralPrices.json').then(
//   ({ default: json }) => {
//     setPrices(json)
//     setLoaded()
//   }
// )

export default function useGotchis () {
  return {
    usdPrices,
    canSubmitFetch,
    fetchStatus,
    fetchPrices,
    lastFetchDate
  }
}
