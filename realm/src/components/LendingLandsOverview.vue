<template>
  <div>
    <template v-if="status.loading">
      Loading, please wait...
    </template>
    <template v-if="status.error">
      Error fetching data
    </template>
    <div v-if="status.loaded">
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
                  defaultDirection="asc"
                  :sort="tableSort.column === 'aaltar level' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'aaltar level' : null; tableSort.direction = $event"
                />
              </th>
              <th v-if="parcelAccessRightsStatus.loaded">
                Channeling Access
              </th>
              <th>Cooldown</th>
              <th style="min-width: 100px;">
                Aaltar ready
                <SortToggle
                  defaultDirection="asc"
                  :sort="tableSort.column === 'details cooldownTimestamp' ? tableSort.direction : null"
                  @update:sort="tableSort.column = $event ? 'details cooldownTimestamp' : null; tableSort.direction = $event"
                />
              </th>
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
                <a
                  :href="`https://gotchiverse.io/auction?tokenId=${row.id}`"
                  rel="noopener"
                  target="_blank"
                >
                  #{{ row.id }}
                </a>
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
              <td v-if="parcelAccessRightsStatus.loaded">
                <template v-if="parcelAccessRightsStatus.loaded">
                  <template v-if="parcelAccessRights[0][row.id] === 0">
                    Owner
                  </template>
                  <template v-else-if="parcelAccessRights[0][row.id] === 1">
                    Borrower
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
import useReactiveDate from '@/data/useReactiveDate'
import useStatus from '@/data/useStatus'
import useParcelAccessRights from '@/data/useParcelAccessRights'
import CopyToClipboard from './CopyToClipboard.vue'
import DateFriendly from './DateFriendly.vue'
import SiteTable from './SiteTable.vue'
import SortToggle from './SortToggle.vue'
const LANDS_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-realm-matic'
const GOTCHIVERSE_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchiverse-matic'
const FETCH_PAGE_SIZE = 1000

const PARCEL_SIZE_LABELS = {
  '0': 'humble',
  '1': 'reasonable',
  '2': 'spacious',
  '3': 'spacious'
}
const AALTARS = {
  '1': { level: 1, label: 'LE Golden Aaltar L1', cooldownHours: 24 },
  '2': { level: 2, label: 'LE Golden Aaltar L2', cooldownHours: 18 },
  '3': { level: 3, label: 'LE Golden Aaltar L3', cooldownHours: 12 },
  '4': { level: 4, label: 'LE Golden Aaltar L4', cooldownHours: 8 },
  '5': { level: 5, label: 'LE Golden Aaltar L5', cooldownHours: 6 },
  '6': { level: 6, label: 'LE Golden Aaltar L6', cooldownHours: 4 },
  '7': { level: 7, label: 'LE Golden Aaltar L7', cooldownHours: 3 },
  '8': { level: 8, label: 'LE Golden Aaltar L8', cooldownHours: 2 },
  '9': { level: 9, label: 'LE Golden Aaltar L9', cooldownHours: 1 },
  '10': { level: 1, label: 'Aaltar L1', cooldownHours: 24 },
  '11': { level: 2, label: 'Aaltar L2', cooldownHours: 18 },
  '12': { level: 3, label: 'Aaltar L3', cooldownHours: 12 },
  '13': { level: 4, label: 'Aaltar L4', cooldownHours: 8 },
  '14': { level: 5, label: 'Aaltar L5', cooldownHours: 6 },
  '15': { level: 6, label: 'Aaltar L6', cooldownHours: 4 },
  '16': { level: 7, label: 'Aaltar L7', cooldownHours: 3 },
  '17': { level: 8, label: 'Aaltar L8', cooldownHours: 2 },
  '18': { level: 9, label: 'Aaltar L9', cooldownHours: 1 }
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
                equippedInstallations
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
              const aaltarId = parcel.equippedInstallations?.find(installationId => AALTARS[installationId]) || undefined
              const aaltar = AALTARS[aaltarId] || undefined
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
                lastChanneledTimestamp = undefined
              }
              newDetails[parcel.id] = {
                equippedInstallations: parcel.equippedInstallations,
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

    const tableSort = ref({
      column: 'details cooldownTimestamp',
      direction: 'asc'
    })

    const tablePaging = ref({
      page: 0,
      pageSize: 25
    })

    const numFilteredLands = computed(() => ownedLands.value?.length)

    const tableLandsSorted = computed(() => {
      const { column, direction } = tableSort.value
      if (!column) { return ownedLands.value }
      if (column.startsWith('details')) {
        const field = column.split(' ')[1]
        return orderBy(ownedLands.value, [row => landDetails.value[row.id]?.[field]], [direction])
      } else if (column.startsWith('aaltar')) {
        const field = column.split(' ')[1]
        return orderBy(ownedLands.value, [row => landDetails.value[row.id]?.aaltar?.[field]], [direction])
      }
      return orderBy(ownedLands.value, [column], [direction])
    })

    watch(
      () => ({
        sortColumn: tableSort.value.column,
        sortDirection: tableSort.value.direction,
        pageSize: tablePaging.value.pageSize,
        ownedLands: ownedLands.value,
        landDetails: landDetails.value
      }),
      () => { tablePaging.value.page = 0 }
    )

    const rowsToDisplay = computed(() => {
      const start = tablePaging.value.page * tablePaging.value.pageSize
      const end = start + tablePaging.value.pageSize
      return tableLandsSorted.value.slice(start, end)
    })

    return {
      fetchOwnedLands,
      status,
      landDetails,
      numFilteredLands,
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
</style>
