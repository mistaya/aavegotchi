import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import BigNumber from 'bignumber.js'
import INSTALLATIONS from './parcels/installations.json'

const { selectedNetwork, NETWORKS } = useNetwork()

const FETCH_PAGE_SIZE = 1000
const DEFAULT_RECENT_MINUTES = 3

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

const useRecentSpilloverForNetwork = function (network) {
  const GOTCHIVERSE_SUBGRAPH_URL = network === NETWORKS.polygon ? apis.GOTCHIVERSE_SUBGRAPH : apis.GOTCHIVERSE_BASE_SUBGRAPH

  const recentMinutes = ref(DEFAULT_RECENT_MINUTES)
  const channelings = ref([])
  const claimed = ref([])
  const { status: fetchStatus, setLoading } = useStatus()

  const fetchSpillover = function () {
    const [isStale, setLoaded, setError] = setLoading()

    const nowMs = Date.now()
    // const nowMs = new Date('2022-06-03T00:00Z') - 0
    const startTimestamp = Math.floor((nowMs - (recentMinutes.value * 60 * 1000)) / 1000)

    let lastIdChanneling = null
    let lastIdClaimed = null
    let fetchedChannelingEvents = []
    let fetchedClaimedEvents = []

    const fetchFromSubgraph = function () {
      const idChannelingQuery = lastIdChanneling ? `, id_gt: "${lastIdChanneling}"` : ''
      const idClaimedQuery = lastIdClaimed ? `, id_gt: "${lastIdClaimed}"` : ''
      fetch(GOTCHIVERSE_SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            channelAlchemicaEvents(first: ${FETCH_PAGE_SIZE}, orderBy: id, orderDirection: "asc", where: {
              timestamp_gt: ${startTimestamp}
              ${idChannelingQuery}
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
            alchemicaClaimedEvents(first: ${FETCH_PAGE_SIZE}, orderBy: id, orderDirection: "asc", where: {
              timestamp_gt: ${startTimestamp}
              ${idClaimedQuery}
            }) {
              id
              timestamp
              realmId
              alchemicaType
              amount
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
        if (responseJson.data?.channelAlchemicaEvents && responseJson.data?.alchemicaClaimedEvents) {
          const { channelAlchemicaEvents, alchemicaClaimedEvents } = responseJson.data
          fetchedChannelingEvents = fetchedChannelingEvents.concat(channelAlchemicaEvents)
          fetchedClaimedEvents = fetchedClaimedEvents.concat(alchemicaClaimedEvents)
          if (channelAlchemicaEvents.length < FETCH_PAGE_SIZE && alchemicaClaimedEvents.length < FETCH_PAGE_SIZE) {
            // finished fetching all pages

            // store channelings, sorted by date
            channelings.value = fetchedChannelingEvents.map(event => ({
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
              spilloverRate: {
                FUD: event.spilloverRate / 10000,
                FOMO: event.spilloverRate / 10000,
                ALPHA: event.spilloverRate / 10000,
                KEK: event.spilloverRate / 10000
              },
              spilloverRadius: {
                FUD: event.spilloverRadius,
                FOMO: event.spilloverRadius,
                ALPHA: event.spilloverRadius,
                KEK: event.spilloverRadius
              }
            })).sort((a, b) => b.date - a.date)

            // claimed alchemica (parcel harvesting) has 1 event per alchemica type
            // group them together as a single event
            const claimedEventsById = {}
            const alchemicaSymbolsForTypes = ['FUD', 'FOMO', 'ALPHA', 'KEK']
            const BIG_ZERO = new BigNumber(0)
            for (const event of fetchedClaimedEvents) {
              const id = `${event.timestamp}_${event.realmId}`
              if (!claimedEventsById[id]) {
                claimedEventsById[id] = {
                  id: event.id,
                  timestamp: event.timestamp,
                  date: new Date(event.timestamp * 1000),
                  parcelId: event.realmId,
                  alchemica: {
                    FUD: BIG_ZERO,
                    FOMO: BIG_ZERO,
                    ALPHA: BIG_ZERO,
                    KEK: BIG_ZERO
                  },
                  spilloverRate: {
                    FUD: 0,
                    FOMO: 0,
                    ALPHA: 0,
                    KEK: 0
                  },
                  spilloverRadius: {
                    FUD: 0,
                    FOMO: 0,
                    ALPHA: 0,
                    KEK: 0
                  }
                }
              }
              const alchemicaSymbol = alchemicaSymbolsForTypes[event.alchemicaType]
              claimedEventsById[id].alchemica[alchemicaSymbol] = new BigNumber(event.amount).div(10e17).toNumber()
              claimedEventsById[id].spilloverRate[alchemicaSymbol] = event.spilloverRate / 10000
              claimedEventsById[id].spilloverRadius[alchemicaSymbol] = event.spilloverRadius
            }
            // Filter out harvestings with zero alchemica, and sort by date
            claimed.value = Object.values(claimedEventsById).filter(({ alchemica }) => {
              return alchemica.FUD || alchemica.FOMO || alchemica.ALPHA || alchemica.KEK
            }).sort((a, b) => b.date - a.date)

            setLoaded()
            return
          }
          // Fetch the next page of results
          if (channelAlchemicaEvents.length) {
            lastIdChanneling = channelAlchemicaEvents[channelAlchemicaEvents.length - 1].id
          }
          if (alchemicaClaimedEvents.length) {
            lastIdClaimed = alchemicaClaimedEvents[alchemicaClaimedEvents.length - 1].id
          }
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
    recentMinutes,
    fetchStatus,
    channelings,
    claimed,
    fetchSpillover
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useRecentSpilloverForNetwork(network) })

export default function useRecentSpillover (network = null) {
  // if network is specified, only return that one
  if (network) {
    return getItemForNetwork(network)
  }

  // by default, use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const recentMinutes = computed(() => resultToUse.value.recentMinutes.value)
  const channelings = computed(() => resultToUse.value.channelings.value)
  const claimed = computed(() => resultToUse.value.claimed.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchSpillover = computed(() => resultToUse.value.fetchSpillover)

  return {
    recentMinutes,
    fetchStatus,
    channelings,
    claimed,
    fetchSpillover
  }
}
