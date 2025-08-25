<template>
  <div>
    <div style="margin-bottom: 10px;">
      <h2 style="display: inline; margin-right: 15px;">
        Lands open to the public
      </h2>
    </div>

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
        <div style="margin-bottom: 7px;">
          <label>
            <input
              v-model="tableFilters.onlyPublicChanneling"
              type="checkbox"
            />
            Only lands that anyone can channel
          </label>
        </div>
        <div>
          <label>
            <input
              v-model="tableFilters.onlyPublicReservoir"
              type="checkbox"
            />
            Only lands where anyone can empty reservoirs
          </label>
        </div>
      </fieldset>

      <SiteButton
        type="button"
        @click="fetchData"
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
import { computed, watch } from 'vue'
import useNetwork from '@/environment/useNetwork'
import useLendingLands from './useLendingLands'
import useLandsForTable from './useLandsForTable'
import LendingLandsTable from './LendingLandsTable.vue'

export default {
  components: {
    LendingLandsTable
  },
  setup (props) {
    const { isPolygonNetwork } = useNetwork()

    const landsQueryWhere = computed(() => `
        accessRights_: {
          actionRight_in: [0, 1],
          accessRight: 4
        },
    `)
    const { fetchLands, status, lands } = useLendingLands({
      landsQueryWhere
    })

    const fetchData = function () {
      fetchLands.value()
    }

    watch(
      () => isPolygonNetwork.value,
      fetchData,
      { immediate: true }
    )

    const { tableFilters, tableSort, tablePaging, tickerTimestamp, numFilteredLands, rowsToDisplay } = useLandsForTable({
      lands,
      initialFilters: {
        onlyCanChannelNow: false,
        onlyPublicChanneling: false,
        onlyPublicReservoir: false
      },
      initialSort: {
        column: 'aaltar level',
        direction: 'desc'
      },
      initialPaging: {
        page: 0,
        pageSize: 25
      },
      doFilter: function ({ filters, lands }) {
        let matches = lands

        // only include lands with an aaltar, as it's required for both channeling and emptying reservoirs
        matches = matches.filter(land => land.aaltar)

        if (filters.onlyPublicChanneling) {
          matches = matches.filter(land => land.accessRights.channeling.accessRight === 4)
        }
        if (filters.onlyPublicReservoir) {
          matches = matches.filter(land => land.accessRights.reservoir.accessRight === 4)
        }

        return matches
      }
    })

    return {
      fetchData,
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
</style>
