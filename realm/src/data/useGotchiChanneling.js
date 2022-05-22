import format from 'date-fns/format'
import { ref, computed, watch } from 'vue'
import useStatus from '@/data/useStatus'
import useReactiveDate from '@/data/useReactiveDate'

const { tickerDate } = useReactiveDate()

const utcMidnight = computed(() => {
  const now = tickerDate.value
  // create a Date that contains the correct days, hours etc for UTC
  // (this Date is the wrong actual instant)
  const offsetDate = new Date(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    now.getUTCHours(),
    now.getUTCMinutes(),
    now.getUTCSeconds()
  )
  // generate a string that can then be parsed as UTC to make a Date with the correct instant
  // the current UTC day, at midnight
  const midnightUtcString = format(offsetDate, 'yyyy-MM-dd') + 'T00:00Z'
  return new Date(midnightUtcString)
})

const utcMidnightTimestampMs = computed(() => utcMidnight.value - 0)

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
// limits: 500 results in error response. 400 seems ok, go a bit lower to be safe
const FETCH_PAGE_SIZE = 350

export {
  utcMidnight,
  utcMidnightTimestampMs
}

export default function () {
  const { status: fetchStatus, setLoading, reset } = useStatus()
  const gotchiChannelingStatuses = ref({
    dates: {}, // keys: gotchiId
    canChannel: {} // keys: gotchiId
  })
  const lastFetchDate = ref(null)

  const resetResult = function () {
    reset()
    gotchiChannelingStatuses.value = {
      dates: {},
      canChannel: {}
    }
    lastFetchDate.value = null
  }
  watch(
    () => utcMidnightTimestampMs.value,
    () => {
      // when the utc midnight changes, previously-calculated channeling statuses become invalid
      resetResult()
    }
  )

  const fetchGotchiChannelingStatuses = function (gotchiIds) {
    // console.log('fetchGotchiChannelingStatuses', gotchiIds)
    resetResult()
    const [isStale, setLoaded, setError] = setLoading()

    let lastIndex = 0
    const newStatuses = {
      dates: {},
      canChannel: {}
    }
    const fetchStatusesFromSubgraph = function () {
      const queries = []
      const gotchiIdsToFetch = gotchiIds.slice(lastIndex, lastIndex + FETCH_PAGE_SIZE)
      lastIndex += gotchiIdsToFetch.length
      for (const gotchiId of gotchiIdsToFetch) {
        // we use separate queries to fetch the most recent event for each gotchi
        // alias each query as `gGOTCHIID`
        queries.push(`
          g${gotchiId}:channelAlchemicaEvents(
            first: 1,
            orderBy: timestamp,
            orderDirection: desc,
            where: { gotchi: "${gotchiId}"}
          ) {
            timestamp
          }
        `)
      }
      fetch(SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            ${queries.join('\n')}
          }`
        })
      }).then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          setError('There was an error fetching gotchi channeling statuses')
          return
        }
        const responseJson = await response.json()
        if (responseJson.data && Object.keys(responseJson.data)[0]?.startsWith('g')) {
          for (const key in responseJson.data) {
            if (key.startsWith('g')) {
              const gotchiId = key.substring(1)
              const resultsForGotchi = responseJson.data[key]
              if (resultsForGotchi?.[0]?.timestamp) {
                const timestampMs = resultsForGotchi[0].timestamp * 1000
                newStatuses.dates[gotchiId] = new Date(timestampMs)
                newStatuses.canChannel[gotchiId] = timestampMs < utcMidnightTimestampMs.value
              } else if (resultsForGotchi?.length === 0) {
                // no channeling events found: it can channel
                newStatuses.canChannel[gotchiId] = true
              }
            }
          }

          if (lastIndex >= gotchiIds.length) {
            // finished fetching all pages
            gotchiChannelingStatuses.value = newStatuses
            lastFetchDate.value = new Date()
            // console.log(newStatuses)
            setLoaded()
            return
          }
          // fetch the next page of results
          fetchStatusesFromSubgraph()
        } else {
          setError('Unexpected response')
        }
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching parcel owners')
      })
    }

    fetchStatusesFromSubgraph()
  }

  return {
    fetchGotchiChannelingStatuses,
    fetchStatus,
    lastFetchDate,
    gotchiChannelingStatuses,
    utcMidnight,
    utcMidnightTimestampMs
  }
}
