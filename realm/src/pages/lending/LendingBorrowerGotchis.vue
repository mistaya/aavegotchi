<template>
  <div>
    <template v-if="status.loading">
      Loading, please wait...
    </template>
    <template v-if="status.error">
      Error fetching data
    </template>
    <template v-if="status.loaded">
      <div style="font-size: 0.9em">
        <CryptoIcons />
        <div
          v-if="stats.numLendings > 0"
          class="site-card"
          style="display: inline-block; margin-bottom: 15px; padding: 15px"
        >
          <h3 style="margin-top: 0;">
            Summary for
            <EthAddress
              :address="address"
              icon
            />
          </h3>
          <template
            v-if="!stats.alchemicaCount.isZero()"
          >
            <div style="margin-top: 15px">
              Collecting skill:
              <span style="font-size: 1.3em">
                <b>{{ stats.normalizedPerHour.decimalPlaces(2) }}</b> FUD-equiv / hour
              </span>
            </div>
            <div
              v-if="pricesStatus.loaded"
              style="margin-top: 10px"
            >
              <div>
                Profit:
                <CryptoIcon
                  label="GHST"
                  style="margin: 0 5px 0 0"
                />
                <span style="font-size: 1.3em">
                  <b>{{ stats.ghstProfit.decimalPlaces(2) }}</b>
                  GHST
                </span>
                (at current prices)
              </div>
            </div>
          </template>
          <div
            v-else
            style="margin-top: 10px"
          >
            No alchemica collected yet.
          </div>

          <div
            v-if="!stats.alchemicaCount.isZero()"
            style="display: flex; flex-wrap: wrap; gap: 20px; margin-top: 20px;"
          >
            <div style="flex: none">
              Collected {{ stats.alchemicaCount }} alchemica:
              <div
                v-for="token in Object.keys(stats.totalAlchemica)"
                :key="token"
                style="display: flex; align-items: center; margin: 5px 10px 5px 5px;"
              >
                <CryptoIcon
                  :label="token"
                  style="margin-right: 5px"
                />
                {{ stats.totalAlchemica[token] }}
                {{ token }}
              </div>
              <div
                v-if="pricesStatus.loaded"
                style="display: flex; align-items: center; margin: 8px 10px 5px 5px;"
              >
                <span style="align-self: flex-start; margin-right: 4px;">
                  =
                </span>
                <CryptoIcon
                  label="GHST"
                  style="margin-right: 5px; align-self: flex-start;"
                />
                {{ stats.totalNormalizedAlchemicaGhst.decimalPlaces(2) }}
                GHST-value
                <br>
                ({{ stats.normalizedGhstPerHour.decimalPlaces(2) }} GHST / hour)
              </div>
            </div>
            <div style="flex: none">
              Earned {{ stats.alchemicaEarnedCount }} alchemica:
              <div
                v-for="token in Object.keys(stats.totalAlchemicaEarned)"
                :key="token"
                style="display: flex; align-items: center; margin: 5px 10px 5px 5px;"
              >
                <CryptoIcon
                  :label="token"
                  style="margin-right: 5px"
                />
                {{ stats.totalAlchemicaEarned[token] }}
                {{ token }}
              </div>
              <div
                v-if="pricesStatus.loaded"
                style="display: flex; align-items: center; margin: 8px 10px 5px 5px;"
              >
                <span style="align-self: flex-start; margin-right: 4px;">
                  =
                </span>
                <CryptoIcon
                  label="GHST"
                  style="margin-right: 5px; align-self: flex-start;"
                />
                {{ stats.totalNormalizedAlchemicaEarnedGhst.decimalPlaces(2) }}
                GHST-value
                <br>
                ({{ stats.normalizedGhstEarnedPerHour.decimalPlaces(2) }} GHST / hour)
              </div>
            </div>
          </div>
          <div style="margin-top: 20px">
            Borrowed {{ stats.numLendings }}
            {{ stats.numLendings === 1 ? 'gotchi' : 'gotchis' }}
            for {{ friendlyDuration(stats.totalSeconds) }},
            fees <CryptoIcon
              label="GHST"
              style="position: relative; top: 2px"
            />
            {{ stats.totalUpfrontGhst.decimalPlaces(2) }}
            GHST
          </div>
          <div
            v-if="pricesStatus.loaded"
            style="margin-top: 10px; border-top: 1px solid var(--site-border-color--transparent); padding-top: 8px; font-size: 0.8em;"
          >
            Using prices:
            <div
              v-for="token in Object.keys(stats.totalAlchemicaEarned)"
              :key="token"
            >
              1 {{ token }}
              =
              {{ ghstPrices[token].toFixed(3) }}
              GHST
            </div>
            <div>
              (data from CoinGecko)
            </div>
          </div>
        </div>

        <details>
          <summary>
            About this data
          </summary>
          The FUD, FOMO, ALPHA, KEK in the table shows what's visible on the blockchain:
          <template v-if="earningsEnabled">
            the total amount claimed plus any amount in the gotchi pocket (withdrawn).
          </template>
          <template v-else>
            the amount in the gotchi pocket (withdrawn). (Claimed earnings data is not available on Base.)
          </template>
          <br>We can't yet see alchemica that has been collected in-game but not withdrawn through a vortex, or withdrawals that are stuck in a queue and haven't been sent yet.
          <br>This data is gathered from several sources, so may not be totally up-to-date.
          <br>
          <br>The 'Total (FUD-equiv)' column is the same collected alchemica converted to a FUD-equivalent amount, as a single measure for comparison. This is done by using the intrinsic rarity of each alchemica type, <i>not</i> their market price: i.e. 1 FOMO = 2 FUD; 1 ALPHA = 4 FUD; 1 KEK = 10 FUD.
          <br>
          <br>GHST-equivalent values are calculated using current prices, <i>not</i> the prices at the time of collection.
        </details>

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
                      Borrower uses the vortex, but the withdrawal is delayed for more than 5 minutes. Pixelcraft sends the alchemica directly to the borrower's wallet, not the gotchi pocket. This is particularly likely to happen at the end of a Saturday spillover event, or when network gas is high.
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
          v-if="isPolygonNetwork"
          style="margin-top: 20px;"
        >
          <div class="site-alertbox site-alertbox--warning">
            <SiteIcon name="warning-triangle" />
            <div>
              Due to a bug with lending data between 13-18 May 2022, the reported Finish time (and therefore "Actual Duration" and "Per Hour" calculations) are likely to be <b>wrong</b> for lendings that finished during this period, and also for many of the first 25000 lendings (these now incorrectly appear to have finished between 13-18 May).
              <br>Hopefully this will be fixed in the subgraph at some point.
            </div>
          </div>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <LendingLastChanneledFetchStatus
          :fetchStatus="fetchChannelingStatus"
          :lastFetchDate="lastFetchChannelingStatusDate"
        />
      </div>

      <div
        v-if="balancesStatus.error"
        style="margin-top: 20px; font-size: 0.9em;"
      >
        <div class="site-alertbox site-alertbox--warning">
          <SiteIcon name="warning-triangle" />
          There was an error fetching pocket balances.
        </div>
      </div>

      <div
        v-if="earningsEnabled && earningsStatus.error"
        style="margin-top: 20px; font-size: 0.9em;"
      >
        <div class="site-alertbox site-alertbox--warning">
          <SiteIcon name="warning-triangle" />
          There was an error fetching gotchis' earnings.
        </div>
      </div>

      <SiteButton
        type="button"
        style="margin-top: 20px"
        @click="fetchData"
      >
        Refresh data
      </SiteButton>

      <div
        v-if="numGotchis === 0"
        style="margin-top: 20px;"
      >
        No borrowed gotchis found.
      </div>
      <SiteTable
        v-else
        v-model:page="tablePaging.page"
        v-model:pageSize="tablePaging.pageSize"
        :numResults="numGotchis"
        itemsLabel="borrowings"
        :scrollingBreakpoint="2400"
        bordered
        class="lending-borrower-table"
      >
        <template #headers>
          <tr>
            <th></th>
            <th
              colspan="2"
              class="with-left-border"
            >
              Lending
            </th>
            <th
              colspan="2"
              class="with-left-border"
            >
              Duration
            </th>
            <th
              :colspan="pricesStatus.loaded ? 10 : 8"
              class="with-left-border"
            >
              Alchemica
              <div style="display: inline-flex;">
                <SiteButton
                  type="button"
                  :aria-pressed="`${showCollected}`"
                  @click="showCollected = true"
                >
                  Collected
                </SiteButton>
                <SiteButton
                  type="button"
                  :aria-pressed="`${!showCollected}`"
                  @click="showCollected = false"
                >
                  Earned
                </SiteButton>
              </div>
            </th>
            <th
              colspan="2"
              class="with-left-border"
            >
              Gotchi
            </th>
            <th
              colspan="2"
              class="with-left-border"
            >
              Owner
            </th>
            <th
              colspan="6"
              class="with-left-border"
            >
              Lending Details
            </th>
          </tr>
          <tr>
            <th>Gotchi</th>
            <th class="with-left-border">Started</th>
            <th style="min-width: 120px">
              Finishes
              <SortToggle
                :sort="tableSort.column === 'actualFinishTimestamp' ? tableSort.direction : null"
                @update:sort="tableSort.column = $event ? 'actualFinishTimestamp' : null; tableSort.direction = $event"
              />
            </th>
            <th class="with-left-border">Agreed</th>
            <th>Actual</th>
            <th
              v-for="(type, index) in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
              :key="type"
              :class="index === 0 ? 'with-left-border' : null"
            >
              {{ type }}
            </th>
            <th class="with-left-border">
              Total Count
            </th>
            <th title="Calculated by rarity (not market price): 1 FOMO = 2 FUD; 1 ALPHA = 4 FUD; 1 KEK = 10 FUD">
              Total FUD-equiv
            </th>
            <th v-if="pricesStatus.loaded">
              Total GHST-equiv
            </th>
            <th class="with-left-border">
              Count Per Hour
            </th>
            <th>
              FUD-equiv Per Hour
            </th>
            <th v-if="pricesStatus.loaded">
              GHST-equiv Per Hour
            </th>
            <th class="with-left-border">
              Kinship
            </th>
            <th>
              Last Channeled
            </th>
            <th class="with-left-border">
              Owner
            </th>
            <th>
              Original Owner
            </th>
            <th class="with-left-border">
              Listing ID
            </th>
            <th>
              Borrower Can Channel
            </th>
            <th>Upfront GHST</th>
            <th>Borrower %</th>
            <th>
              Whitelist ID
            </th>
            <th>
              Third-Party Address
            </th>
            <th>Gotchi Pocket</th>
          </tr>
        </template>
        <template #rows>
          <tr
            v-for="row in rowsToDisplay"
            :key="row.listing.id"
          >
            <td>
              <a
                :href="isPolygonNetwork ? `https://app.aavegotchi.com/gotchi/${row.gotchi.id}` : `https://dapp.aavegotchi.com/u/${row.listing.originalOwner || row.listing.lender}/inventory?itemType=aavegotchis&chainId=8453&id=${row.gotchi.id}`"
                rel="noopener"
                target="_blank"
              >
                {{ row.gotchi.name }}
                #{{ row.gotchi.id }}
              </a>
            </td>
            <td
              style="white-space: nowrap;"
              class="with-left-border"
            >
              <DateFriendly
                v-if="row.agreedDate"
                :date="row.agreedDate"
                enableToggle
              />
            </td>
            <td style="white-space: nowrap;">
              <SiteIcon
                :name="row.listing.completed ? 'check' : 'clock'"
                :title="row.listing.completed ? 'finished' : 'active'"
                style="margin-right: 5px;"
              />
              <DateFriendly
                :date="row.actualFinishDate"
                enableToggle
              />
            </td>
            <td
              style="white-space: nowrap;"
              class="with-left-border"
            >
              {{ friendlyDuration(row.listing.period) }}
            </td>
            <td style="white-space: nowrap;">
              {{ friendlyDuration(row.actualPeriod) }}
            </td>
            <td
              v-for="(type, index) in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
              :key="type"
              :class="index === 0 ? 'with-left-border' : null"
            >
              <template v-if="row.totalAlchemica">
                <div
                  v-if="!showCollected && row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemicaShare[type].isZero()
                  }"
                >
                  {{ row.totalAlchemicaShare[type].decimalPlaces(2) }}
                </div>
                <div
                  v-if="showCollected || !row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemica[type].isZero()
                  }"
                  :title="
                    (
                      earningsEnabled &&
                      !row.listing.completed &&
                      (
                        !row.earnedAlchemica[type].isZero() ||
                        (row.escrowAlchemica[type] && !row.escrowAlchemica[type].isZero())
                      )
                    )
                    ? `Claimed: ${row.earnedAlchemica[type]}, Pocket: ${row.escrowAlchemica[type] || 0}` : null
                  "
                >
                  {{ row.totalAlchemica[type] }}
                </div>
              </template>
            </td>
            <td class="with-left-border">
              <template v-if="row.totalAlchemica">
                <div
                  v-if="!showCollected && row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemicaShare.SUM.isZero()
                  }"
                >
                  {{ row.totalAlchemicaShare.SUM.decimalPlaces(2) }}
                </div>
                <div
                  v-if="showCollected || !row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemica.SUM.isZero()
                  }"
                >
                  {{ row.totalAlchemica.SUM.decimalPlaces(2) }}
                </div>
              </template>
            </td>
            <td>
              <template v-if="row.totalAlchemica">
                <div
                  v-if="!showCollected && row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemicaShare.NORMALIZED.isZero()
                  }"
                  :title="`Borrower's share at ${row.listing.splitBorrower}%`"
                >
                  {{ row.totalAlchemicaShare.NORMALIZED.decimalPlaces(2) }}
                </div>
                <div
                  v-if="showCollected || !row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemica.NORMALIZED.isZero()
                  }"
                >
                  {{ row.totalAlchemica.NORMALIZED.decimalPlaces(2) }}
                </div>
              </template>
            </td>
            <td v-if="pricesStatus.loaded">
              <template v-if="row.totalAlchemica">
                <div
                  v-if="!showCollected && row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemicaShare.NORMALIZED_GHST.isZero()
                  }"
                  :title="`Borrower's share at ${row.listing.splitBorrower}%`"
                >
                  {{ row.totalAlchemicaShare.NORMALIZED_GHST.decimalPlaces(2) }}
                </div>
                <div
                  v-if="showCollected || !row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemica.NORMALIZED_GHST.isZero()
                  }"
                >
                  {{ row.totalAlchemica.NORMALIZED_GHST.decimalPlaces(2) }}
                </div>
              </template>
            </td>
            <td class="with-left-border">
              <template v-if="row.totalAlchemica">
                <div
                  v-if="!showCollected && row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemicaShare.SUM_PER_HOUR.isZero()
                  }"
                >
                  {{ row.totalAlchemicaShare.SUM_PER_HOUR.decimalPlaces(2) }}
                </div>
                <div
                  v-if="showCollected || !row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemica.SUM_PER_HOUR.isZero()
                  }"
                >
                  {{ row.totalAlchemica.SUM_PER_HOUR.decimalPlaces(2) }}
                </div>
              </template>
            </td>
            <td>
              <template v-if="row.totalAlchemica">
                <div
                  v-if="!showCollected && row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemicaShare.NORMALIZED_PER_HOUR.isZero()
                  }"
                >
                  {{ row.totalAlchemicaShare.NORMALIZED_PER_HOUR.decimalPlaces(2) }}
                </div>
                <div
                  v-if="showCollected || !row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemica.NORMALIZED_PER_HOUR.isZero()
                  }"
                >
                  {{ row.totalAlchemica.NORMALIZED_PER_HOUR.decimalPlaces(2) }}
                </div>
              </template>
            </td>
            <td v-if="pricesStatus.loaded">
              <template v-if="row.totalAlchemica">
                <div
                  v-if="!showCollected && row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemicaShare.NORMALIZED_GHST_PER_HOUR.isZero()
                  }"
                >
                  {{ row.totalAlchemicaShare.NORMALIZED_GHST_PER_HOUR.decimalPlaces(2) }}
                </div>
                <div
                  v-if="showCollected || !row.isBorrowerSharing"
                  :class="{
                    'zero-value': row.totalAlchemica.NORMALIZED_GHST_PER_HOUR.isZero()
                  }"
                >
                  {{ row.totalAlchemica.NORMALIZED_GHST_PER_HOUR.decimalPlaces(2) }}
                </div>
              </template>
            </td>
            <td class="with-left-border">
              {{ row.listing.gotchiKinship }}
            </td>
            <LendingLastChanneledCell
              v-if="!row.listing.completed"
              :gotchiId="row.gotchi.id"
              :fetchStatus="fetchChannelingStatus"
              :gotchiChannelingStatuses="gotchiChannelingStatuses"
              enableCellHighlight
            />
            <td v-else>
            </td>
            <td
              class="with-left-border"
              style="white-space: nowrap;"
            >
              <EthAddress
                :address="row.listing.lender"
                icon
                shortest
              />
              <LendingLandsIconLink
                :address="row.listing.lender"
                style="margin-left: 5px;"
              />
            </td>
            <td style="white-space: nowrap;">
              <template v-if="row.listing.originalOwner && row.listing.originalOwner !== row.listing.lender">
                <EthAddress
                  :address="row.listing.originalOwner"
                  icon
                  shortest
                />
              </template>
            </td>
            <td class="with-left-border">
              <a
                :href="isPolygonNetwork ? `https://app.aavegotchi.com/lending/${row.listing.id}` : `https://dapp.aavegotchi.com/lending/aavegotchis?id=${row.listing.id}`"
                rel="noopener"
                target="_blank"
              >
                {{ row.listing.id }}
              </a>
            </td>
            <td>
              {{ row.listing.channellingAllowed ? 'Yes' : 'No' }}
            </td>
            <td>
              {{ friendlyGhst(row.listing.upfrontCost) }}
            </td>
            <td>
              {{ row.listing.splitBorrower }}
            </td>
            <td>
              {{ row.listing.whitelistId }}
            </td>
            <td>
              <EthAddress
                v-if="row.listing.thirdPartyAddress !== '0x0000000000000000000000000000000000000000'"
                :address="row.listing.thirdPartyAddress"
                icon
                :polygonscan="isPolygonNetwork ? 'erc20': undefined"
                :basescan="!isPolygonNetwork ? 'erc20': undefined"
                shortest
              />
            </td>
            <td>
              <EthAddress
                :address="row.gotchi.escrow"
                :polygonscan="isPolygonNetwork ? 'erc20': undefined"
                :basescan="!isPolygonNetwork ? 'erc20': undefined"
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
import formatDuration from 'date-fns/formatDuration'
import intervalToDuration from 'date-fns/intervalToDuration'
import orderBy from 'lodash.orderby'
import { ref, computed, watch } from 'vue'

import apis from '@/data/apis'
import useNetwork from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import useGotchiChanneling from '@/data/useGotchiChanneling'
import useAddressBalances from '@/data/useAddressBalances'
import useTokenPricesAavegotchi from '@/data/useTokenPricesAavegotchi'
import CryptoIcon from '@/common/CryptoIcon.vue'
import CryptoIcons from '@/common/CryptoIcons.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import EthAddress from '@/common/EthAddress.vue'
import SiteIcon from '@/site/SiteIcon.vue'
import SiteTable from '@/site/SiteTable.vue'
import SortToggle from '@/common/SortToggle.vue'
import LendingLandsIconLink from './LendingLandsIconLink.vue'
import LendingLastChanneledFetchStatus from './LendingLastChanneledFetchStatus.vue'
import LendingLastChanneledCell from './LendingLastChanneledCell.vue'

const FETCH_PAGE_SIZE = 1000

export default {
  components: {
    CryptoIcons,
    CryptoIcon,
    EthAddress,
    DateFriendly,
    SiteIcon,
    SiteTable,
    SortToggle,
    LendingLandsIconLink,
    LendingLastChanneledFetchStatus,
    LendingLastChanneledCell
  },
  props: {
    address: { type: String, default: null }
  },
  setup (props) {
    const addressLc = computed(() => props.address?.toLowerCase())

    const { isPolygonNetwork, selectedNetwork } = useNetwork()

    const {
      fetchGotchiChannelingStatuses,
      gotchiChannelingStatuses,
      fetchStatus: fetchChannelingStatus,
      lastFetchDate: lastFetchChannelingStatusDate
    } = useGotchiChanneling()

    const { status: borrowedGotchisStatus, setLoading: setBorrowedGotchisLoading } = useStatus()
    const borrowedGotchis = ref(null)

    const { status: earningsStatus, setLoading: setEarningsLoading } = useStatus()
    const earnings = ref({})
    const earningsEnabled = computed(() => isPolygonNetwork.value)

    const { ghstPrices, fetchStatus: pricesStatus, fetchPrices } = useTokenPricesAavegotchi()

    const {
      setAddresses: setBalancesAddresses,
      balances,
      fetchStatus: balancesStatus,
      fetchBalances
    } = useAddressBalances({ tokenLabels: ['FUD', 'FOMO', 'ALPHA', 'KEK'] })

    const status = computed(() => ({
      loading: borrowedGotchisStatus.value.loading || earningsStatus.value.loading || balancesStatus.value.loading || pricesStatus.value.loading,
      error: borrowedGotchisStatus.value.error,
      loaded: borrowedGotchisStatus.value.loaded &&
        (
          earningsEnabled.value
            ? (earningsStatus.value.loaded || earningsStatus.value.error) // allow earnings fetch to fail
            : true
        ) &&
        (balancesStatus.value.loaded || balancesStatus.value.error) && // allow balances fetch to fail
        (pricesStatus.value.loaded || pricesStatus.value.error) // allow prices fetch to fail
    }))

    fetchPrices()

    const fetchBorrowedGotchis = function () {
      const SUBGRAPH_URL = apis[selectedNetwork.value].CORE_SUBGRAPH

      const [isStale, setLoaded, setError] = setBorrowedGotchisLoading()
      let lastIdNum = 0
      let fetchedLendings = []

      const borrowerQuery = props.address ? `, borrower: "${addressLc.value}"` : ''

      const fetchFromSubgraph = function () {
        const query = `{
          gotchiLendings(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: {
            id_gt: ${lastIdNum},
            cancelled: false,
            ${borrowerQuery}
          }) {
            id
            gotchi {
              id
              name
              escrow
            }
            gotchiKinship

            lender
            originalOwner
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
            timeEnded
            borrower
            completed
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
              setError('There was an error fetching borrowed gotchis')
              return
            }
            const responseJson = await response.json()
            // console.log({ responseJson })
            if (responseJson.data?.gotchiLendings) {
              fetchedLendings = fetchedLendings.concat(responseJson.data.gotchiLendings)
              if (responseJson.data.gotchiLendings.length < FETCH_PAGE_SIZE) {
                // finished fetching all pages
                borrowedGotchis.value = fetchedLendings.map(item => {
                  const { gotchi, ...listing } = item
                  return { gotchi, listing }
                })
                // console.log('borrowedGotchis', borrowedGotchis.value)
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
            setError('There was an error fetching borrowed gotchis')
          })
      }

      fetchFromSubgraph()
    }

    const fetchEarnings = function () {
      if (!earningsEnabled.value) { return }
      const LENDING_SUBGRAPH_URL = isPolygonNetwork.value ? apis.LENDING_SUBGRAPH : null

      const [isStale, setLoaded, setError] = setEarningsLoading()
      if (!LENDING_SUBGRAPH_URL) {
        earnings.value = {}
        setError('no LENDING_SUBGRAPH_URL available to fetch earnings')
        return
      }

      let fetchedLendings = []
      const lendingIds = borrowedGotchis.value.map(({ listing }) => listing.id)
      let nextIndex = 0

      const fetchFromSubgraph = function () {
        const idsToFetch = lendingIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included

        if (idsToFetch.length === 0) {
          setLoaded()
          return
        }

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
      () => borrowedGotchisStatus.value.loaded,
      () => {
        if (borrowedGotchisStatus.value.loaded) {
          fetchEarnings()
        }
      }
    )

    watch(
      () => borrowedGotchis.value,
      () => {
        if (borrowedGotchis.value) {
          // Only fetch escrow balances for currently-borrowed gotchis
          const escrowAddresses = borrowedGotchis.value.filter(item => !item.listing.completed).map(item => item.gotchi.escrow)
          // console.log('Set escrowAddresses and fetch balances', escrowAddresses)
          setBalancesAddresses(escrowAddresses)
          fetchBalances.value()
        }
      }
    )

    watch(
      () => status.value.loaded,
      loaded => {
        if (loaded) {
          // we only need the channeling statuses for currently-borrowed gotchis
          const gotchiIds = borrowedGotchis.value.filter(item => !item.listing.completed).map(item => item.gotchi.id)
          fetchGotchiChannelingStatuses.value(gotchiIds)
        }
      }
    )

    const fetchData = function () {
      fetchBorrowedGotchis()
    }

    watch(
      () => isPolygonNetwork.value,
      fetchData,
      { immediate: true }
    )

    const tableGotchis = computed(() => {
      if (!status.value.loaded) { return [] }
      const includeEarnings = earningsEnabled.value
      const rows = borrowedGotchis.value.map(item => {
        const isComplete = item.listing.completed
        // N.B. sometimes earningsForListing is missing for completed lendings
        const earningsForListing = includeEarnings && item.listing ? earnings.value[item.listing.id] : null
        const createdDate = new Date(item.listing.timeCreated * 1000)
        const agreedTimestamp = item.listing.timeAgreed * 1000
        const agreedDate = new Date(agreedTimestamp)
        const actualFinishTimestamp = !isComplete
          ? ((item.listing.timeAgreed - 0) + (item.listing.period - 0)) * 1000
          // for finished listings, use the timeEnded
          : ((item.listing.timeEnded - 0) * 1000)
        const actualFinishDate = new Date(actualFinishTimestamp)
        const balancesForGotchi = balances.value[item.gotchi.escrow]
        const totalAlchemica = {}
        const totalAlchemicaShare = {}
        const bigNumZero = new BigNumber(0)
        const earnedAlchemica = {
          FUD: bigNumZero,
          FOMO: bigNumZero,
          ALPHA: bigNumZero,
          KEK: bigNumZero
        }
        const escrowAlchemica = {}
        const borrowerPercentage = item.listing.splitBorrower
        const isBorrowerSharing = borrowerPercentage !== '100'
        for (const token of ['FUD', 'FOMO', 'ALPHA', 'KEK']) {
          let total = bigNumZero
          if (earningsForListing) {
            const earned = new BigNumber(earningsForListing[`claimed${token}`] || 0).div(10e17)
            earnedAlchemica[token] = earned
            total = total.plus(earned)
          }
          if (!isComplete && balancesForGotchi) {
            const balance = balancesForGotchi[token] || 0
            escrowAlchemica[token] = balance
            total = total.plus(balance)
          }
          totalAlchemica[token] = total
          if (isBorrowerSharing) {
            totalAlchemicaShare[token] = total.times((borrowerPercentage - 0) / 100)
          }
        }

        totalAlchemica.SUM = totalAlchemica.FUD
          .plus(totalAlchemica.FOMO)
          .plus(totalAlchemica.ALPHA)
          .plus(totalAlchemica.KEK)
        totalAlchemica.NORMALIZED = totalAlchemica.FUD
          .plus(totalAlchemica.FOMO.times(2))
          .plus(totalAlchemica.ALPHA.times(4))
          .plus(totalAlchemica.KEK.times(10))
        totalAlchemica.NORMALIZED_GHST = pricesStatus.value.loaded
          ? totalAlchemica.FUD.times(ghstPrices.value.FUD)
            .plus(totalAlchemica.FOMO.times(ghstPrices.value.FOMO))
            .plus(totalAlchemica.ALPHA.times(ghstPrices.value.ALPHA))
            .plus(totalAlchemica.KEK.times(ghstPrices.value.KEK))
          : new BigNumber(0)

        const actualPeriod = isComplete ? (actualFinishTimestamp - agreedTimestamp) / 1000 : (Date.now() - agreedTimestamp) / 1000
        const actualPeriodIsZero = actualPeriod === 0
        totalAlchemica.SUM_PER_HOUR = actualPeriodIsZero ? bigNumZero : totalAlchemica.SUM.dividedBy(actualPeriod / (60 * 60))
        totalAlchemica.NORMALIZED_PER_HOUR = actualPeriodIsZero ? bigNumZero : totalAlchemica.NORMALIZED.dividedBy(actualPeriod / (60 * 60))
        totalAlchemica.NORMALIZED_GHST_PER_HOUR = actualPeriodIsZero ? bigNumZero : totalAlchemica.NORMALIZED_GHST.dividedBy(actualPeriod / (60 * 60))

        if (isBorrowerSharing) {
          const percentage = (borrowerPercentage - 0) / 100
          totalAlchemicaShare.SUM = totalAlchemica.SUM.times(percentage)
          totalAlchemicaShare.NORMALIZED = totalAlchemica.NORMALIZED.times(percentage)
          totalAlchemicaShare.NORMALIZED_GHST = totalAlchemica.NORMALIZED_GHST.times(percentage)
          totalAlchemicaShare.SUM_PER_HOUR = totalAlchemica.SUM_PER_HOUR.times(percentage)
          totalAlchemicaShare.NORMALIZED_PER_HOUR = totalAlchemica.NORMALIZED_PER_HOUR.times(percentage)
          totalAlchemicaShare.NORMALIZED_GHST_PER_HOUR = totalAlchemica.NORMALIZED_GHST_PER_HOUR.times(percentage)
        }

        return {
          gotchi: item.gotchi,
          listing: item.listing,
          totalAlchemica,
          totalAlchemicaShare,
          isBorrowerSharing,
          earnedAlchemica,
          escrowAlchemica,
          agreedDate,
          createdDate,
          actualFinishDate,
          actualFinishTimestamp,
          actualPeriod
        }
      })

      return orderBy(rows, ['actualFinishTimestamp'], ['desc'])
    })

    const numGotchis = computed(() => tableGotchis.value?.length)

    const tableSort = ref({
      column: 'actualFinishTimestamp',
      direction: 'desc'
    })

    const tablePaging = ref({
      page: 0,
      pageSize: 25
    })

    const tableGotchisSorted = computed(() => {
      const { column, direction } = tableSort.value
      if (!column) { return tableGotchis.value }
      return orderBy(tableGotchis.value, [column], [direction])
    })

    watch(
      () => ({
        sortColumn: tableSort.value.column,
        sortDirection: tableSort.value.direction,
        pageSize: tablePaging.value.pageSize,
        tableGotchisFiltered: tableGotchis.value
      }),
      () => { tablePaging.value.page = 0 }
    )

    const rowsToDisplay = computed(() => {
      const start = tablePaging.value.page * tablePaging.value.pageSize
      const end = start + tablePaging.value.pageSize
      return tableGotchisSorted.value.slice(start, end)
    })

    const stats = computed(() => {
      const rows = tableGotchis.value
      if (!rows || !rows.length) { return {} }
      const numLendings = rows.length
      let totalSeconds = 0
      const totalAlchemica = {}
      const totalAlchemicaEarned = {}
      let totalNormalizedAlchemica = new BigNumber(0)
      let totalNormalizedAlchemicaGhst = new BigNumber(0)
      let totalNormalizedAlchemicaEarnedGhst = new BigNumber(0)
      let totalUpfrontGhst = new BigNumber(0)
      for (const row of rows) {
        totalSeconds += (row.actualPeriod - 0)
        if (row.listing.upfrontCost) {
          totalUpfrontGhst = totalUpfrontGhst.plus(new BigNumber(row.listing.upfrontCost).div(10e17))
        }
        for (const token of ['FUD', 'FOMO', 'ALPHA', 'KEK']) {
          if (!totalAlchemica[token]) {
            totalAlchemica[token] = new BigNumber(0)
          }
          totalAlchemica[token] = totalAlchemica[token].plus(row.totalAlchemica[token])

          if (!totalAlchemicaEarned[token]) {
            totalAlchemicaEarned[token] = new BigNumber(0)
          }
          totalAlchemicaEarned[token] = totalAlchemicaEarned[token].plus(row.totalAlchemica[token].times(row.listing.splitBorrower / 100))
        }
        totalNormalizedAlchemica = totalNormalizedAlchemica.plus(row.totalAlchemica.NORMALIZED)
        totalNormalizedAlchemicaGhst = totalNormalizedAlchemicaGhst.plus(row.totalAlchemica.NORMALIZED_GHST)
        totalNormalizedAlchemicaEarnedGhst = totalNormalizedAlchemicaEarnedGhst.plus(row.isBorrowerSharing ? row.totalAlchemicaShare.NORMALIZED_GHST : row.totalAlchemica.NORMALIZED_GHST)
      }
      let alchemicaCount = new BigNumber(0)
      let alchemicaEarnedCount = new BigNumber(0)
      for (const token of ['FUD', 'FOMO', 'ALPHA', 'KEK']) {
        alchemicaCount = alchemicaCount.plus(totalAlchemica[token])
        alchemicaEarnedCount = alchemicaEarnedCount.plus(totalAlchemicaEarned[token])
      }
      const totalHours = totalSeconds / (60 * 60)
      const countPerHour = alchemicaCount.dividedBy(totalHours)
      const normalizedPerHour = totalNormalizedAlchemica.dividedBy(totalHours)
      const normalizedGhstPerHour = totalNormalizedAlchemicaGhst.dividedBy(totalHours)
      const normalizedGhstEarnedPerHour = totalNormalizedAlchemicaEarnedGhst.dividedBy(totalHours)
      const ghstProfit = totalNormalizedAlchemicaEarnedGhst.minus(totalUpfrontGhst)

      return {
        numLendings,
        totalSeconds,
        totalUpfrontGhst,
        totalAlchemica,
        totalAlchemicaEarned,
        totalNormalizedAlchemicaGhst,
        totalNormalizedAlchemicaEarnedGhst,
        ghstProfit,
        alchemicaCount,
        alchemicaEarnedCount,
        countPerHour,
        normalizedPerHour,
        normalizedGhstPerHour,
        normalizedGhstEarnedPerHour
      }
    })

    const friendlyDuration = function (periodString) {
      const duration = intervalToDuration({ start: 0, end: (periodString - 0) * 1000 })
      let str = formatDuration(
        duration,
        {
          format: ['years', 'months', 'days', 'hours', 'minutes']
        }
      )
      if (!str) {
        // maybe very short?
        str = formatDuration(
          duration,
          {
            format: ['seconds']
          }
        )
      }
      // Shorten it further
      if (str.includes(' second')) {
        str = str.replace(/(\d) seconds?/, '$1s')
      }
      if (str.includes(' minute')) {
        str = str.replace(/(\d) minutes?/, '$1m')
      }
      if (str.includes(' hour')) {
        str = str.replace(/(\d) hours?/, '$1h')
      }
      if (str.includes(' day')) {
        str = str.replace(/(\d) days?/, '$1d')
      }
      if (str.includes(' month')) {
        str = str.replace(/(\d) months?/, '$1mo')
      }
      if (str.includes(' year')) {
        str = str.replace(/(\d) years?/, '$1y')
      }
      return str
    }

    const friendlyGhst = function (upfrontCost) {
      const cost = new BigNumber(upfrontCost).div(10e17)
      return cost.toString()
    }

    const showCollected = ref(true)

    return {
      isPolygonNetwork,
      status,
      earningsEnabled,
      earningsStatus,
      balancesStatus,
      pricesStatus,
      ghstPrices,
      stats,
      borrowedGotchis,
      numGotchis,
      showCollected,
      tableSort,
      tablePaging,
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
  .zero-value {
    opacity: 0.5;
  }
</style>
