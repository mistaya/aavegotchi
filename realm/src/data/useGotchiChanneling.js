import format from 'date-fns/format'
import { ref, computed, watch } from 'vue'
import useStatus from '@/data/useStatus'
import useReactiveDate from '@/environment/useReactiveDate'

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

// const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-gotchiverse'
const FETCH_PAGE_SIZE = 1000

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
    if (!gotchiIds || !gotchiIds.length) {
      lastFetchDate.value = new Date()
      setLoaded()
      return
    }

    let lastIndex = 0
    const newStatuses = {
      dates: {},
      canChannel: {}
    }
    const fetchStatusesFromSubgraph = function () {
      const gotchiIdsToFetch = gotchiIds.slice(lastIndex, lastIndex + FETCH_PAGE_SIZE)
      lastIndex += gotchiIdsToFetch.length
      fetch(SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            gotchis (first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(gotchiIdsToFetch)}}) {
              id
              lastChanneledAlchemica
            }
          }`
        })
      }).then(async response => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        if (!response.ok) {
          setError('There was an error fetching gotchi channeling statuses')
          return
        }
        const responseJson = await response.json()
        if (responseJson.data?.gotchis) {
          for (const gotchi of responseJson.data.gotchis) {
            const gotchiId = gotchi.id
            if (gotchi.lastChanneledAlchemica) {
              const timestampMs = gotchi.lastChanneledAlchemica * 1000
              newStatuses.dates[gotchiId] = new Date(timestampMs)
              newStatuses.canChannel[gotchiId] = timestampMs < utcMidnightTimestampMs.value
            }
          }
          // Gotchis that have never channeled will not be returned in the result.
          // The negative result means that they can channel
          for (const gotchiId of gotchiIdsToFetch) {
            if (!newStatuses.dates[gotchiId]) {
              newStatuses.canChannel[gotchiId] = true
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
    utcMidnightTimestampMs,
    resetResult
  }
}
