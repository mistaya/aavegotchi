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
        <div class="filter-channeling-access">
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
            Anyone
          </label>
        </div>
      </fieldset>

      <SiteButton
        type="button"
        @click="fetchOwnedLands"
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
        <div
          v-if="parcelAccessRightsStatus.error"
          style="margin-top: 20px;"
        >
          <div class="site-alertbox site-alertbox--warning site-alertbox--compact">
            There was an error fetching parcel access rights.
          </div>
        </div>
        <SiteTable
          v-model:page="tablePaging.page"
          v-model:pageSize="tablePaging.pageSize"
          itemsLabel="lands"
          :numResults="numFilteredLands"
          :scrollingBreakpoint="900"
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
                  :sort="tableSort.column === 'details cooldownTimestamp' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'details cooldownTimestamp' : null; tableSort.direction = $event"
                />
              </th>
              <th v-if="parcelAccessRightsStatus.loaded">
                Channeling Access
              </th>
              <th>Cooldown</th>
              <th style="min-width: 100px;">
                Aaltar last used
                <SortToggle
                  defaultDirection="asc"
                  :sort="tableSort.column === 'details lastChanneledTimestamp' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'details lastChanneledTimestamp' : null; tableSort.direction = $event"
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
                <template v-if="landDetails[row.id]?.aaltar">
                  {{ landDetails[row.id].aaltar.label }}
                </template>
                <!--
                  {{ landDetails[row.id]?.equippedInstallations }}
                -->
              </td>
              <td>
                <template v-if="landDetails[row.id]">
                  <template v-if="landDetails[row.id].cooldownTimestamp < tickerTimestamp">
                    Now
                  </template>
                  <DateFriendly
                    v-else-if="landDetails[row.id].cooldownDate"
                    :date="landDetails[row.id].cooldownDate"
                    enableToggle
                  />
                </template>
              </td>
              <td v-if="parcelAccessRightsStatus.loaded">
                <template v-if="parcelAccessRightsStatus.loaded">
                  <template v-if="parcelAccessRights[0][row.id] === 0">
                    Owner
                  </template>
                  <template v-else-if="parcelAccessRights[0][row.id] === 1">
                    Borrower
                  </template>
                  <template v-else-if="parcelAccessRights[0][row.id] === 2">
                    Anyone
                  </template>
                </template>
              </td>
              <td>
                <template v-if="landDetails[row.id]?.aaltar">
                  {{ landDetails[row.id].aaltar.cooldownHours }}h
                </template>
              </td>
              <td>
                <template v-if="landDetails[row.id]">
                  <DateFriendly
                    v-if="landDetails[row.id].lastChanneledDate"
                    :date="landDetails[row.id].lastChanneledDate"
                    enableToggle
                  />
                  <template v-else-if="landDetails[row.id].lastChanneledTimestamp === 0">
                    Never used
                  </template>
                </template>
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
import useReactiveDate from '@/environment/useReactiveDate'
import useStatus from '@/data/useStatus'
import useParcelAccessRights from '@/data/useParcelAccessRights'
import CopyToClipboard from '@/common/CopyToClipboard.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import SiteTable from '@/site/SiteTable.vue'
import SortToggle from '@/common/SortToggle.vue'
import INSTALLATIONS from '@/data/parcels/installations.json'

// const LANDS_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
const LANDS_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
const GOTCHIVERSE_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
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

    const { status: ownedLandsStatus, setLoading: setOwnedLandsLoading } = useStatus()
    const { status: channelingStatus, setLoading: setChannelingStatusLoading } = useStatus()
    const ownedLands = ref(null)
    const landDetails = ref({})

    const {
      fetchParcelAccessRights,
      fetchStatus: parcelAccessRightsStatus,
      parcelAccessRights
    } = useParcelAccessRights()

    // Don't require the parcel access rights to have successfully fetched, as that's more error-prone
    const status = computed(() => ({
      loading: ownedLandsStatus.value.loading || channelingStatus.value.loading,
      error: ownedLandsStatus.value.error || channelingStatus.value.error,
      loaded: ownedLandsStatus.value.loaded && channelingStatus.value.loaded
    }))

    const fetchOwnedLands = function () {
      const [isStale, setLoaded, setError] = setOwnedLandsLoading()
      let lastIdNum = 0
      let parcels = []
      const fetchLandsFromSubgraph = function () {
        fetch(LANDS_SUBGRAPH_URL, {
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
              ownedLands.value = parcels.map(p => {
                return {
                  ...p,
                  // convert to number for sorting
                  district: p.district - 0,
                  size: p.size - 0,
                  sizeLabel: PARCEL_SIZE_LABELS[p.size]
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

    fetchOwnedLands()

    const fetchLandChannelingStatuses = function (landIds) {
      // console.log('fetchLandChannelingStatuses', landIds)
      landDetails.value = {}

      const [isStale, setLoaded, setError] = setChannelingStatusLoading()
      if (!landIds || !landIds.length) {
        setLoaded()
        return
      }

      const newDetails = {}
      let lastIndex = 0
      const fetchStatusesFromSubgraph = function () {
        const landIdsToFetch = landIds.slice(lastIndex, lastIndex + FETCH_PAGE_SIZE)
        lastIndex += landIdsToFetch.length
        fetch(GOTCHIVERSE_SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query: `{
              parcels (first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(landIdsToFetch)}}) {
                id
                equippedInstallations {
                  id
                }
                lastChanneledAlchemica
              }
            }`
          })
        }).then(async response => {
          if (isStale()) { console.log('Stale request, ignoring'); return }
          if (!response.ok) {
            setError('There was an error fetching land channeling statuses')
            return
          }
          const responseJson = await response.json()
          if (responseJson.data?.parcels) {
            for (const parcel of responseJson.data.parcels) {
              let lastChanneledTimestamp = parcel.lastChanneledAlchemica * 1000
              const equippedInstallations = parcel.equippedInstallations?.map(({ id }) => INSTALLATIONS[id])
              const aaltar = equippedInstallations.find(installation => installation?.installationType === 'aaltar')
              let cooldownTimestamp
              let cooldownDate
              if (aaltar) {
                if (lastChanneledTimestamp) {
                  cooldownTimestamp = lastChanneledTimestamp + (aaltar.cooldownHours * 60 * 60 * 1000)
                  cooldownDate = new Date(cooldownTimestamp)
                } else {
                  // there is an altar but it hasn't been channeled yet, so it's available
                  cooldownTimestamp = 0
                }
              } else {
                // Unexpected data: no aaltar, but has a lastChanneledTimestamp.
                // Clear it, as you can't channel without an aaltar anyway.
                // lastChanneledTimestamp = undefined // TODO: temporarily remove this as altars are missing
                lastChanneledTimestamp = lastChanneledTimestamp || undefined
              }
              newDetails[parcel.id] = {
                equippedInstallations,
                aaltar,
                lastChanneledTimestamp,
                lastChanneledDate: lastChanneledTimestamp && new Date(lastChanneledTimestamp),
                cooldownTimestamp,
                cooldownDate
              }
            }

            if (lastIndex >= landIds.length) {
              // finished fetching all pages
              landDetails.value = newDetails
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
          setError('There was an error fetching parcel details')
        })
      }

      fetchStatusesFromSubgraph()
    }

    watch(
      () => ownedLandsStatus.value.loaded,
      loaded => {
        if (loaded) {
          const landIds = ownedLands.value.map(land => land.id)
          fetchLandChannelingStatuses(landIds)
          fetchParcelAccessRights(landIds)
        }
      }
    )

    const tableFilters = ref({
      onlyCanChannelNow: false,
      channelingAccess: [true, true, true]
    })

    const tableSort = ref({
      column: 'details cooldownTimestamp',
      direction: 'asc'
    })

    const tablePaging = ref({
      page: 0,
      pageSize: 25
    })

    // This filters the retrieved data normally
    const tableLandsFilteredStable = computed(() => {
      const hasChannelingAccessFilter = tableFilters.value.channelingAccess.some(enabled => !enabled)
      if (!hasChannelingAccessFilter) {
        return ownedLands.value
      }
      return ownedLands.value.filter(land => {
        const parcelAccessRight = parcelAccessRights.value[0][land.id]
        return tableFilters.value.channelingAccess[parcelAccessRight]
      })
    })

    // We sort the stable filtered data
    const tableLandsSortedStable = computed(() => {
      const { column, direction } = tableSort.value
      if (!column) { return tableLandsFilteredStable.value }
      if (column.startsWith('details')) {
        const field = column.split(' ')[1]
        return orderBy(tableLandsFilteredStable.value, [row => landDetails.value[row.id]?.[field]], [direction])
      } else if (column.startsWith('aaltar')) {
        const field = column.split(' ')[1]
        return orderBy(tableLandsFilteredStable.value, [row => landDetails.value[row.id]?.aaltar?.[field]], [direction])
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
        const details = landDetails.value[land.id]
        if (onlyCanChannelNow &&
          !(
            details?.aaltar &&
            details.cooldownTimestamp < tickerTimestamp.value
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
        ownedLands: ownedLands.value,
        landDetails: landDetails.value
      }),
      () => { tablePaging.value.page = 0 }
    )

    const rowsToDisplay = computed(() => {
      const start = tablePaging.value.page * tablePaging.value.pageSize
      const end = start + tablePaging.value.pageSize
      return tableLandsFilteredUnstable.value.slice(start, end)
    })

    return {
      fetchOwnedLands,
      status,
      landDetails,
      numFilteredLands,
      tableFilters,
      tablePaging,
      tableSort,
      rowsToDisplay,
      tickerTimestamp,
      parcelAccessRightsStatus,
      parcelAccessRights
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

  .filter-channeling-access label {
    margin-right: 5px;
    white-space: nowrap;
  }
</style>
