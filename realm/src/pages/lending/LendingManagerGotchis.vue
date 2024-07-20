<template>
  <div>
    <template v-if="status.loading">
      Loading, please wait...
    </template>
    <template v-if="status.error">
      Error fetching data
    </template>
    <template v-if="status.loaded">
      <fieldset
        class="table-filters"
        style="margin-bottom: 30px;"
      >
        <legend>
          Filters
        </legend>
        <div>
          Lending:
          <label>
            <input
              v-model="tableFilters.isListed"
              type="checkbox"
            />
            Listed
          </label>
          <label style="margin-left: 7px;">
            <input
              v-model="tableFilters.isLended"
              type="checkbox"
            />
            Lended
          </label>
          <label style="margin-left: 7px;">
            <input
              v-model="tableFilters.notListedOrLended"
              type="checkbox"
            />
            Taking a break
          </label>
        </div>
        <div
          v-if="whitelistIds && whitelistIds.length"
          style="margin-top: 15px;"
        >
          <label>
            Lending whitelist:
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
        <div
          v-if="fetchChannelingStatus.loaded"
          style="margin-top: 15px;"
        >
          Channeling:
          <label>
            <input
              v-model="tableFilters.canChannel"
              type="checkbox"
            />
            Can channel now
          </label>
          <label style="margin-left: 7px;">
            <input
              v-model="tableFilters.alreadyChanneled"
              type="checkbox"
            />
            Already channeled
          </label>
        </div>
      </fieldset>

      <div
        v-if="numFilteredGotchis > 0"
        style="margin-top: 20px; font-size: 0.9em"
      >
        <div
          v-if="balancesStatus.error"
          style="margin-bottom: 10px; font-weight: bold"
        >
          <SiteIcon name="warning-triangle" />
          There was an error fetching pocket balances.
        </div>
        <details style="max-width: max-content;">
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

      <div style="margin-top: 20px;">
        <div class="site-alertbox site-alertbox--warning">
          <SiteIcon name="warning-triangle" />
          <div>
            <div>
              <b>Collected Alchemica data is incomplete for lendings from April 2022 onwards.</b>
            </div>
            <details style="margin-top: 10px;">
              <summary>
                View details
              </summary>
              <div style="margin-top: 5px;">
                There are two situations which we can't see:
                <ul>
                  <li>
                    Borrower does <b>not</b> use the vortex, and receives alchemica at the end of the lending.
                  </li>
                  <li>
                    Borrower uses the vortex, but the withdrawal is delayed for more than 5 minutes. Pixelcraft sends the alchemica directly to the borrower's wallet, not the gotchi pocket. This is particularly likely to happen at the end of a Saturday spillover event, or when polygon gas is high.
                  </li>
                </ul>
              </div>
              <div>
                Hopefully there will be a more accurate data source available in future.
              </div>
            </details>
          </div>
        </div>
      </div>

      <div
        v-if="numFilteredGotchis > 0"
        style="margin-top: 20px"
      >
        <LendingLastChanneledFetchStatus
          :fetchStatus="fetchChannelingStatus"
          :lastFetchDate="lastFetchChannelingStatusDate"
        />
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
        :scrollingBreakpoint="2090"
        :class="{
          'table-includes-listed': tableFilters.isListed,
          'table-includes-lended': tableFilters.isLended
        }"
      >
        <template #headers>
          <tr>
            <th>Gotchi</th>
            <th class="col-about--listed">Listed?</th>
            <th class="col-about--lended">Lended?</th>
            <th class="col-about--listed col-about--lended">Listing ID</th>
            <th class="col-about--listed col-about--lended">Listing Posted</th>
            <th class="col-about--listed col-about--lended">Borrower Can Channel</th>
            <th class="col-about--lended">Lending Started</th>
            <th
              class="col-about--lended"
              style="min-width: 120px"
            >
              Lending Expires
              <SortToggle
                :sort="tableSort.column === 'finishTimestamp' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'finishTimestamp' : null; tableSort.direction = $event"
              />
            </th>
            <th class="col-about--lended">
              Last Claimed
              <SortToggle
                :sort="tableSort.column === 'lastClaimedTimestamp' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'lastClaimedTimestamp' : null; tableSort.direction = $event"
              />
            </th>
            <th
              v-for="type in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
              :key="type"
              class="col-about--lended"
            >
              {{ type }}
              <SortToggle
                :sort="tableSort.column === `totalAlchemica ${type}` ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? `totalAlchemica ${type}` : null; tableSort.direction = $event"
              />
            </th>
            <th
              title="Calculated by rarity (not market price): 1 FOMO = 2 FUD; 1 ALPHA = 4 FUD; 1 KEK = 10 FUD"
              class="col-about--lended"
            >
              'Total' (FUD-equiv)
              <SortToggle
                :sort="tableSort.column === 'totalAlchemica NORMALIZED' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'totalAlchemica NORMALIZED' : null; tableSort.direction = $event"
              />
            </th>
            <th
              class="col-about--lended"
              style="min-width: 90px;"
            >
              FUD-equiv Per Hour
              <SortToggle
                :sort="tableSort.column === 'totalAlchemica NORMALIZED_PER_HOUR' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'totalAlchemica NORMALIZED_PER_HOUR' : null; tableSort.direction = $event"
              />
            </th>
            <th>Gotchi Pocket</th>
            <th>
              Kinship
              <SortToggle
                :sort="tableSort.column === 'gotchi kinship' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'gotchi kinship' : null; tableSort.direction = $event"
              />
            </th>
            <th>
              Last Channeled
              <SortToggle
                :sort="tableSort.column === 'lastChanneled' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'lastChanneled' : null; tableSort.direction = $event"
              />
            </th>
            <th class="col-about--listed col-about--lended">
              Lending Duration
              <SortToggle
                :sort="tableSort.column === 'listing period' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing period' : null; tableSort.direction = $event"
              />
            </th>
            <th class="col-about--listed col-about--lended">
              Upfront GHST
              <SortToggle
                :sort="tableSort.column === 'listing upfrontCostSortable' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing upfrontCostSortable' : null; tableSort.direction = $event"
              />
            </th>
            <th class="col-about--listed col-about--lended">
              Owner %
              <SortToggle
                :sort="tableSort.column === 'listing splitOwner' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing splitOwner' : null; tableSort.direction = $event"
              />
            </th>
            <th class="col-about--listed col-about--lended">
              Borrower %
              <SortToggle
                :sort="tableSort.column === 'listing splitBorrower' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing splitBorrower' : null; tableSort.direction = $event"
              />
            </th>
            <th class="col-about--listed col-about--lended">
              Third-Party %
              <SortToggle
                :sort="tableSort.column === 'listing splitOther' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing splitOther' : null; tableSort.direction = $event"
              />
            </th>
            <th class="col-about--listed col-about--lended">
              Whitelist ID
              <SortToggle
                :sort="tableSort.column === 'listing whitelistId' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'listing whitelistId' : null; tableSort.direction = $event"
              />
            </th>
            <th class="col-about--listed col-about--lended">
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
            <th v-if="!originalOwnerAddress">
              Original Owner
            </th>
            <th class="col-about--lended">
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
            <td class="col-about--listed">
              <template v-if="row.isListed">
                Yes
              </template>
            </td>
            <td class="col-about--lended">
              <template v-if="row.isLended">
                Yes
              </template>
            </td>
            <td class="col-about--listed col-about--lended">
              <a
                v-if="row.listing"
                :href="`https://app.aavegotchi.com/lending/${row.listing.id}`"
                rel="noopener"
                target="_blank"
              >
                {{ row.listing.id }}
              </a>
            </td>
            <td class="col-about--listed col-about--lended">
              <DateFriendly
                v-if="row.createdDate"
                :date="row.createdDate"
              />
            </td>
            <td class="col-about--listed col-about--lended">
              <template v-if="row.listing">
                {{ row.listing.channellingAllowed  ? 'Yes' : 'No' }}
              </template>
            </td>
            <td class="col-about--lended">
              <DateFriendly
                v-if="row.agreedDate"
                :date="row.agreedDate"
              />
            </td>
            <td class="col-about--lended">
              <DateFriendly
                v-if="row.finishDate"
                :date="row.finishDate"
                enableToggle
              />
            </td>
            <td class="col-about--lended">
              <DateFriendly
                v-if="row.lastClaimedDate"
                :date="row.lastClaimedDate"
              />
            </td>
            <td
              v-for="type in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
              :key="type"
              class="col-about--lended"
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
            <td class="col-about--lended">
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
            <td class="col-about--lended">
              <template v-if="row.isLended && row.totalAlchemica">
                <div
                  :class="{
                    'zero-value': row.totalAlchemica.NORMALIZED_PER_HOUR.isZero()
                  }"
                >
                  {{ row.totalAlchemica.NORMALIZED_PER_HOUR.decimalPlaces(1) }}
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
              {{ row.gotchi.kinship }}
            </td>
            <LendingLastChanneledCell
              :gotchiId="row.gotchi.id"
              :fetchStatus="fetchChannelingStatus"
              :gotchiChannelingStatuses="gotchiChannelingStatuses"
              enableCellHighlight
            />
            <td class="col-about--listed col-about--lended">
              <template v-if="row.listing">
                {{ friendlyDuration(row.listing.period) }}
              </template>
            </td>
            <td class="col-about--listed col-about--lended">
              <template v-if="row.listing">
                {{ friendlyGhst(row.listing.upfrontCost) }}
              </template>
            </td>
            <td class="col-about--listed col-about--lended">
              <template v-if="row.listing">
                {{ row.listing.splitOwner }}
              </template>
            </td>
            <td class="col-about--listed col-about--lended">
              <template v-if="row.listing">
                {{ row.listing.splitBorrower }}
              </template>
            </td>
            <td class="col-about--listed col-about--lended">
              <template v-if="row.listing">
                {{ row.listing.splitOther }}
              </template>
            </td>
            <td class="col-about--listed col-about--lended">
              <template v-if="row.listing">
                {{ row.listing.whitelistId }}
              </template>
            </td>
            <td class="col-about--listed col-about--lended">
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
            <td v-if="!originalOwnerAddress">
              <EthAddress
                v-if="row.listing"
                :address="row.listing.originalOwner"
                icon
                polygonscan="erc20"
                shortest
              />
            </td>
            <td
              class="col-about--lended"
              style="white-space: nowrap;"
            >
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

import apis from '@/data/apis'
import useStatus from '@/data/useStatus'
import useGotchiChanneling from '@/data/useGotchiChanneling'
// import useAddressBalances from '@/data/useAddressAlchemicaBalances'
import useAddressBalances from '@/data/useAddressBalances'
import DateFriendly from '@/common/DateFriendly.vue'
import EthAddress from '@/common/EthAddress.vue'
import SiteTable from '@/site/SiteTable.vue'
import SortToggle from '@/common/SortToggle.vue'
import LendingLastChanneledFetchStatus from './LendingLastChanneledFetchStatus.vue'
import LendingLastChanneledCell from './LendingLastChanneledCell.vue'

const SUBGRAPH_URL = apis.CORE_MATIC_SUBGRAPH
const OWNER_SUBGRAPH_URL = apis.CORE_MATIC_SUBGRAPH
const LENDING_SUBGRAPH_URL = apis.LENDING_SUBGRAPH
const FETCH_PAGE_SIZE = 1000

export default {
  components: {
    EthAddress,
    DateFriendly,
    SiteTable,
    SortToggle,
    LendingLastChanneledFetchStatus,
    LendingLastChanneledCell
  },
  props: {
    address: { type: String, default: null },
    thirdPartyAddress: { type: String, default: null },
    originalOwnerAddress: { type: String, default: null }
  },
  setup (props) {
    const addressLc = computed(() => props.address?.toLowerCase())
    const thirdPartyAddressLc = computed(() => props.thirdPartyAddress?.toLowerCase())
    const originalOwnerAddressLc = computed(() => props.originalOwnerAddress?.toLowerCase())

    const {
      fetchGotchiChannelingStatuses,
      gotchiChannelingStatuses,
      fetchStatus: fetchChannelingStatus,
      lastFetchDate: lastFetchChannelingStatusDate
    } = useGotchiChanneling()

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

      // gotchisOwned returns both owned and borrowed gotchis
      // gotchisBorrowed is an array of gotchi IDs
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
                kinship
              }
              gotchisBorrowed
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
            const borrowedGotchiIds = responseJson.data.user.gotchisBorrowed || []
            ownedGotchis.value = responseJson.data.user.gotchisOwned.filter(gotchi => !borrowedGotchiIds.includes(gotchi.id))
              .filter(({ status }) => status === '3') // only summoned and live gotchis
              .map(item => ({
                gotchi: {
                  ...item,
                  kinship: item.kinship - 0 // make kinship a number so we can sort it
                }
              }))
            // console.log('ownedGotchis', ownedGotchis.value)
            setLoaded()
          } else if (responseJson.data?.user === null) {
            ownedGotchis.value = []
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

      const lenderQuery = props.address ? `, lender: "${addressLc.value}"` : ''
      const thirdPartyQuery = props.thirdPartyAddress ? `, thirdPartyAddress: "${thirdPartyAddressLc.value}"` : ''
      const originalOwnerQuery = props.originalOwnerAddress ? `, originalOwner: "${originalOwnerAddressLc.value}"` : ''

      const fetchFromSubgraph = function () {
        const query = `{
          gotchiLendings(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: {
            id_gt: ${lastIdNum},
            cancelled: false,
            completed: false
            ${lenderQuery}
            ${thirdPartyQuery}
            ${originalOwnerQuery}
          }) {
            id
            gotchi {
              id
              name
              escrow
              kinship
            }
            originalOwner

            lender
            upfrontCost
            period
            splitOwner
            splitBorrower
            splitOther
            channellingAllowed

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
                  return {
                    gotchi: {
                      ...gotchi,
                      kinship: gotchi.kinship - 0 // make kinship a number so we can sort it
                    },
                    listing: {
                      ...listing,
                      // make sortable
                      upfrontCostSortable: listing.upfrontCost - 0, // leave the original as a string for precision
                      period: listing.period - 0,
                      splitOwner: listing.splitOwner - 0,
                      splitBorrower: listing.splitBorrower - 0,
                      splitOther: listing.splitOther - 0
                    }
                  }
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
      return listedGotchis.value.filter(item => item.listing.timeAgreed > 0)
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

    watch(
      () => status.value.loaded,
      loaded => {
        if (loaded) {
          const gotchiIds = ownedGotchis.value.map(item => item.gotchi.id).concat(listedGotchis.value.map(item => item.gotchi.id))
          fetchGotchiChannelingStatuses(gotchiIds)
        }
      }
    )

    const fetchTimestamp = ref(0)

    const fetchData = function () {
      fetchTimestamp.value = Date.now()
      fetchOwnedGotchis()
      fetchListings()
    }

    fetchData()

    const tableGotchis = computed(() => {
      if (!status.value.loaded) { return [] }
      const listedGotchiIds = listedGotchis.value.map(item => item.gotchi.id)
      const ownedUnlistedGotchis = ownedGotchis.value.filter(item => !listedGotchiIds.includes(item.gotchi.id))
      const allGotchis = ownedUnlistedGotchis.concat(listedGotchis.value)
      const fetchTimestampSeconds = fetchTimestamp.value / 1000
      const rows = allGotchis.map(item => {
        const isListed = item.listing && (item.listing.timeAgreed === '0' || item.listing.timeAgreed === null)
        const isLended = item.listing && item.listing.timeAgreed > 0
        const createdDate = item.listing ? new Date(item.listing.timeCreated * 1000) : null
        const agreedDate = isLended ? new Date(item.listing.timeAgreed * 1000) : null
        const finishDate = isLended ? new Date(((item.listing.timeAgreed - 0) + (item.listing.period - 0)) * 1000) : null
        const finishTimestamp = isLended
          ? ((item.listing.timeAgreed - 0) + (item.listing.period - 0)) * 1000
          // if not lended, make up a 'far future' timestamp to help with sorting listed and unlisted gotchis
          : (isListed ? Number.MAX_SAFE_INTEGER - 1 : Number.MAX_SAFE_INTEGER)
        const actualPeriod = isLended ? fetchTimestampSeconds - (item.listing.timeAgreed - 0) : 0
        const lastClaimedDate = item.listing && (item.listing.lastClaimed - 0) ? new Date(item.listing.lastClaimed * 1000) : null
        const lastClaimedTimestamp = isLended
          ? item.listing.lastClaimed * 1000
          // if not lended, make up a 'far past' timestamp to help with sorting listed and unlisted gotchis
          : (isListed ? Number.MIN_SAFE_INTEGER + 1 : Number.MIN_SAFE_INTEGER)
        const earningsForListing = item.listing ? earnings.value[item.listing.id] : null
        const balancesForGotchi = balances.value[item.gotchi.escrow]
        const totalAlchemica = {}
        const bigNumZero = new BigNumber(0)
        const earnedAlchemica = {
          FUD: bigNumZero,
          FOMO: bigNumZero,
          ALPHA: bigNumZero,
          KEK: bigNumZero
        }
        const escrowAlchemica = {}
        for (const token of ['FUD', 'FOMO', 'ALPHA', 'KEK']) {
          let total = bigNumZero
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
        totalAlchemica.NORMALIZED_PER_HOUR = totalAlchemica.NORMALIZED.dividedBy(actualPeriod / (60 * 60))

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
      whitelistId: '',
      isListed: true,
      isLended: true,
      notListedOrLended: true,
      canChannel: true,
      alreadyChanneled: true
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
      const {
        whitelistId,
        isListed,
        isLended,
        notListedOrLended: isAtHome,
        canChannel,
        alreadyChanneled
      } = tableFilters.value

      if (whitelistId) {
        if (whitelistId === 'public') {
          result = result.filter(row => row.listing && !row.listing.whitelistId)
        } else {
          result = result.filter(row => row.listing && row.listing.whitelistId === whitelistId)
        }
      }
      if (!isListed || !isLended || !isAtHome) {
        result = result.filter(row => {
          if (!isListed && row.isListed) {
            return false
          }
          if (!isLended && row.isLended) {
            return false
          }
          if (!isAtHome) {
            if (!row.isListed && !row.isLended) {
              return false
            }
          }
          return true
        })
      }
      if (fetchChannelingStatus.value.loaded && (!canChannel || !alreadyChanneled)) {
        const gotchiCanChannel = gotchiChannelingStatuses.value.canChannel
        result = result.filter(row => {
          if (!canChannel && gotchiCanChannel[row.gotchi.id]) {
            return false
          }
          if (!alreadyChanneled && !gotchiCanChannel[row.gotchi.id]) {
            return false
          }
          return true
        })
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
      } else if (column.startsWith('gotchi')) {
        const property = column.split(' ')[1]
        return orderBy(tableGotchisFiltered.value, [row => row.gotchi[property]], [direction])
      } else if (column === 'lastChanneled') {
        if (!fetchChannelingStatus.value.loaded) {
          return tableGotchisFiltered.value
        }
        return orderBy(tableGotchisFiltered.value, [row => gotchiChannelingStatuses.value.dates[row.gotchi.id]], [direction])
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

    const friendlyDuration = function (period) {
      const hours = (period - 0) / (60 * 60)
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
      fetchData,
      fetchChannelingStatus,
      lastFetchChannelingStatusDate,
      gotchiChannelingStatuses
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

  .col-about--listed,
  .col-about--lended {
    display: none;
  }
  .table-includes-listed .col-about--listed,
  .table-includes-lended .col-about--lended {
    display: revert;
  }

  .zero-value {
    opacity: 0.5;
  }
</style>
