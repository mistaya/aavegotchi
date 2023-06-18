<template>
  <div>
    <template v-if="status.loading">
      Loading, please wait...
    </template>
    <template v-if="status.error">
      Error fetching data
    </template>

    <div v-if="status.loaded">

      <fieldset
        class="table-filters"
        style="margin-bottom: 30px;"
      >
        <legend>
          Filters
        </legend>
        <div style="margin-bottom: 7px;">
          <label>
            <input
              v-model="tableFilters.onlyCanChannelNow"
              type="checkbox"
            />
            Only Aaltars that can channel now
          </label>
        </div>
        <div class="filter-channeling-access" style="margin-bottom: 7px;">
          Channeling access:
          <label>
            <input
              v-model="tableFilters.channelingAccess[0]"
              type="checkbox"
            />
            Owner
          </label>
          &#8203;
          <label>
            <input
              v-model="tableFilters.channelingAccess[1]"
              type="checkbox"
            />
            Borrower
          </label>
          &#8203;
          <label>
            <input
              v-model="tableFilters.channelingAccess[2]"
              type="checkbox"
            />
            Whitelist
          </label>
          &#8203;
          <label>
            <input
              v-model="tableFilters.channelingAccess[4]"
              type="checkbox"
            />
            Anyone
          </label>
        </div>
        <div class="filter-reservoir-access">
          Reservoir access:
          <label>
            <input
              v-model="tableFilters.reservoirAccess[0]"
              type="checkbox"
            />
            Owner
          </label>
          &#8203;
          <label>
            <input
              v-model="tableFilters.reservoirAccess[1]"
              type="checkbox"
            />
            Borrower
          </label>
          &#8203;
          <label>
            <input
              v-model="tableFilters.reservoirAccess[2]"
              type="checkbox"
            />
            Whitelist
          </label>
          &#8203;
          <label>
            <input
              v-model="tableFilters.reservoirAccess[4]"
              type="checkbox"
            />
            Anyone
          </label>
        </div>
      </fieldset>

      <SiteButton
        type="button"
        @click="fetchLands"
      >
        Refresh data
      </SiteButton>

      <LendingLandsTable
        v-model:page="tablePaging.page"
        v-model:pageSize="tablePaging.pageSize"
        v-model:sortColumn="tableSort.column"
        v-model:sortDirection="tableSort.direction"
        :numFilteredLands="numFilteredLands"
        :rowsToDisplay="rowsToDisplay"
        :tickerTimestamp="tickerTimestamp"
      />
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import useLendingLands from './useLendingLands'
import useLandsForTable from './useLandsForTable'
import LendingLandsTable from './LendingLandsTable.vue'

export default {
  components: {
    LendingLandsTable
  },
  props: {
    address: { type: String, default: null }
  },
  setup (props) {
    const addressLc = computed(() => props.address?.toLowerCase())

    const landsQueryWhere = computed(() => `owner: "${addressLc.value}"`)
    const { fetchLands, status, lands } = useLendingLands({
      landsQueryWhere
    })

    fetchLands()

    const { tableFilters, tableSort, tablePaging, tickerTimestamp, numFilteredLands, rowsToDisplay } = useLandsForTable({
      lands,
      initialFilters: {
        onlyCanChannelNow: false,
        channelingAccess: [true, true, true, true, true],
        reservoirAccess: [true, true, true, true, true]
      },
      initialSort: {
        column: 'cooldownTimestamp',
        direction: 'asc'
      },
      initialPaging: {
        page: 0,
        pageSize: 25
      },
      doFilter: function ({ filters, lands }) {
        const hasChannelingAccessFilter = filters.channelingAccess.some(enabled => !enabled)
        const hasReservoirAccessFilter = filters.reservoirAccess.some(enabled => !enabled)

        let matches = lands
        if (hasChannelingAccessFilter) {
          matches = matches.filter(land => {
            const parcelAccessRight = land.accessRights.channeling.accessRight
            return filters.channelingAccess[parcelAccessRight]
          })
        }
        if (hasReservoirAccessFilter) {
          matches = matches.filter(land => {
            const parcelAccessRight = land.accessRights.reservoir.accessRight
            return filters.reservoirAccess[parcelAccessRight]
          })
        }

        return matches
      }
    })

    return {
      fetchLands,
      status,
      numFilteredLands,
      tableFilters,
      tablePaging,
      tableSort,
      rowsToDisplay,
      tickerTimestamp
    }
  }
}
</script>

<style scoped>
  .table-filters {
    max-width: fit-content;
    border-style: solid;
    border-color: var(--site-border-color--transparent);
  }

  .filter-channeling-access label,
  .filter-reservoir-access label {
    margin-right: 5px;
    white-space: nowrap;
  }
</style>
