import { ref, computed, watch } from 'vue'
import orderBy from 'lodash.orderby'
import useReactiveDate from '@/environment/useReactiveDate'

export default function ({ lands, initialFilters, initialSort, initialPaging, doFilter }) {
  const { tickerDate } = useReactiveDate()
  const tickerTimestamp = computed(() => tickerDate.value - 0)

  const tableFilters = ref({
    onlyCanChannelNow: false,
    ...initialFilters
  })

  const tableSort = ref({
    column: 'cooldownTimestamp',
    direction: 'asc',
    ...initialSort
  })

  const tablePaging = ref({
    page: 0,
    pageSize: 25,
    ...initialPaging
  })

  // This filters the retrieved data normally
  const tableLandsFilteredStable = computed(() => {
    return doFilter({
      filters: tableFilters.value,
      lands: lands.value
    })
  })

  // We sort the stable filtered data
  const tableLandsSortedStable = computed(() => {
    const { column, direction } = tableSort.value
    if (!column) { return tableLandsFilteredStable.value }
    if (column.startsWith('aaltar')) {
      const field = column.split(' ')[1]
      return orderBy(tableLandsFilteredStable.value, [row => row.aaltar?.[field]], [direction])
    }
    return orderBy(tableLandsFilteredStable.value, [column], [direction])
  })

  // This filters the data further, but the filtered results
  // can continue to change over time (with tickerTimestamp)
  // We filter the already-sorted stable data.
  const tableLandsFilteredUnstable = computed(() => {
    const onlyCanChannelNow = tableFilters.value.onlyCanChannelNow
    if (!onlyCanChannelNow) {
      return tableLandsSortedStable.value
    }
    return tableLandsSortedStable.value.filter(land => {
      if (onlyCanChannelNow &&
        !(
          land.aaltar &&
          land.cooldownTimestamp < tickerTimestamp.value
        )
      ) {
        return false
      }
      return true
    })
  })

  const numFilteredLands = computed(() => tableLandsFilteredUnstable.value?.length)

  watch(
    () => ({
      sortColumn: tableSort.value.column,
      sortDirection: tableSort.value.direction,
      pageSize: tablePaging.value.pageSize,
      // We don't want to reset the page when Unstable filter results change,
      // because that can happen very frequently over time.
      // Assume that the Unstable filtered lands will only increase in number,
      // so we don't need to worry about the page becoming invalid.
      // Watch for changes in the filters instead of the results.
      tableFilters: { ...tableFilters.value },
      lands: lands.value
    }),
    () => { tablePaging.value.page = 0 }
  )

  const rowsToDisplay = computed(() => {
    const start = tablePaging.value.page * tablePaging.value.pageSize
    const end = start + tablePaging.value.pageSize
    return tableLandsFilteredUnstable.value.slice(start, end)
  })

  return {
    tableFilters,
    tableSort,
    tablePaging,
    tickerTimestamp,
    numFilteredLands,
    rowsToDisplay
  }
}
