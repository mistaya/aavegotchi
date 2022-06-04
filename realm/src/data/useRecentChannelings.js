import { ref } from 'vue'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'

const GOTCHIVERSE_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-gotchiverse'
const FETCH_PAGE_SIZE = 1000

export default function (recentMinutes) {
  const channelings = ref([])
  const { status: fetchStatus, setLoading } = useStatus()

  const fetchChannelings = function () {
    const [isStale, setLoaded, setError] = setLoading()

    const nowMs = Date.now()
    // const nowMs = new Date('2022-06-03T00:00Z') - 0
    const startTimestamp = Math.floor((nowMs - (recentMinutes * 60 * 1000)) / 1000)

    let lastId = null
    let fetchedEvents = []

    const fetchFromSubgraph = function () {
      const idQuery = lastId ? `, id_gt: "${lastId}"` : ''
      fetch(GOTCHIVERSE_SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            channelAlchemicaEvents(first: ${FETCH_PAGE_SIZE}, orderBy: id, orderDirection: "asc", where: {
              timestamp_gt: ${startTimestamp}
              ${idQuery}
            }) {
              id
              timestamp
              gotchi {
                id
              }
              parcel {
                id
                equippedInstallations {
                  id
                }
              }
              alchemica
              spilloverRate
              spilloverRadius
            }
          }`
        })
      }).then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          setError('There was an error fetching channeling events')
          return
        }
        const responseJson = await response.json()
        if (responseJson.data?.channelAlchemicaEvents) {
          fetchedEvents = fetchedEvents.concat(responseJson.data.channelAlchemicaEvents)
          if (responseJson.data.channelAlchemicaEvents.length < FETCH_PAGE_SIZE) {
            // finished fetching all pages
            channelings.value = fetchedEvents.map(event => ({
              id: event.id,
              timestamp: event.timestamp,
              date: new Date(event.timestamp * 1000),
              gotchiId: event.gotchi.id,
              parcelId: event.parcel.id,
              altar: event.parcel.equippedInstallations?.[0]?.id,
              fud: new BigNumber(event.alchemica[0]).div(10e17).toNumber(),
              fomo: new BigNumber(event.alchemica[1]).div(10e17).toNumber(),
              alpha: new BigNumber(event.alchemica[2]).div(10e17).toNumber(),
              kek: new BigNumber(event.alchemica[3]).div(10e17).toNumber(),
              spilloverRate: event.spilloverRate,
              spilloverRadius: event.spilloverRadius
            }))
            setLoaded()
            return
          }
          // Fetch the next page of results
          lastId = responseJson.data.channelAlchemicaEvents[responseJson.data.channelAlchemicaEvents.length - 1].id
          fetchFromSubgraph()
        } else {
          setError('Unexpected response')
        }
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching channeling events')
      })
    }

    fetchFromSubgraph()
  }

  return {
    fetchStatus,
    channelings,
    fetchChannelings
  }
}
