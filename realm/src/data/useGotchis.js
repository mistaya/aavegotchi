import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import initialGotchisUrlPolygon from './pockets/assetGotchisPolygon.json'
import initialGotchisUrlBase from './pockets/assetGotchisBase.json'

const { selectedNetwork, NETWORKS } = useNetwork()

const useGotchisForNetwork = function (network) {
  // Fetch all gotchis to find their escrow addresses
  const gotchis = ref([])

  const SUBGRAPH_URL = apis[network].CORE_SUBGRAPH
  const FETCH_PAGE_SIZE = 1000

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const setGotchis = function (gotchisArray, fetchDate = null) {
    gotchis.value = gotchisArray
    lastFetchDate.value = fetchDate || new Date()
  }

  const fetchGotchis = function () {
    console.log('fetchGotchis', network)
    const [isStale, setLoaded, setError] = setLoading()
    let lastIdNum = 0
    let fetchedGotchis = []
    const fetchingLendings = []

    const fetchLendings = function (lendingIds) {
      // we want to know about borrowed gotchis, not just listed lendings
      return fetch(SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            gotchiLendings(first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(lendingIds)}, timeAgreed_gt: 0, cancelled: false }) {
              id
              lender
              originalOwner
            }
          }`
        })
      }).then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          throw new Error('There was an error fetching lendings')
        }
        const responseJson = await response.json()
        if (responseJson.data?.gotchiLendings) {
          return responseJson.data.gotchiLendings
        } else {
          throw new Error('Unexpected lendings response')
        }
      })
    }
    const fetchGotchisFromSubgraph = function () {
      fetch(SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            aavegotchis(first: ${FETCH_PAGE_SIZE}, orderBy: gotchiId, where: { gotchiId_gt: ${lastIdNum}, owner_not: "0x0000000000000000000000000000000000000000", collateral_not: "0x0000000000000000000000000000000000000000" }) {
              id
              owner {
                id
              }
              lending
              name
              collateral
              stakedAmount
              minimumStake
              escrow
            }
          }`
        })
      }).then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          setError('There was an error fetching gotchis')
          return
        }
        const responseJson = await response.json()
        if (responseJson.data?.aavegotchis) {
          fetchedGotchis = fetchedGotchis.concat(responseJson.data.aavegotchis)
          const lendingIds = responseJson.data.aavegotchis.map(({ lending }) => lending).filter(id => id)
          fetchingLendings.push(fetchLendings(lendingIds))
          if (responseJson.data.aavegotchis.length < FETCH_PAGE_SIZE) {
            // finished fetching all gotchi pages
            // now wait for all lending data
            Promise.all(
              fetchingLendings
            ).then(lendings => {
              if (isStale()) { console.log('Stale request, ignoring'); return }
              const lendingsById = Object.fromEntries(
                [...lendings]
                  .flat()
                  .map(lending => [lending.id, lending])
              )
              // merge lending data into gotchis
              for (const gotchi of fetchedGotchis) {
                if (gotchi.lending && lendingsById[gotchi.lending]) {
                  const lending = lendingsById[gotchi.lending]
                  gotchi.lender = lending.lender
                  if (lending.originalOwner !== lending.lender) {
                    gotchi.originalOwner = lending.originalOwner
                  }
                }
              }
              setGotchis(fetchedGotchis)
              setLoaded()
            }).catch(e => {
              if (isStale()) { console.log('Stale request, ignoring'); return }
              console.error('lendings error', e)
              setError(e.message)
            })
            return
          }
          // fetch the next page of results
          lastIdNum = responseJson.data.aavegotchis[responseJson.data.aavegotchis.length - 1].id - 0
          fetchGotchisFromSubgraph()
        } else {
          setError('Unexpected response')
        }
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching gotchis')
      })
    }

    fetchGotchisFromSubgraph()
  }

  // Use cached results just for development
  const [isStale, setLoaded, setError] = setLoading()
  const initialGotchisUrl = network === NETWORKS.polygon ? initialGotchisUrlPolygon : initialGotchisUrlBase
  const initialGotchisTimestamp = network === NETWORKS.polygon ? 1756326492595 : 1756326492595
  fetch(initialGotchisUrl)
    .then(response => response.json())
    .then(json => {
      if (isStale()) { return }
      setGotchis(json, new Date(initialGotchisTimestamp))
      setLoaded()
    }).catch(error => {
      console.error(error)
      setError('Error loading initial gotchis')
    })

  return {
    gotchis,
    canSubmitFetch,
    fetchStatus,
    fetchGotchis,
    lastFetchDate
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useGotchisForNetwork(network) })

export default function useGotchis (network = null) {
  // if network is specified, only return that one
  if (network) {
    return getItemForNetwork(network)
  }

  // by default, use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const gotchis = computed(() => resultToUse.value.gotchis.value)
  const canSubmitFetch = computed(() => resultToUse.value.canSubmitFetch.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchGotchis = computed(() => resultToUse.value.fetchGotchis)
  const lastFetchDate = computed(() => resultToUse.value.lastFetchDate.value)

  return {
    gotchis,
    canSubmitFetch,
    fetchStatus,
    fetchGotchis,
    lastFetchDate
  }
}
