<template>
  <div>
    <template v-if="status.loading">
      Loading, please wait...
    </template>
    <template v-if="status.error">
      Error fetching data
    </template>
    <template v-if="status.loaded">
      <div
        v-if="whitelistIds && whitelistIds.length > 1"
        style="margin-top: 30px;"
      >
        <label>
          Filter by whitelist:
          <select v-model="tableFilters.whitelistId">
            <option value=""></option>
            <option
              v-for="id in whitelistIds"
              :key="id"
              :value="id"
            >
              {{ id }}
            </option>
            <option value="public">
              public
            </option>
          </select>
        </label>
      </div>

      <div style="margin-top: 20px; font-size: 0.9em">
        <div
          v-if="balancesStatus.error"
          style="margin-bottom: 10px; font-weight: bold"
        >
          <SiteIcon name="warning-triangle" />
          There was an error fetching pocket balances.
        </div>
        <details>
          <summary>
            About this data
          </summary>
          The FUD, FOMO, ALPHA, KEK in the table shows what's visible on the blockchain: the total amount claimed plus any amount in the gotchi pocket (withdrawn).
          <br>We can't yet see alchemica that has been collected in-game but not withdrawn through a vortex, or withdrawals that are stuck in a queue and haven't been sent yet. So your scholars may be more active than this shows!
          <br>This data is gathered from several sources, so may not be totally up-to-date. Thanks to sudeep#3648 on discord for the claimed-alchemica subgraph!
          <br>
          <br>The 'Total' column is the same collected alchemica converted to a FUD-equivalent amount, as a single measure for comparison/sorting. This is done by using the intrinsic rarity of each alchemica type, <i>not</i> their market price: i.e. 1 FOMO = 2 FUD; 1 ALPHA = 4 FUD; 1 KEK = 10 FUD.
        </details>
      </div>

      <SiteButton
        type="button"
        style="margin-top: 20px"
        @click="fetchData"
      >
        Refresh data
      </SiteButton>

      <div
        v-if="numFilteredGotchis === 0"
        style="margin-top: 20px;"
      >
        No gotchis found.
      </div>
      <SiteTable
        v-else
        v-model:page="tablePaging.page"
        v-model:pageSize="tablePaging.pageSize"
        :numResults="numFilteredGotchis"
        :scrollingBreakpoint="1800"
      >
        <template #headers>
          <tr>
            <th>Gotchi</th>
            <th>Listed?</th>
            <th>Lended?</th>
            <th>Listing ID</th>
            <th>Listing Posted</th>
            <th>Lending Started</th>
            <th style="min-width: 120px">
              Lending Expires
              <SortToggle
                :sort="tableSort.column === 'finishTimestamp' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'finishTimestamp' : null; tableSort.direction = $event"
              />
            </th>
            <th>
              Last Claimed
              <SortToggle
                :sort="tableSort.column === 'lastClaimedTimestamp' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'lastClaimedTimestamp' : null; tableSort.direction = $event"
              />
            </th>
            <th
              v-for="type in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
              :key="type"
            >
              {{ type }}
              <SortToggle
                :sort="tableSort.column === `totalAlchemica ${type}` ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? `totalAlchemica ${type}` : null; tableSort.direction = $event"
              />
            </th>
            <th title="Calculated by rarity (not market price): 1 FOMO = 2 FUD; 1 ALPHA = 4 FUD; 1 KEK = 10 FUD">
              'Total' (FUD-equiv)
              <SortToggle
                :sort="tableSort.column === 'totalAlchemica NORMALIZED' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'totalAlchemica NORMALIZED' : null; tableSort.direction = $event"
              />
            </th>
            <th>Gotchi Pocket</th>
            <th>Lending Duration</th>
            <th>Upfront GHST</th>
            <th>Owner %</th>
            <th>Borrower %</th>
            <th>Third-Party %</th>
            <th>
              Whitelist ID
              <SortToggle
                :sort="tableSort.column === 'listing whitelistId' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing whitelistId' : null; tableSort.direction = $event"
              />
            </th>
            <th>
              Third-Party Address
              <SortToggle
                :sort="tableSort.column === 'listing thirdPartyAddress' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing thirdPartyAddress' : null; tableSort.direction = $event"
              />
            </th>
            <th v-if="!address">
              Owner
              <SortToggle
                :sort="tableSort.column === 'listing lender' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing lender' : null; tableSort.direction = $event"
              />
            </th>
            <th>
              Borrower
              <SortToggle
                :sort="tableSort.column === 'listing borrower' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing borrower' : null; tableSort.direction = $event"
              />
            </th>
          </tr>
        </template>
        <template #rows>
          <tr
            v-for="row in rowsToDisplay"
            :key="row.gotchi.id"
          >
            <td>
              <a
                :href="`https://app.aavegotchi.com/gotchi/${row.gotchi.id}`"
                rel="noopener"
                target="_blank"
              >
                {{ row.gotchi.name }}
                #{{ row.gotchi.id }}
              </a>
            </td>
            <td>
              <template v-if="row.isListed">
                Yes
              </template>
            </td>
            <td>
              <template v-if="row.isLended">
                Yes
              </template>
            </td>
            <td>
              <a
                v-if="row.listing"
                :href="`https://app.aavegotchi.com/lending/${row.listing.id}`"
                rel="noopener"
                target="_blank"
              >
                {{ row.listing.id }}
              </a>
            </td>
            <td>
              <DateFriendly
                v-if="row.createdDate"
                :date="row.createdDate"
              />
            </td>
            <td>
              <DateFriendly
                v-if="row.agreedDate"
                :date="row.agreedDate"
              />
            </td>
            <td>
              <DateFriendly
                v-if="row.finishDate"
                :date="row.finishDate"
                enableToggle
              />
            </td>
            <td>
              <DateFriendly
                v-if="row.lastClaimedDate"
                :date="row.lastClaimedDate"
              />
            </td>
            <td
              v-for="type in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
              :key="type"
            >
              <template v-if="row.isLended && row.totalAlchemica">
                <div
                  :class="{
                    'zero-value': row.totalAlchemica[type].isZero()
                  }"
                  :title="(!row.earnedAlchemica[type].isZero() || (row.escrowAlchemica[type] && !row.escrowAlchemica[type].isZero())) ? `Claimed: ${row.earnedAlchemica[type]}, Pocket: ${row.escrowAlchemica[type]}` : null"
                >
                  {{ row.totalAlchemica[type] }}
                </div>
              </template>
            </td>
            <td>
              <template v-if="row.isLended && row.totalAlchemica">
                <div
                  :class="{
                    'zero-value': row.totalAlchemica.NORMALIZED.isZero()
                  }"
                >
                  {{ row.totalAlchemica.NORMALIZED }}
                </div>
              </template>
            </td>
            <td>
              <EthAddress
                :address="row.gotchi.escrow"
                polygonscan="erc20"
                shortest
              />
            </td>
            <td>
              <template v-if="row.listing">
                {{ friendlyDuration(row.listing.period) }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ friendlyGhst(row.listing.upfrontCost) }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ row.listing.splitOwner }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ row.listing.splitBorrower }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ row.listing.splitOther }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ row.listing.whitelistId }}
              </template>
            </td>
            <td>
              <EthAddress
                v-if="row.listing && row.listing.thirdPartyAddress !== '0x0000000000000000000000000000000000000000'"
                :address="row.listing.thirdPartyAddress"
                icon
                polygonscan="erc20"
                shortest
              />
            </td>
            <td v-if="!address">
              <EthAddress
                v-if="row.listing"
                :address="row.listing.lender"
                icon
                polygonscan="erc20"
                shortest
              />
            </td>
            <td style="white-space: nowrap;">
              <router-link
                v-if="row.isLended"
                :to="{ name: 'lending-borrower', query: { address: row.listing.borrower } }"
                style="margin-right: 5px;"
              >
                view
              </router-link>
              <EthAddress
                v-if="row.isLended"
                :address="row.listing.borrower"
                icon
                polygonscan="erc20"
                shortest
              />
            </td>
          </tr>
        </template>
      </SiteTable>
    </template>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import orderBy from 'lodash.orderby'
import { ref, computed, watch } from 'vue'

import useStatus from '@/data/useStatus'
import useAddressBalances from '@/data/useAddressBalances'
import DateFriendly from '@/components/DateFriendly.vue'
import EthAddress from './EthAddress.vue'
import SiteTable from './SiteTable.vue'
import SortToggle from './SortToggle.vue'

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending'
const OWNER_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
const LENDING_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/sudeepb02/gotchi-lending'
const FETCH_PAGE_SIZE = 1000
const VAULT_ADDRESS = '0xdd564df884fd4e217c9ee6f65b4ba6e5641eac63'

export default {
  components: {
    EthAddress,
    DateFriendly,
    SiteTable,
    SortToggle
  },
  props: {
    address: { type: String, default: null },
    thirdPartyAddress: { type: String, default: null },
    vaultOwnerAddress: { type: String, default: null }
  },
  setup (props) {
    const addressLc = computed(() => props.address?.toLowerCase())
    const thirdPartyAddressLc = computed(() => props.thirdPartyAddress?.toLowerCase())
    const vaultOwnerAddressLc = computed(() => props.vaultOwnerAddress?.toLowerCase())

    const { status: ownedGotchisStatus, setLoading: setOwnedGotchisLoading } = useStatus()
    const ownedGotchis = ref(null)

    const { status: listingsStatus, setLoading: setListingsLoading } = useStatus()
    const listedGotchis = ref(null)

    const { status: earningsStatus, setLoading: setEarningsLoading } = useStatus()
    const earnings = ref({})

    const {
      setAddresses: setBalancesAddresses,
      balances,
      fetchStatus: balancesStatus,
      fetchBalances
    } = useAddressBalances({ tokenLabels: ['FUD', 'FOMO', 'ALPHA', 'KEK'] })

    const status = computed(() => ({
      loading: ownedGotchisStatus.value.loading || listingsStatus.value.loading || earningsStatus.value.loading || balancesStatus.value.loading,
      error: ownedGotchisStatus.value.error || listingsStatus.value.error || earningsStatus.value.error,
      loaded: ownedGotchisStatus.value.loaded && listingsStatus.value.loaded && earningsStatus.value.loaded &&
        (balancesStatus.value.loaded || balancesStatus.value.error) // allow balances fetch to fail
    }))

    const tableSort = ref({
      column: 'finishTimestamp',
      direction: 'asc'
    })

    const tablePaging = ref({
      page: 0,
      pageSize: 25
    })

    const fetchOwnedGotchis = function () {
      const [isStale, setLoaded, setError] = setOwnedGotchisLoading()

      if (!props.address) {
        // Don't need to fetch owned gotchis if we're searching by the third party address
        ownedGotchis.value = []
        setLoaded()
        return
      }

      // TODO currently gotchis borrowed by the 'manager' address are included on this page.
      // When the subgraphs are merged, check to see if there's a simple way
      // to query for gotchis that are truly owned by an address (not borrowed by them)
      fetch(OWNER_SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            user(id: "${addressLc.value}") {
              gotchisOwned {
                id
                name
                escrow
                status
              }
            }
          }`
        })
      })
        .then(async response => {
          if (isStale()) { console.log('Stale request, ignoring'); return }
          if (!response.ok) {
            setError('There was an error fetching non-lended gotchis')
            return
          }
          const responseJson = await response.json()
          // console.log({ responseJson })
          if (responseJson.data?.user?.gotchisOwned) {
            ownedGotchis.value = responseJson.data.user.gotchisOwned
              .filter(({ status }) => status === '3') // only summoned and live gotchis
              .map(item => ({ gotchi: item }))
            // console.log('ownedGotchis', ownedGotchis.value)
            setLoaded()
          } else {
            console.error('Unexpected response', responseJson)
            setError('Unexpected response')
          }
        })
        .catch(error => {
          console.error(error)
          setError('There was an error fetching non-lended gotchis')
        })
    }

    const fetchListings = function () {
      const [isStale, setLoaded, setError] = setListingsLoading()
      let lastIdNum = 0
      let fetchedListings = []

      const lenderQuery = props.address && !props.vaultOwnerAddress ? `, lender: "${addressLc.value}"` : ''
      const thirdPartyQuery = props.thirdPartyAddress ? `, thirdPartyAddress: "${thirdPartyAddressLc.value}"` : ''
      const vaultOwnerQuery = props.vaultOwnerAddress ? `, originalOwner: "${vaultOwnerAddressLc.value}", lender: "${VAULT_ADDRESS}"` : ''

      const fetchFromSubgraph = function () {
        const query = `{
          gotchiLendings(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: {
            id_gt: ${lastIdNum},
            cancelled: false,
            completed: false
            ${lenderQuery}
            ${thirdPartyQuery}
            ${vaultOwnerQuery}
          }) {
            id
            gotchi {
              id
              name
              escrow
            }
            originalOwner

            lender
            upfrontCost
            period
            splitOwner
            splitBorrower
            splitOther

            thirdPartyAddress
            whitelistId

            timeCreated
            timeAgreed
            borrower
            lastClaimed
          }
        }`

        fetch(SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query
          })
        })
          .then(async response => {
            if (isStale()) { console.log('Stale request, ignoring'); return }
            if (!response.ok) {
              setError('There was an error fetching gotchi lendings')
              return
            }
            const responseJson = await response.json()
            // console.log({ responseJson })
            if (responseJson.data?.gotchiLendings) {
              fetchedListings = fetchedListings.concat(responseJson.data.gotchiLendings)
              if (responseJson.data.gotchiLendings.length < FETCH_PAGE_SIZE) {
                // finished fetching all pages
                listedGotchis.value = fetchedListings.map(item => {
                  const { gotchi, ...listing } = item
                  return { gotchi, listing }
                })
                // console.log('listedGotchis', listedGotchis.value)
                setLoaded()
                return
              }
              // fetch the next page of results
              lastIdNum = responseJson.data.gotchiLendings[responseJson.data.gotchiLendings.length - 1].id - 0
              fetchFromSubgraph()
            } else {
              console.error('Unexpected response', responseJson)
              setError('Unexpected response')
            }
          })
          .catch(error => {
            console.error(error)
            setError('There was an error fetching gotchi lendings')
          })
      }

      fetchFromSubgraph()
    }

    const fetchEarnings = function () {
      const [isStale, setLoaded, setError] = setEarningsLoading()
      let fetchedLendings = []
      const lendingIds = listedGotchis.value.map(({ listing }) => listing.id)
      let nextIndex = 0

      const fetchFromSubgraph = function () {
        const idsToFetch = lendingIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
        const query = `{
          gotchiLendings(first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(idsToFetch)} }) {
            id
            claimedFUD
            claimedFOMO
            claimedALPHA
            claimedKEK
          }
        }`

        fetch(LENDING_SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query
          })
        })
          .then(async response => {
            if (isStale()) { console.log('Stale request, ignoring'); return }
            if (!response.ok) {
              setError('There was an error fetching earnings')
              return
            }
            const responseJson = await response.json()
            // console.log({ responseJson })
            if (responseJson.data?.gotchiLendings) {
              fetchedLendings = fetchedLendings.concat(responseJson.data.gotchiLendings)
              if (responseJson.data.gotchiLendings.length < FETCH_PAGE_SIZE) {
                // finished fetching all pages
                earnings.value = Object.fromEntries(
                  fetchedLendings.map(item => {
                    const { id, ...earnings } = item
                    return [id, earnings]
                  })
                )
                // console.log('earnings', earnings.value)
                setLoaded()
                return
              }
              // fetch the next page of results
              nextIndex += FETCH_PAGE_SIZE
              fetchFromSubgraph()
            } else {
              console.error('Unexpected response', responseJson)
              setError('Unexpected response')
            }
          })
          .catch(error => {
            console.error(error)
            setError('There was an error fetching earnings')
          })
      }

      fetchFromSubgraph()
    }

    watch(
      () => listingsStatus.value.loaded,
      () => {
        if (listingsStatus.value.loaded) {
          fetchEarnings()
        }
      }
    )

    const lendedGotchis = computed(() => {
      if (!listingsStatus.value.loaded) { return null }
      return listedGotchis.value.filter(item => item.listing.timeAgreed !== '0')
    })

    // We only need to fetch pocket balances for lended gotchis
    watch(
      () => lendedGotchis.value,
      () => {
        if (lendedGotchis.value) {
          const escrowAddresses = lendedGotchis.value.map(item => item.gotchi.escrow)
          // console.log('Set escrowAddresses and fetch balances', escrowAddresses)
          setBalancesAddresses(escrowAddresses)
          fetchBalances()
        }
      }
    )

    const fetchData = function () {
      fetchOwnedGotchis()
      fetchListings()
    }

    fetchData()

    const tableGotchis = computed(() => {
      if (!status.value.loaded) { return [] }
      const listedGotchiIds = listedGotchis.value.map(item => item.gotchi.id)
      const ownedUnlistedGotchis = ownedGotchis.value.filter(item => !listedGotchiIds.includes(item.gotchi.id))
      const allGotchis = ownedUnlistedGotchis.concat(listedGotchis.value)
      const rows = allGotchis.map(item => {
        const isListed = item.listing && item.listing.timeAgreed === '0'
        const isLended = item.listing && item.listing.timeAgreed !== '0'
        const createdDate = item.listing ? new Date(item.listing.timeCreated * 1000) : null
        const agreedDate = isLended ? new Date(item.listing.timeAgreed * 1000) : null
        const finishDate = isLended ? new Date(((item.listing.timeAgreed - 0) + (item.listing.period - 0)) * 1000) : null
        const finishTimestamp = isLended
          ? ((item.listing.timeAgreed - 0) + (item.listing.period - 0)) * 1000
          // if not lended, make up a 'far future' timestamp to help with sorting listed and unlisted gotchis
          : (isListed ? Number.MAX_SAFE_INTEGER - 1 : Number.MAX_SAFE_INTEGER)
        const lastClaimedDate = item.listing && item.listing.lastClaimed !== '0' ? new Date(item.listing.lastClaimed * 1000) : null
        const lastClaimedTimestamp = isLended
          ? item.listing.lastClaimed * 1000
          // if not lended, make up a 'far past' timestamp to help with sorting listed and unlisted gotchis
          : (isListed ? Number.MIN_SAFE_INTEGER + 1 : Number.MIN_SAFE_INTEGER)
        const earningsForListing = item.listing ? earnings.value[item.listing.id] : null
        const balancesForGotchi = balances.value[item.gotchi.escrow]
        const totalAlchemica = {}
        const earnedAlchemica = {}
        const escrowAlchemica = {}
        for (const token of ['FUD', 'FOMO', 'ALPHA', 'KEK']) {
          let total = new BigNumber(0)
          if (earningsForListing) {
            const earned = new BigNumber(earningsForListing[`claimed${token}`] || 0).div(10e17)
            earnedAlchemica[token] = earned
            total = total.plus(earned)
          }
          if (balancesForGotchi) {
            const balance = balancesForGotchi[token] || 0
            escrowAlchemica[token] = balance
            total = total.plus(balance)
          }
          totalAlchemica[token] = total
        }
        totalAlchemica.NORMALIZED = totalAlchemica.FUD
          .plus(totalAlchemica.FOMO.times(2))
          .plus(totalAlchemica.ALPHA.times(4))
          .plus(totalAlchemica.KEK.times(10))

        return {
          gotchi: item.gotchi,
          listing: item.listing,
          totalAlchemica,
          earnedAlchemica,
          escrowAlchemica,
          isListed,
          isLended,
          agreedDate,
          createdDate,
          finishDate,
          finishTimestamp,
          lastClaimedDate,
          lastClaimedTimestamp
        }
      })

      return orderBy(rows, ['finishTimestamp'], ['asc'])
    })

    const tableFilters = ref({
      whitelistId: ''
    })

    const whitelistIds = computed(() => {
      const ids = {}
      for (const row of tableGotchis.value) {
        if (row.listing?.whitelistId) {
          ids[row.listing.whitelistId] = true
        }
      }
      return Object.keys(ids)
    })

    watch(
      () => whitelistIds.value,
      () => {
        if (!status.value.loaded) { return }
        if (tableFilters.value.whitelistId && !whitelistIds.value.includes(tableFilters.value.whitelistId)) {
          tableFilters.value.whitelistId = ''
        }
      }
    )

    const tableGotchisFiltered = computed(() => {
      let result = tableGotchis.value
      if (tableFilters.value.whitelistId) {
        const whitelistId = tableFilters.value.whitelistId
        if (tableFilters.value.whitelistId === 'public') {
          result = result.filter(row => row.listing && !row.listing.whitelistId)
        } else {
          result = result.filter(row => row.listing && row.listing.whitelistId === whitelistId)
        }
      }
      return result
    })

    const numFilteredGotchis = computed(() => tableGotchisFiltered.value?.length)

    const tableGotchisSorted = computed(() => {
      const { column, direction } = tableSort.value
      if (!column) { return tableGotchisFiltered.value }
      if (column.startsWith('totalAlchemica')) {
        const type = column.split(' ')[1]
        return orderBy(tableGotchisFiltered.value, [row => row.totalAlchemica[type]?.toNumber() || 0], [direction])
      } else if (column.startsWith('listing')) {
        const property = column.split(' ')[1]
        return orderBy(tableGotchisFiltered.value, [row => row.listing?.[property]], [direction])
      }
      return orderBy(tableGotchisFiltered.value, [column], [direction])
    })

    watch(
      () => ({
        sortColumn: tableSort.value.column,
        sortDirection: tableSort.value.direction,
        pageSize: tablePaging.value.pageSize,
        tableGotchisFiltered: tableGotchisFiltered.value
      }),
      () => { tablePaging.value.page = 0 }
    )

    const rowsToDisplay = computed(() => {
      const start = tablePaging.value.page * tablePaging.value.pageSize
      const end = start + tablePaging.value.pageSize
      return tableGotchisSorted.value.slice(start, end)
    })

    const friendlyDuration = function (periodString) {
      const hours = (periodString - 0) / (60 * 60)
      return `${hours} hr${hours !== 1 ? 's' : ''}`
    }

    const friendlyGhst = function (upfrontCost) {
      const cost = new BigNumber(upfrontCost).div(10e17)
      return cost.toString()
    }

    return {
      status,
      balancesStatus,
      ownedGotchis,
      numFilteredGotchis,
      tableSort,
      tablePaging,
      tableFilters,
      whitelistIds,
      rowsToDisplay,
      friendlyDuration,
      friendlyGhst,
      fetchData
    }
  }
}
</script>

<style scoped>
  .zero-value {
    opacity: 0.5;
  }
</style>
