import { ref } from 'vue'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'
import INSTALLATIONS from './parcels/installations.json'

const GOTCHIVERSE_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
const FETCH_PAGE_SIZE = 1000

const findAaltar = function (equippedInstallations) {
  if (!equippedInstallations) { return null }
  for (const equippedInstallation of equippedInstallations) {
    const installationDetails = INSTALLATIONS[equippedInstallation.id]
    if (installationDetails && installationDetails.installationType === 'aaltar') {
      return installationDetails
    }
  }
  return null
}

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
              aaltar: findAaltar(event.parcel.equippedInstallations),
              alchemica: {
                FUD: new BigNumber(event.alchemica[0]).div(10e17).toNumber(),
                FOMO: new BigNumber(event.alchemica[1]).div(10e17).toNumber(),
                ALPHA: new BigNumber(event.alchemica[2]).div(10e17).toNumber(),
                KEK: new BigNumber(event.alchemica[3]).div(10e17).toNumber()
              },
              spilloverRate: event.spilloverRate / 10000,
              spilloverRadius: event.spilloverRadius
            })).sort((a, b) => b.date - a.date)
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
