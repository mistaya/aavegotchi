import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import useVghstContract from '@/data/useVghstContract'
import collaterals from './pockets/collaterals.json'
import moreTokens from './pockets/tokens.json'

const vghst = useVghstContract()

const allTokens = {
  ...collaterals,
  ...moreTokens
}

const usdPrices = ref({})

const tokens = Object.values(moreTokens).filter(token => token.polygon).concat(Object.values(collaterals))
const tokensForCoingecko = tokens.filter(t => t.polygon && t.coingeckoId)
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
  const fetchingVghst = vghst.getGhstExchangeRate()

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
      const vghstToken = Object.values(allTokens).find(token => token.label === 'vGHST')
      const ghstToken = Object.values(allTokens).find(token => token.label === 'GHST')
      const ghstPrice = ghstToken ? pricesMap[ghstToken.id] : null
      if (vghstToken && vghstResponse?.times && ghstPrice) {
        // vghstResponse is the exchange rate of 1 vghst to ghst
        const vghstPrice = vghstResponse.times(ghstPrice).toNumber()
        pricesMap[vghstToken.id] = vghstPrice
      }

      setPrices(pricesMap)
      // console.log(JSON.stringify(pricesMap))
      setLoaded()
    }
  ).catch(error => {
    console.error(error)
    setError('There was an error fetching prices')
  })
}

export default function () {
  return {
    tokens: allTokens,
    usdPrices,
    canSubmitFetch,
    fetchStatus,
    fetchPrices,
    lastFetchDate
  }
}
