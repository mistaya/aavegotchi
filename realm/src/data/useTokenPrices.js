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
// coingecko is unreliable for the maToken prices: instead, get those directly from quickswap through covalent's API
const tokensForCoingecko = tokens.filter(t => t.polygon && t.coingeckoId)
const tokensForCovalent = tokens.filter(t => !t.polygon)
const tokenIdsForCoingeckoUrl = tokensForCoingecko.map(c => encodeURIComponent(c.coingeckoId)).join(',')
const API_URL_COINGECKO = 'https://api.coingecko.com/api/v3/simple/price'
const tokenIdsForCovalentUrl = tokensForCovalent.map(c => encodeURIComponent(c.id)).join(',')
const API_KEY_COVALENT = 'ckey_137be2b512384de28b6aadc24a4'
const API_URL_COVALENT = `https://api.covalenthq.com/v1/137/xy=k/quickswap/pools/?quote-currency=USD&format=JSON&key=${API_KEY_COVALENT}`

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
  const covalentUrl = `${API_URL_COVALENT}&contract-addresses=${tokenIdsForCovalentUrl}`
  const fetchingCovalent = fetch(covalentUrl)
  const fetchingVghst = vghst.getGhstExchangeRate()

  Promise.all([fetchingCoingecko, fetchingCovalent, fetchingVghst]).then(
    async ([coingeckoResponse, covalentResponse, vghstResponse]) => {
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

      const covalentJson = await covalentResponse.json()
      if (!covalentJson.error && covalentJson.data?.items?.length) {
        const covalentTokenIds = tokensForCovalent.map(t => t.id)
        for (const item of covalentJson.data.items) {
          // The response seems to put the largest pools first.
          // The 'quote_rate' on the pool token object is the USD price of that token
          // Use the first result for each requested token
          let tokenEntry = null
          let otherTokenEntry = null
          if (covalentTokenIds.includes(item.token_0.contract_address)) {
            tokenEntry = item.token_0
            otherTokenEntry = item.token_1
          } else if (covalentTokenIds.includes(item.token_1.contract_address)) {
            tokenEntry = item.token_1
            otherTokenEntry = item.token_0
          }
          if (tokenEntry && !pricesMap[tokenEntry.contract_address]) {
            // console.log('found price for', tokenEntry.contract_ticker_symbol, tokenEntry.quote_rate, item)
            // workaround: UNI pool is mysteriously returning zero quote_rate
            if (tokenEntry.quote_rate === 0) {
              if (otherTokenEntry.contract_ticker_symbol === 'USDC') {
                // calculate the rate manually
                const usdcAmount = otherTokenEntry.reserve / Math.pow(10, otherTokenEntry.contract_decimals)
                const tokenAmount = tokenEntry.reserve / Math.pow(10, tokenEntry.contract_decimals)
                const price = usdcAmount / tokenAmount
                // console.log(' - manually calculated price from reserves', price)
                pricesMap[tokenEntry.contract_address] = price
              }
            } else {
              pricesMap[tokenEntry.contract_address] = tokenEntry.quote_rate
            }
          }
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
