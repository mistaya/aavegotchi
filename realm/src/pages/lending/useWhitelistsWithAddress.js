import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'

const FETCH_PAGE_SIZE = 1000

const { selectedNetwork, NETWORKS } = useNetwork()

const useWhitelistsForNetwork = function (network) {
  const GOTCHIVERSE_SUBGRAPH_URL = network === NETWORKS.polygon ? apis.CORE_MATIC_SUBGRAPH : apis.CORE_BASE_SUBGRAPH

  const { status, setLoading, reset } = useStatus()
  const whitelists = ref(null)

  const resetWhitelists = function () {
    reset()
    whitelists.value = null
  }

  const fetchWhitelists = function ({ address }) {
    if (!address) {
      resetWhitelists()
      return
    }
    const [isStale, setLoaded, setError] = setLoading()
    fetch(GOTCHIVERSE_SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          whitelists(
            first: ${FETCH_PAGE_SIZE},
            where: {
              members_contains: [${JSON.stringify(address)}]
            }
          ) {
            id
            name
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching whitelists')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.whitelists) {
        whitelists.value = responseJson.data.whitelists
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching whitelists')
    })
  }

  return {
    fetchWhitelists,
    status,
    whitelists,
    resetWhitelists
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useWhitelistsForNetwork(network) })

export default function useWhitelistsWithAddress (network = null) {
  // if network is specified, only return that one
  if (network) {
    return getItemForNetwork(network)
  }

  // by default, use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const whitelists = computed(() => resultToUse.value.whitelists.value)
  const status = computed(() => resultToUse.value.status.value)
  const fetchWhitelists = computed(() => resultToUse.value.fetchWhitelists)
  const resetWhitelists = computed(() => resultToUse.value.resetWhitelists)

  return {
    fetchWhitelists,
    status,
    whitelists,
    resetWhitelists
  }
}
