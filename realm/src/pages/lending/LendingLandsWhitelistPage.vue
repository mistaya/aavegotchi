<template>
  <div>
    <div style="margin-bottom: 10px;">
      <h2 style="display: inline; margin-right: 15px;">
        Lands open to a whitelist
      </h2>
    </div>

    <fieldset
      class="table-filters"
      style="margin-bottom: 30px;"
    >
      <legend>
        Whitelist(s)
      </legend>

      <div style="margin-bottom: 14px;">
        <label>
          Whitelist ID(s)
          <br>
          <textarea
            v-model="whitelistForm.whitelistsText"
            style="margin-top: 5px; display: block; width: 100%; max-width: 30em; min-height: 40px"
            placeholder="123 4567"
          />
        </label>
      </div>
      <div style="margin-bottom: 7px;">
        <label>
          Find whitelists containing address:
          <br>
          <input
            v-model="whitelistForm.addressInWhitelist"
            type="text"
            style="margin-top: 5px; display: block; width: 100%; max-width: 30em;"
            placeholder="0x..."
          />
        </label>
      </div>
      <div
        v-if="whitelistForm.addressInWhitelist"
        style="margin-left: 20px"
      >
        <div
          v-if="!validAddressInWhitelist"
          class="site-alertbox site-alertbox--compact site-alertbox--warning"
        >
          Invalid address
        </div>
        <div
          v-if="whitelistsWithAddressStatus.loading"
          class="site-alertbox site-alertbox--compact site-alertbox--info"
        >
          Fetching...
        </div>
        <div
          v-else-if="whitelistsWithAddressStatus.error"
          class="site-alertbox site-alertbox--compact site-alertbox--warning"
        >
          Sorry, there was an error fetching whitelists for this address
        </div>
        <div
          v-else-if="whitelistsWithAddressStatus.loaded"
          class="site-alertbox site-alertbox--compact site-alertbox--info"
        >
          <div>
            <template v-if="whitelistsWithAddress.length === 0">
              None found.
            </template>
            <template v-else>
              Found:
              <template
                v-for="(whitelist, index) in whitelistsWithAddress"
              >
                <template v-if="whitelist.name">
                  {{ whitelist.name }} (#{{ whitelist.id}}){{ (index === whitelistsWithAddress.length - 1) ? '' : ',&nbsp;' }}
                </template>
                <template v-else>
                  #{{ whitelist.id }}{{ (index === whitelistsWithAddress.length - 1) ? '' : ',&nbsp;' }}
                </template>
              </template>
            </template>
          </div>
        </div>
      </div>
    </fieldset>

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
              v-model="tableFilters.onlyWhitelistChanneling"
              type="checkbox"
            />
            Only lands that the whitelist(s) can channel
          </label>
        </div>
        <div>
          <label>
            <input
              v-model="tableFilters.onlyWhitelistReservoir"
              type="checkbox"
            />
            Only lands where the whitelist(s) can empty reservoirs
          </label>
        </div>
      </fieldset>

      <SiteButton
        type="button"
        @click="fetchLands"
      >
        Refresh data
      </SiteButton>

      <div
        v-if="whitelistIds.length"
        style="margin-top: 20px"
      >
        Whitelist ids: {{ whitelistIds.join(", ") }}
      </div>

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
import debounce from 'lodash.debounce'
import { ref, computed, watch } from 'vue'
import useNetwork from '@/environment/useNetwork'
import { useRouter } from 'vue-router'
import useWhitelistsWithAddress from './useWhitelistsWithAddress'
import useLendingLands from './useLendingLands'
import useLandsForTable from './useLandsForTable'
import LendingLandsTable from './LendingLandsTable.vue'

export default {
  components: {
    LendingLandsTable
  },
  props: {
    queryWhitelistIds: { type: String, default: null },
    queryAddress: { type: String, default: null }
  },
  setup (props) {
    const { isPolygonNetwork } = useNetwork()

    const router = useRouter()

    const whitelistForm = ref({
      whitelistsText: '',
      addressInWhitelist: ''
    })
    const whitelistIdsFromText = computed(() => {
      const ids = (whitelistForm.value.whitelistsText.match(/(\d+)/g) || []).map(value => value - 0)
      ids.sort((a, b) => (a - b))
      return ids
    })
    const validAddressInWhitelist = computed(() => {
      const address = whitelistForm.value.addressInWhitelist
      const hasValidAddress = address.length === 42
      if (hasValidAddress) {
        return address
      }
      return ''
    })

    // When an address is specified, we need to do a query to find whitelists containing it
    const { fetchWhitelists, status: whitelistsWithAddressStatus, whitelists: whitelistsWithAddress, resetWhitelists } = useWhitelistsWithAddress()

    const debouncedFetchWhitelists = debounce(function () {
      // after the debounce delay, recheck the address
      const address = validAddressInWhitelist.value
      if (address) {
        fetchWhitelists.value({ address })
      } else {
        resetWhitelists.value()
      }
    }, 500)

    watch(
      () => [isPolygonNetwork.value, validAddressInWhitelist.value],
      () => {
        // immediately clear any old results when the network or address changes
        resetWhitelists.value()
        // delay the actual fetch
        debouncedFetchWhitelists()
      },
      { immediate: true }
    )

    // URL params sync: from URL to form
    watch(
      () => JSON.stringify({ address: props.queryAddress, queryWhitelistIds: props.queryWhitelistIds }),
      () => {
        // update form from props (url params)
        // 1. if url doesn't have any queryAddress, make sure there is no valid address in the form (there could be an invalid one)
        if (!props.queryAddress && validAddressInWhitelist.value) {
          whitelistForm.value.addressInWhitelist = ''
        }
        // 2. if url has a queryAddress, make sure the form matches it
        if (props.queryAddress && validAddressInWhitelist.value !== props.queryAddress) {
          whitelistForm.value.addressInWhitelist = props.queryAddress
        }
        // 3. if url has no whitelistIds, make sure there are none in the form (there could be all-invalid entries)
        if (!props.queryWhitelistIds && whitelistIdsFromText.value.length > 0) {
          whitelistForm.value.whitelistsText = ''
        }
        // 4. if url has whitelistIds, make sure they match the ones parsed from the form (convert to numbers and sort them for comparison)
        if (props.queryWhitelistIds) {
          const sortedQueryWhitelistIds = props.queryWhitelistIds.split(',').map(value => value - 0)
          sortedQueryWhitelistIds.sort((a, b) => (a - b))
          if (whitelistIdsFromText.value.join(' ') !== sortedQueryWhitelistIds.join(' ')) {
            whitelistForm.value.whitelistsText = sortedQueryWhitelistIds.join(' ')
          }
        }
      },
      { immediate: true } // load any initial props to the form
    )

    const whitelistIds = computed(() => {
      const idsWithAddress = whitelistsWithAddressStatus.value.loaded ? whitelistsWithAddress.value.map(whitelist => whitelist.id) : []
      return Array.from(new Set(whitelistIdsFromText.value.concat(idsWithAddress))).map(v => (v - 0)) // array of numbers
    })

    const landsQueryWhere = computed(() => {
      if (!whitelistIds.value.length) { return null }
      return `
        accessRights_: {
          actionRight_in: [0, 1],
          accessRight: 2,
          whitelistId_in: ${JSON.stringify(whitelistIds.value)}
        }
      `
    })
    // to debug/find whitelisted lands, temporarily change query above:
    //   whitelistId_not: null

    const { fetchLands, status, lands, resetLands } = useLendingLands({
      landsQueryWhere
    })

    const debouncedFetchLands = debounce(function () {
      // after the debounce delay, recheck the query
      if (landsQueryWhere.value) {
        fetchLands.value()
      } else {
        resetLands.value()
      }
      // URL params sync: valid queries from form to URL
      // This will trigger the params watcher, but it should detect that the params are the same
      // as what's currently in the form.
      router.push({
        name: 'lending-lands-whitelist',
        query: {
          whitelistIds: whitelistIdsFromText.value.join(','),
          address: validAddressInWhitelist.value
        }
      })
    }, 500)

    watch(
      () => [isPolygonNetwork.value, landsQueryWhere.value],
      () => {
        // immediately clear any old results when the network or query changes
        resetLands.value()
        // delay the actual fetch
        debouncedFetchLands()
      },
      { immediate: true }
    )

    const { tableFilters, tableSort, tablePaging, tickerTimestamp, numFilteredLands, rowsToDisplay } = useLandsForTable({
      lands,
      initialFilters: {
        onlyCanChannelNow: false,
        onlyWhitelistChanneling: false,
        onlyWhitelistReservoir: false
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

        const ids = whitelistIds.value
        if (filters.onlyWhitelistChanneling) {
          matches = matches.filter(land => land.accessRights.channeling.accessRight === 2 && ids.includes(land.accessRights.channeling.whitelistId))
        }
        if (filters.onlyWhitelistReservoir) {
          matches = matches.filter(land => land.accessRights.reservoir.accessRight === 2 && ids.includes(land.accessRights.reservoir.whitelistId))
        }

        return matches
      }
    })

    return {
      whitelistForm,
      validAddressInWhitelist,
      whitelistsWithAddressStatus,
      whitelistsWithAddress,
      whitelistIds,
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
</style>
