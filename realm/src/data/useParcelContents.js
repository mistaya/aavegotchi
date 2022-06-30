import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'

const installationsByParcelId = ref({})

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
const FETCH_PAGE_SIZE = 1000

const resetContents = function () {
  installationsByParcelId.value = {}
  lastFetchDate.value = null
}

const setContents = function (parcels) {
  for (const parcel of parcels) {
    installationsByParcelId.value[parcel.id] = parcel.equippedInstallations
  }
}

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const fetchContents = function () {
  const [isStale, setLoaded, setError] = setLoading()
  let lastIdNum = 0
  let parcels = []
  const fetchFromSubgraph = function () {
    fetch(SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          parcels(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: {
            id_gt: ${lastIdNum},
            equippedInstallations_not: []
          }) {
            id
            equippedInstallations {
              id
            }
          }
        }`
      })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching parcel contents')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.parcels) {
        parcels = parcels.concat(responseJson.data.parcels)
        if (responseJson.data.parcels.length < FETCH_PAGE_SIZE) {
          // finished fetching all pages
          parcels = parcels.map(parcel => {
            const equippedInstallations = Object.fromEntries(
              parcel.equippedInstallations.map(({ id }) => [id, true])
            )
            return {
              id: parcel.id,
              equippedInstallations
            }
          })
          resetContents()
          setContents(parcels)
          lastFetchDate.value = new Date()
          setLoaded()
          return
        }
        // fetch the next page of results
        lastIdNum = responseJson.data.parcels[responseJson.data.parcels.length - 1].id - 0
        fetchFromSubgraph()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching parcel contents')
    })
  }

  fetchFromSubgraph()
}

export default function useParcelContents () {
  return {
    installationsByParcelId,
    canSubmitFetch,
    fetchStatus,
    fetchContents,
    lastFetchDate
  }
}
