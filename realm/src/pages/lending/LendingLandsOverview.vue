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

      <div
        v-if="numFilteredLands === 0"
        style="margin-top: 20px;"
      >
        No lands found.
      </div>
      <template v-else>
        <div
          style="margin-top: 20px;"
        >
          <div class="site-alertbox site-alertbox--info site-alertbox--compact">
            <SiteIcon name="info" />
            <div>
              If you've borrowed a gotchi and have looked up its owner's address from the main Aavegotchi site, note that this might not be the correct address to use here. For example, if the gotchi came from the Vault, then the main site shows the <i>original</i> owner, but in the Gotchiverse you'll have access to the Vault's lands, not the original owners' lands.
              <br>To be sure, go to your
              <router-link :to="{ name: 'lending-borrower' }">Borrower page</router-link>
              and look for the gotchi's Owner reported there.
            </div>
          </div>
        </div>

        <SiteTable
          v-model:page="tablePaging.page"
          v-model:pageSize="tablePaging.pageSize"
          itemsLabel="lands"
          :numResults="numFilteredLands"
          :scrollingBreakpoint="1200"
        >
          <template #headers>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>
                District
                <SortToggle
                  defaultDirection="asc"
                  :sort="tableSort.column === 'district' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'district' : null; tableSort.direction = $event"
                />
              </th>
              <th>
                Size
                <SortToggle
                  defaultDirection="asc"
                  :sort="tableSort.column === 'size' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'size' : null; tableSort.direction = $event"
                />
              </th>
              <th>
                Aaltar
                <SortToggle
                  defaultDirection="desc"
                  :sort="tableSort.column === 'aaltar level' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'aaltar level' : null; tableSort.direction = $event"
                />
              </th>
              <th style="min-width: 100px;">
                Aaltar ready
                <SortToggle
                  defaultDirection="asc"
                  :sort="tableSort.column === 'cooldownTimestamp' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'cooldownTimestamp' : null; tableSort.direction = $event"
                />
              </th>
              <th>
                Channeling Access
              </th>
              <th>Cooldown</th>
              <th style="min-width: 100px;">
                Aaltar last used
                <SortToggle
                  defaultDirection="asc"
                  :sort="tableSort.column === 'lastChanneledTimestamp' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'lastChanneledTimestamp' : null; tableSort.direction = $event"
                />
              </th>
              <th>
                Reservoir Access
              </th>
              <th style="min-width: 100px;">
                Reservoirs last emptied
                <SortToggle
                  defaultDirection="asc"
                  :sort="tableSort.column === 'lastClaimedTimestamp' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'lastClaimedTimestamp' : null; tableSort.direction = $event"
                />
              </th>
              <th style="min-width: 100px;">
                Reservoirs ready
                <SortToggle
                  defaultDirection="asc"
                  :sort="tableSort.column === 'reservoirCooldownTimestamp' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'reservoirCooldownTimestamp' : null; tableSort.direction = $event"
                />
              </th>
            </tr>
          </template>
          <template #rows>
            <tr
              v-for="row in rowsToDisplay"
              :key="row.id"
            >
              <td>
                <router-link
                  :to="{ name: 'parcel', params: { parcelId: row.id } }"
                  target="_blank"
                  title="show parcel details in new tab"
                >
                  #{{ row.id }}
                  <SiteIcon name="open-window" :size="13" />
                  <span class="sr-only">
                    Open details in new tab
                  </span>
                </router-link>
              </td>
              <td>
                {{ row.parcelHash }}
                <CopyToClipboard
                  :text="row.parcelHash"
                  label="copy name"
                />
              </td>
              <td>
                {{ row.district }}
              </td>
              <td>
                {{ row.sizeLabel }}
              </td>
              <td>
                <template v-if="row.aaltar">
                  {{ row.aaltar.label }}
                </template>
                <!--
                  {{ row.equippedInstallations }}
                -->
              </td>
              <td>
                <template v-if="row.cooldownTimestamp < tickerTimestamp">
                  Now
                </template>
                <DateFriendly
                  v-else-if="row.cooldownDate"
                  :date="row.cooldownDate"
                  enableToggle
                />
              </td>
              <td>
                <template v-if="row.accessRights.channeling.accessRight === 0">
                  Owner
                </template>
                <template v-else-if="row.accessRights.channeling.accessRight === 1">
                  Borrower
                </template>
                <template v-else-if="row.accessRights.channeling.accessRight === 2">
                  Whitelist ({{ row.accessRights.channeling.whitelistId }})
                </template>
                <template v-else-if="row.accessRights.channeling.accessRight === 4">
                  Anyone
                </template>
              </td>
              <td>
                <template v-if="row.aaltar">
                  {{ row.aaltar.cooldownHours }}h
                </template>
              </td>
              <td>
                <DateFriendly
                  v-if="row.lastChanneledDate"
                  :date="row.lastChanneledDate"
                  enableToggle
                />
                <template v-else-if="row.lastChanneledTimestamp === 0">
                  Never used
                </template>
              </td>
              <td>
                <template v-if="row.accessRights.reservoir.accessRight === 0">
                  Owner
                </template>
                <template v-else-if="row.accessRights.reservoir.accessRight === 1">
                  Borrower
                </template>
                <template v-else-if="row.accessRights.reservoir.accessRight === 2">
                  Whitelist ({{ row.accessRights.reservoir.whitelistId }})
                </template>
                <template v-else-if="row.accessRights.reservoir.accessRight === 4">
                  Anyone
                </template>
              </td>
              <td>
                <DateFriendly
                  v-if="row.lastClaimedDate"
                  :date="row.lastClaimedDate"
                  enableToggle
                />
                <template v-else-if="row.lastClaimedDate === 0">
                  Never
                </template>
              </td>
              <td>
                <template v-if="row.reservoirCooldownTimestamp < tickerTimestamp">
                  Now
                </template>
                <DateFriendly
                  v-else-if="row.reservoirCooldownDate"
                  :date="row.reservoirCooldownDate"
                  enableToggle
                />
              </td>
            </tr>
          </template>
        </SiteTable>
      </template>
    </div>
  </div>
</template>

<script>
import orderBy from 'lodash.orderby'
import { ref, computed, watch } from 'vue'
import apis from '@/data/apis'
import useReactiveDate from '@/environment/useReactiveDate'
import useStatus from '@/data/useStatus'
import CopyToClipboard from '@/common/CopyToClipboard.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import SiteTable from '@/site/SiteTable.vue'
import SortToggle from '@/common/SortToggle.vue'
import INSTALLATIONS from '@/data/parcels/installations.json'

const GOTCHIVERSE_SUBGRAPH_URL = apis.GOTCHIVERSE_SUBGRAPH
const FETCH_PAGE_SIZE = 1000

const PARCEL_SIZE_LABELS = {
  '0': 'humble',
  '1': 'reasonable',
  '2': 'spacious',
  '3': 'spacious',
  '4': 'partner'
}

export default {
  components: {
    CopyToClipboard,
    DateFriendly,
    SiteTable,
    SortToggle
  },
  props: {
    address: { type: String, default: null }
  },
  setup (props) {
    const addressLc = computed(() => props.address?.toLowerCase())
    const { tickerDate } = useReactiveDate()
    const tickerTimestamp = computed(() => tickerDate.value - 0)

    const { status: landsStatus, setLoading: setOwnedLandsLoading } = useStatus()
    const lands = ref(null)

    const status = computed(() => ({
      loading: landsStatus.value.loading,
      error: landsStatus.value.error,
      loaded: landsStatus.value.loaded
    }))

    const fetchLands = function () {
      const [isStale, setLoaded, setError] = setOwnedLandsLoading()
      let lastIdNum = 0
      let parcels = []
      const fetchLandsFromSubgraph = function () {
        fetch(GOTCHIVERSE_SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query: `{
              parcels(
                first: ${FETCH_PAGE_SIZE},
                orderBy: tokenId,
                where: {
                  tokenId_gt: ${lastIdNum},
                  owner: "${addressLc.value}"
                }
              ) {
                id
                parcelHash
                district
                size
                accessRights {
                  actionRight
                  accessRight
                  whitelistId
                }
                equippedInstallations {
                  id
                }
                lastChanneledAlchemica
                lastClaimedAlchemica
              }
            }`
          })
        }).then(async response => {
          if (isStale()) { console.log('Stale request, ignoring'); return }
          if (!response.ok) {
            setError('There was an error fetching parcel owners')
            return
          }
          const responseJson = await response.json()
          if (responseJson.data?.parcels) {
            parcels = parcels.concat(responseJson.data.parcels)
            if (responseJson.data.parcels.length < FETCH_PAGE_SIZE) {
              // finished fetching all pages
              lands.value = parcels.map(p => {
                // accessRights will only be present if they have been set explicitly at some point
                // default to 0
                // actions (actionRight):
                //   0 Alchemical Channeling
                //   1 Emptying Reservoirs
                // permissions (accessRight):
                //   0 Owner only
                //   1 Owner + Borrowed Gotchis
                //   2 Whitelist
                //   3 Blacklist (not implemented)
                //   4 Any Gotchi
                const accessRights = {
                  channeling: p.accessRights?.find(r => r.actionRight === 0) || { accessRight: 0, whitelistId: null },
                  reservoir: p.accessRights?.find(r => r.actionRight === 1) || { accessRight: 0, whitelistId: null }
                }

                let lastChanneledTimestamp = p.lastChanneledAlchemica * 1000
                let lastClaimedTimestamp = p.lastClaimedAlchemica * 1000
                const equippedInstallations = p.equippedInstallations?.map(({ id }) => INSTALLATIONS[id])
                const aaltar = equippedInstallations.find(installation => installation?.installationType === 'aaltar')
                let cooldownTimestamp
                let cooldownDate
                let reservoirCooldownTimestamp
                let reservoirCooldownDate
                if (aaltar) {
                  // Channeling
                  if (lastChanneledTimestamp) {
                    cooldownTimestamp = lastChanneledTimestamp + (aaltar.cooldownHours * 60 * 60 * 1000)
                    cooldownDate = new Date(cooldownTimestamp)
                  } else {
                    // there is an altar but it hasn't been channeled yet, so it's available
                    cooldownTimestamp = 0
                  }
                  // Reservoir emptying
                  if (lastClaimedTimestamp) {
                    // reservoir cooldown is always 8h
                    reservoirCooldownTimestamp = lastClaimedTimestamp + (8 * 60 * 60 * 1000)
                    reservoirCooldownDate = new Date(reservoirCooldownTimestamp)
                  } else {
                    // there is an altar but it hasn't been emptied yet, so it's available
                    reservoirCooldownTimestamp = 0
                  }
                } else {
                  // If there's no aaltar, can't channel or empty reservoirs.
                  lastChanneledTimestamp = undefined
                  lastClaimedTimestamp = undefined
                }

                return {
                  ...p,
                  // convert to number for sorting
                  district: p.district - 0,
                  size: p.size - 0,
                  sizeLabel: PARCEL_SIZE_LABELS[p.size],
                  accessRights,
                  equippedInstallations,
                  aaltar,
                  lastChanneledTimestamp,
                  lastChanneledDate: lastChanneledTimestamp && new Date(lastChanneledTimestamp),
                  cooldownTimestamp,
                  cooldownDate,
                  lastClaimedTimestamp,
                  lastClaimedDate: lastClaimedTimestamp && new Date(lastClaimedTimestamp),
                  reservoirCooldownTimestamp,
                  reservoirCooldownDate
                }
              })
              setLoaded()
              return
            }
            // fetch the next page of results
            lastIdNum = responseJson.data.parcels[responseJson.data.parcels.length - 1].id - 0
            fetchLandsFromSubgraph()
          } else {
            setError('Unexpected response')
          }
        }).catch(error => {
          console.error(error)
          setError('There was an error fetching lands')
        })
      }

      fetchLandsFromSubgraph()
    }

    fetchLands()

    const tableFilters = ref({
      onlyCanChannelNow: false,
      channelingAccess: [true, true, true, true, true],
      reservoirAccess: [true, true, true, true, true]
    })

    const tableSort = ref({
      column: 'cooldownTimestamp',
      direction: 'asc'
    })

    const tablePaging = ref({
      page: 0,
      pageSize: 25
    })

    // This filters the retrieved data normally
    const tableLandsFilteredStable = computed(() => {
      const hasChannelingAccessFilter = tableFilters.value.channelingAccess.some(enabled => !enabled)
      const hasReservoirAccessFilter = tableFilters.value.reservoirAccess.some(enabled => !enabled)

      let matches = lands.value
      if (hasChannelingAccessFilter) {
        matches = matches.filter(land => {
          const parcelAccessRight = land.accessRights.channeling.accessRight
          return tableFilters.value.channelingAccess[parcelAccessRight]
        })
      }
      if (hasReservoirAccessFilter) {
        matches = matches.filter(land => {
          const parcelAccessRight = land.accessRights.reservoir.accessRight
          return tableFilters.value.reservoirAccess[parcelAccessRight]
        })
      }

      return matches
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
