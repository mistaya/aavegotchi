import { ref } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'

const GOTCHIVERSE_SUBGRAPH_URL = apis.CORE_MATIC_SUBGRAPH
const FETCH_PAGE_SIZE = 1000

export default function () {
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
        setError('There was an error fetching parcels')
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
      setError('There was an error fetching lands')
    })
  }

  return {
    fetchWhitelists,
    status,
    whitelists,
    resetWhitelists
  }
}
