import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import { annotateParcelDetails } from './parcelUtils'

const GOTCHIVERSE_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
// const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'

export default function useParcelDetails (id) {
  const parcelDetails = ref({})

  const resetDetails = function () {
    parcelDetails.value = {}
    lastFetchDate.value = null
  }

  const setDetails = function (details) {
    parcelDetails.value = details
  }

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const fetchDetails = function () {
    const [isStale, setLoaded, setError] = setLoading()

    fetch(GOTCHIVERSE_SUBGRAPH_URL, {
      method: 'POST',
      body: JSON.stringify({
        query: `{
          parcel(id: "${id}") {
            id
            owner
            coordinateX
            coordinateY
            district
            parcelHash
            fudBoost
            fomoBoost
            alphaBoost
            kekBoost
            size
          }
        }`
      })
    // fetch(SUBGRAPH_URL, {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     query: `{
    //       parcel(id: "${id}") {
    //         id
    //         owner {
    //           id
    //         }
    //         coordinateX
    //         coordinateY
    //         district
    //         parcelHash
    //         fudBoost
    //         fomoBoost
    //         alphaBoost
    //         kekBoost
    //         size
    //       }
    //     }`
    //   })
    }).then(async response => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (!response.ok) {
        setError('There was an error fetching the parcel details')
        return
      }
      const responseJson = await response.json()
      if (responseJson.data?.parcel) {
        const details = annotateParcelDetails({
          ...responseJson.data.parcel,
          owner: responseJson.data.parcel.owner || null // gotchiverse subgraph
          // owner: responseJson.data.parcel.owner?.id || null // core-matic subgraph
        })
        resetDetails()
        setDetails(details)
        lastFetchDate.value = new Date()
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching the parcel details')
    })
  }

  return {
    parcelDetails,
    canSubmitFetch,
    fetchStatus,
    fetchDetails,
    lastFetchDate
  }
}
