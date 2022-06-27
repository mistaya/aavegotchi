<template>
  <div>
    <CryptoIcons />
    <h2>Gotchis Available to Borrow</h2>
    <div>
      <div style="margin-bottom: 20px;">
        <div class="site-alertbox site-alertbox--warning site-alertbox--compact">
          <SiteIcon name="warning-triangle" />
          <div>
            Warning: channeling <b>spillover</b> will only occur during the Saturday hangouts (2pm - 4pm UTC). See the announcements in Discord for details.
          </div>
        </div>
      </div>

      <fieldset
        class="lending-filters"
        style="margin-bottom: 30px;"
      >
        <legend>
          Search Filters
        </legend>
        <div style="margin-top: 12px;">
          <label>
            Upfront cost &le;
            <input
              v-model.lazy="filters.upfrontMax"
              type="text"
            />
            GHST
          </label>
        </div>
        <div>
          <label>
            Borrower &ge;
            <input
              v-model.lazy="filters.borrowerSplit"
              type="text"
            />
            %
          </label>
        </div>
        <div>
          <label>
            Duration &ge;
            <input
              v-model.lazy="filters.hours"
              type="text"
            />
            hours
          </label>
        </div>
        <div>
          <label>
            Kinship &ge;
            <input
              v-model.lazy="filters.kinship"
              type="text"
            />
          </label>
        </div>
        <div>
          <label>
            <input
              v-model="filters.noWhitelist"
              type="checkbox"
            />
            Public, no whitelist
          </label>
          <label
            v-if="!filters.noWhitelist"
            style="margin-left: 15px; white-space: nowrap;"
          >
            Whitelist ID
            <input
              v-model.lazy="filters.whitelistId"
              type="text"
            />
          </label>
        </div>
        <div>
          <label>
            <input
              v-model="filters.allAlchemica"
              type="checkbox"
            />
            Earn all alchemica tokens
          </label>
          <template v-if="!filters.allAlchemica">
            <label
              v-for="token in Object.keys(filters.tokens)"
              :key="token"
              style="margin-left: 10px"
            >
              <div style="display: inline-flex; align-items: center; margin-right: 10px">
                <input
                  v-model="filters.tokens[token]"
                  type="checkbox"
                />
                <span style="margin: 0 5px">
                  {{ token }}
                </span>
                <CryptoIcon
                  :address="TOKEN_ADDRESSES[token]"
                  class="shared-token-icon"
                />
              </div>
            </label>
          </template>
        </div>
        <hr style="margin: 20px 0; border: 0; border-top: 1px solid var(--site-border-color--transparent);" />
        <div>
          Fetch
          <label>
            <input
              v-model="fetchPageSize"
              type="radio"
              name="fetchPageSize"
              :value="100"
            />
            first 100
          </label>
          <label>
            <input
              v-model="fetchPageSize"
              type="radio"
              name="fetchPageSize"
              :value="1000"
            />
            first 1000
          </label>
          results
        </div>
      </fieldset>

      <template v-if="status.loading">
        Fetching, please wait...
      </template>
      <template v-if="status.error">
        Sorry, there was an error fetching data. You can try refreshing the page.
      </template>
      <template v-if="status.loaded">
        <template v-if="!results || !results.length">
          No results found.
        </template>
        <template v-else>
          <div style="margin-bottom: 10px;">
            <template v-if="results.length === fetchPageSize">
              Here are the first {{ fetchPageSize }} matching lending offers.
            </template>
            <template v-else>
              There are {{ results.length }} matching lending offers.
            </template>
          </div>

          <LendingLastChanneledFetchStatus
            :fetchStatus="fetchChannelingStatus"
            :lastFetchDate="lastFetchChannelingStatusDate"
            short
          />

          <div
            v-if="fetchChannelingStatus.loaded"
            style="margin-top: 30px;"
          >
            <details
              class="advanced-filters"
              :open="filters2.isOpen"
              @toggle="filters2.isOpen = !!($event.target && $event.target.open)"
            >
              <summary>
                Advanced Channeling Filters &nbsp;
                <div
                  v-if="!filters2.isOpen"
                  style="margin-top: 10px;"
                >
                  <SiteButton
                    type="button"
                    @click.stop="filters2.isOpen = true"
                  >
                    Show filters
                  </SiteButton>
                </div>
              </summary>
              <div style="margin-top: 12px;">
                <label>
                  <input
                    v-model="filters2.onlyChannelable"
                    type="checkbox"
                  />
                  Show only gotchis that are channelable now (the current UTC window)
                </label>
                <div style="margin-top: 10px">
                  <label>
                    <input
                      type="checkbox"
                      v-model="tableSort2.column"
                      true-value="channelingDetails netTotalGhstPerChannel"
                      :false-value="null"
                    />
                    Sort by GHST Profit Per Channel
                  </label>
                </div>
                <div style="margin-top: 10px">
                  <label>
                    Calculate assuming Aaltar:
                    <select
                      v-model="channelingSettings.aaltarLevel"
                    >
                      <option
                        v-for="level in ['1', '2', '3', '4', '5', '6', '7', '8', '9']"
                        :key="level"
                        :value="level"
                      >
                        Level {{ level }}
                      </option>
                    </select>
                  </label>
                </div>
                <div style="margin-top: 15px; font-size: 0.9em; line-height: 1.5;">
                  These only filter/sort the {{ results.length }} results we've <i>already fetched</i>.
                  <br>If you want to find more,
                  <template v-if="fetchPageSize < 1000">increase the maximum number of results to fetch, or </template>
                  try different Search Filters earlier.
                </div>
                <details
                  class="site-card"
                  style="max-width: 40em; margin: 15px 0px 5px; padding: 10px; line-height: 1.5;"
                >
                  <summary>
                    Learn more about the channeling GHST Profit estimate, and what can go wrong!
                  </summary>
                  <div style="margin-top: 10px">
                    <div>
                      The GHST Profit from channeling is an estimate, and it's <b>not guaranteed</b> that you will get it.
                      <br>It's calculated based on the Gotchi's kinship and channeling opportunities during the lending period. The lending's borrower % and upfront GHST cost are then applied, to get the profit (net value) you would receive as a borrower, just from channeling.
                    </div>

                    <div style="margin-top: 10px">
                      <strong>Borrowing is at your own risk!</strong>
                      Please make sure you understand how the game works before spending your money :)
                    </div>

                    <div style="margin-top: 10px">
                      Each gotchi can channel once during the 24h UTC day. All gotchis 'reset' at 00:00 UTC: this was <DatePrecise :date="utcMidnight" /> in your timezone.
                      <br>You also need to find an aaltar on a parcel for the gotchi to channel at. Aaltars have their own cooldowns, which vary with aaltar level. You can't just use any aaltar - you need to own it yourself, or be given permission from the land owner.
                    </div>

                    <div style="margin-top: 10px">
                      Some gotchis will have already channeled in the current UTC day, others will be ready to channel now.
                      <br>Some lending periods might extend into the next UTC day, giving you a later channeling opportunity.
                    </div>

                    <div style="margin-top: 10px">
                      Possible problems include:
                      <ul style="margin-top: 5px;">
                        <li>alchemica/GHST pricing data is wrong or out of date (and changes over time)</li>
                        <li>subgraph data is out of date, and the gotchi has actually channeled already</li>
                        <li>the gotchi's owner channels it before you borrow</li>
                        <li>you get flagged as a bot and can't play</li>
                        <li>the Gotchiverse goes down (or there is some bug) and you can't channel (remember this is an alpha release: stay up-to-date on the Discord)</li>
                        <li>you don't own an available parcel to channel on</li>
                        <li>your Aaltar(s) haven't cooled down yet</li>
                        <li>the owner doesn't allow borrowers to channel on their parcels</li>
                        <li>the owner's parcels are bugged and their Aaltars don't appear, so you can't use them</li>
                        <li>you lose the race with other borrowers who are also channeling on the owner's parcels</li>
                        <li>you aren't online to channel at all the right times (especially if the lending finishes soon after the reset time)</li>
                        <li>the Aaltar you use is lower level than what you've calculated profits using</li>
                        <li>there is a bug with the calculations on this page (please tell me if you notice any errors!)</li>
                        <li><i>(something else unexpected...)</i></li>
                      </ul>
                    </div>

                    <div>
                      Calculations use these assumptions:
                      <ul style="margin-top: 5px;">
                        <li>
                          Channeling on a Level {{ channelingSettings.aaltarLevel }} Aaltar with
                          {{ 50 - ((channelingSettings.aaltarLevel - 1) * 5) }}% spillover
                        </li>
                        <li>
                          Alchemica prices:
                          1 FUD = {{ ghstPrices.FUD.toFixed(4) }} GHST;
                          1 FOMO = {{ ghstPrices.FOMO.toFixed(4) }} GHST;
                          1 ALPHA = {{ ghstPrices.ALPHA.toFixed(4) }} GHST;
                          1 KEK = {{ ghstPrices.KEK.toFixed(4) }} GHST
                        </li>
                      </ul>
                    </div>
                  </div>
                </details>
              </div>
            </details>
          </div>

          <div style="margin-top: 30px; margin-bottom: 20px;">
            <SiteButton
              type="button"
              style="margin-left: 10px; padding: 10px 15px; font-size: 1.15em;"
              @click="fetchLendings"
            >
              Refresh results!
            </SiteButton>
          </div>

          <div
            v-if="results2.length === 0"
            style="margin-top: 20px"
          >
            No channelable gotchis found out of {{ results.length }} listings.
            <br>Try <template v-if="fetchPageSize < 1000">increasing the maximum number of results to fetch, or </template>
            changing the earlier Search Filters to fetch more.
          </div>

          <SiteTable
            v-else
            v-model:page="tablePaging.page"
            v-model:pageSize="tablePaging.pageSize"
            :numResults="results2.length"
            itemsLabel="listings"
            :scrollingBreakpoint="1300"
            bordered
          >
            <template #headers>
              <tr>
                <th colspan="2"></th>
                <th
                  :colspan="filters.noWhitelist ? 4 : 5"
                  class="with-left-border"
                >
                  Lending Details
                </th>
                <th colspan="3" class="with-left-border">Channeling</th>
                <th colspan="4" class="with-left-border">Gotchi</th>
              </tr>
              <tr>
                <th>Listing ID</th>
                <th>
                  Posted
                  <SortToggle
                    :sort="tableSort.column === 'timeCreated' ? tableSort.direction : null"
                    @update:sort="tableSort.column = $event ? 'timeCreated' : null; tableSort.direction = $event"
                  />
                </th>
                <th class="with-left-border">
                  Duration
                  <SortToggle
                    :sort="tableSort.column === 'period' ? tableSort.direction : null"
                    @update:sort="tableSort.column = $event ? 'period' : null; tableSort.direction = $event"
                  />
                </th>
                <th>
                  Upfront GHST
                  <SortToggle
                    defaultDirection="asc"
                    :sort="tableSort.column === 'upfrontCost' ? tableSort.direction : null"
                    @update:sort="tableSort.column = $event ? 'upfrontCost' : null; tableSort.direction = $event"
                  />
                </th>
                <th>
                  Borrower %
                  <SortToggle
                    :sort="tableSort.column === 'splitBorrower' ? tableSort.direction : null"
                    @update:sort="tableSort.column = $event ? 'splitBorrower' : null; tableSort.direction = $event"
                  />
                </th>
                <th>
                  Sharing
                </th>
                <th v-if="!filters.noWhitelist">
                  Whitelist
                </th>
                <th class="with-left-border">
                  Number Possible
                </th>
                <th>
                  Total GHST Profit
                </th>
                <th>
                  GHST Profit Per Channel
                </th>
                <th class="with-left-border">
                  Gotchi
                </th>
                <th>
                  Kinship
                  <SortToggle
                    :sort="tableSort.column === 'gotchiKinship' ? tableSort.direction : null"
                    @update:sort="tableSort.column = $event ? 'gotchiKinship' : null; tableSort.direction = $event"
                  />
                </th>
                <th>Owner</th>
                <th>Original Owner</th>
              </tr>
            </template>
            <template #rows>
              <tr
                v-for="result in rowsToDisplay"
                :key="result.id"
              >
                <td style="padding: 0 15px;">
                  <a
                    :href="`https://app.aavegotchi.com/lending/${result.id}`"
                    rel="noopener"
                    target="_blank"
                    style="white-space: nowrap;"
                  >
                    {{ result.id }}
                    <SiteIcon name="open-window" />
                  </a>
                </td>
                <td>
                  <DateFriendly
                    :date="new Date(result.timeCreated * 1000)"
                  />
                </td>
                <td class="with-left-border">
                  {{ friendlyDuration(result.period) }}
                </td>
                <td>
                  {{ friendlyGhst(result.upfrontCost) }}
                </td>
                <td>
                  {{ result.splitBorrower }}
                </td>
                <td>
                  <template v-if="!result.tokensToShare.length">
                    <SiteIcon name="warning-triangle" />
                    No tokens shared with borrower!
                  </template>
                  <div
                    v-else
                    style="white-space: nowrap;"
                  >
                    <CryptoIcon
                      v-for="token in result.tokensToShare"
                      :key="token"
                      :address="token"
                      class="shared-token-icon"
                      style="margin-right: 3px;"
                    />
                  </div>
                </td>
                <td v-if="!filters.noWhitelist">
                  {{ result.whitelistId }}
                </td>
                <td
                  class="with-left-border"
                  :class="{
                    'can-channel': channelingDetails?.[result.id]?.numChannelings > 0,
                    'cannot-channel': channelingDetails?.[result.id]?.numChannelings === 0
                  }"
                >
                  <div v-if="channelingDetails && channelingDetails[result.id]">
                    <div
                      v-if="channelingDetails[result.id].numChannelings > 0"
                      style="display: flex; flex-wrap: wrap; column-gap: 5px; row-gap: 5px"
                    >
                      <span style="flex: none; display: flex; column-gap: 4px">
                        <SiteIcon
                          name="channel"
                          style="flex: none;"
                        />
                        <span style="flex: none">
                          {{ channelingDetails[result.id].canChannelNow ? 1 : 0 }}
                          now{{
                            channelingDetails[result.id].numChannelingsAfterReset > 0 ? ',' : ''
                          }}
                        </span>
                      </span>
                      <span
                        v-if="channelingDetails[result.id].numChannelingsAfterReset > 0"
                        style="flex: none;"
                      >
                        {{ channelingDetails[result.id].numChannelingsAfterReset }} later
                      </span>
                    </div>
                    <template v-else>
                      None
                    </template>
                  </div>
                </td>
                <td
                  class="channeling-net"
                  :class="{
                    'channeling-net--profit': channelingDetails?.[result.id]?.numChannelings > 0 && channelingDetails[result.id].netTotalGhst > 0,
                    'channeling-net--loss': channelingDetails?.[result.id]?.numChannelings > 0 && channelingDetails[result.id].netTotalGhst <= 0
                  }"
                >
                  <div v-if="channelingDetails && channelingDetails[result.id]">
                    <template v-if="channelingDetails[result.id].numChannelings > 0">
                      {{ channelingDetails[result.id].netTotalGhst.toFixed(2) }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </div>
                </td>
                <td
                  class="channeling-net"
                  :class="{
                    'channeling-net--profit': channelingDetails?.[result.id]?.numChannelings > 0 && channelingDetails[result.id].netTotalGhst > 0,
                    'channeling-net--loss': channelingDetails?.[result.id]?.numChannelings > 0 && channelingDetails[result.id].netTotalGhst <= 0
                  }"
                >
                  <div v-if="channelingDetails && channelingDetails[result.id]">
                    <template v-if="channelingDetails[result.id].numChannelings > 0">
                      {{ channelingDetails[result.id].netTotalGhstPerChannel.toFixed(2) }}
                    </template>
                    <template v-else>
                      -
                    </template>
                  </div>
                </td>
                <td class="with-left-border">
                  <a
                    :href="`https://app.aavegotchi.com/gotchi/${result.gotchiTokenId}`"
                    rel="noopener"
                    target="_blank"
                  >
                    {{ result.gotchi.name }}
                    #{{ result.gotchiTokenId }}
                  </a>
                </td>
                <td>
                  {{ result.gotchiKinship }}
                </td>
                <td style="white-space: nowrap;">
                  <EthAddress icon :address="result.lender" shortest />
                  <LendingLandsIconLink
                    :address="result.lender"
                    style="margin-left: 5px;"
                  />
                </td>
                <td style="white-space: nowrap;">
                  <template v-if="result.originalOwner && result.originalOwner !== result.lender">
                    <EthAddress
                      icon
                      :address="result.originalOwner"
                      shortest
                    />
                    <LendingLandsIconLink
                      :address="result.originalOwner"
                      style="margin-left: 5px;"
                    />
                  </template>
                </td>
              </tr>
            </template>
          </SiteTable>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import orderBy from 'lodash.orderby'
import { ref, computed, watch } from 'vue'
import useStatus from '@/data/useStatus'
import useGotchiChanneling from '@/data/useGotchiChanneling'
import useTokenPricesAavegotchi from '@/data/useTokenPricesAavegotchi'
import CryptoIcon from '@/common/CryptoIcon.vue'
import CryptoIcons from '@/common/CryptoIcons.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import DatePrecise from '@/common/DatePrecise.vue'
import EthAddress from '@/common/EthAddress.vue'
import SiteButton from '@/site/SiteButton.vue'
import SiteTable from '@/site/SiteTable.vue'
import SortToggle from '@/common/SortToggle.vue'
import LendingLandsIconLink from './LendingLandsIconLink.vue'
import LendingLastChanneledFetchStatus from './LendingLastChanneledFetchStatus.vue'
import tokens from '@/data/pockets/tokens.json'

const tokensList = Object.values(tokens)
const TOKEN_ADDRESSES = {
  FUD: tokensList.find(({ label }) => label === 'FUD').id,
  FOMO: tokensList.find(({ label }) => label === 'FOMO').id,
  ALPHA: tokensList.find(({ label }) => label === 'ALPHA').id,
  KEK: tokensList.find(({ label }) => label === 'KEK').id,
  GHST: tokensList.find(({ label }) => label === 'GHST').id
}

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'

export default {
  components: {
    CryptoIcon,
    CryptoIcons,
    DateFriendly,
    DatePrecise,
    EthAddress,
    SiteButton,
    SiteTable,
    SortToggle,
    LendingLandsIconLink,
    LendingLastChanneledFetchStatus
  },
  setup () {
    const { ghstPrices, fetchStatus: pricesStatus, fetchPrices } = useTokenPricesAavegotchi()
    fetchPrices()

    const BASE_CHANNELING = {
      FUD: 20,
      FOMO: 10,
      ALPHA: 5,
      KEK: 2
    }

    const {
      // resetResult,
      fetchGotchiChannelingStatuses,
      gotchiChannelingStatuses,
      fetchStatus: fetchChannelingStatus,
      lastFetchDate: lastFetchChannelingStatusDate,
      utcMidnight,
      utcMidnightTimestampMs
    } = useGotchiChanneling()

    // To test channeling reset rollover
    // setTimeout(resetResult, 10000)

    const { status, setLoading } = useStatus()
    const results = ref([])

    const fetchPageSize = ref(100)
    const filters = ref({
      upfrontMax: '',
      borrowerSplit: '',
      hours: '',
      kinship: '',
      noWhitelist: true,
      allAlchemica: true,
      tokens: {
        FUD: true,
        FOMO: true,
        ALPHA: true,
        KEK: true,
        GHST: false
      }
    })
    const filters2 = ref({
      isOpen: false,
      onlyChannelable: false
    })

    const results2 = computed(() => {
      if (!status.value.loaded) { return [] }
      if (fetchChannelingStatus.value.loaded && filters2.value.onlyChannelable) {
        return results.value.filter(result => gotchiChannelingStatuses.value.canChannel[result.gotchiTokenId])
      }
      return results.value
    })

    const tablePaging = ref({
      page: 0,
      pageSize: 50
    })

    const tableSort = ref({
      column: 'timeCreated',
      direction: 'desc'
    })

    const tableSort2 = ref({
      column: null,
      direction: 'desc'
    })

    const query = computed(() => {
      const f = filters.value
      let upfrontQuery = ''
      if (f.upfrontMax) {
        const upfrontNum = f.upfrontMax - 0
        if (!Number.isNaN(upfrontNum)) {
          const upfrontBigNum = new BigNumber(upfrontNum).times(10e17)
          upfrontQuery = `, upfrontCost_lte: "${upfrontBigNum}"`
        }
      }
      const borrowerSplitNum = f.borrowerSplit - 0
      const borrowerSplitQuery = !Number.isNaN(borrowerSplitNum) && borrowerSplitNum > 0 ? `, splitBorrower_gte: "${borrowerSplitNum}"` : ''
      const hoursNum = f.hours - 0
      const periodQuery = !Number.isNaN(hoursNum) && hoursNum > 0 ? `, period_gte: "${hoursNum * 60 * 60}"` : ''
      const kinshipNum = f.kinship - 0
      const kinshipQuery = !Number.isNaN(kinshipNum) && kinshipNum > 0 ? `, gotchiKinship_gte: "${kinshipNum}"` : ''
      let whitelistQuery = ''
      if (f.noWhitelist) {
        whitelistQuery = ', whitelistId: null'
      } else {
        // show whitelists, optionally filter by id
        if (f.whitelistId) {
          whitelistQuery = `, whitelistId: "${f.whitelistId}"`
        } else {
          whitelistQuery = ', whitelistId_not: null'
        }
      }
      let tokensToShare = []
      if (f.allAlchemica) {
        tokensToShare = [TOKEN_ADDRESSES.FUD, TOKEN_ADDRESSES.FOMO, TOKEN_ADDRESSES.ALPHA, TOKEN_ADDRESSES.KEK]
      } else {
        // custom selection of tokens
        for (const token of Object.keys(f.tokens)) {
          if (f.tokens[token]) {
            tokensToShare.push(TOKEN_ADDRESSES[token])
          }
        }
      }
      const tokensQuery = tokensToShare.length > 0 ? `, tokensToShare_contains: ${JSON.stringify(tokensToShare)}` : ''

      let orderQuery = ', orderBy: "timeCreated", orderDirection: "desc"'
      const sort = tableSort.value
      if (sort.column && sort.direction) {
        orderQuery = `, orderBy: "${sort.column}", orderDirection: "${sort.direction}"`
      }

      const query = `
      {gotchiLendings(first: ${fetchPageSize.value} ${orderQuery}, where: {
        timeAgreed: "0",
        cancelled: false,
        ${upfrontQuery}
        ${borrowerSplitQuery}
        ${periodQuery}
        ${whitelistQuery}
        ${tokensQuery}
        ${kinshipQuery}
      }) {
        id
        upfrontCost
        period
        tokensToShare
        gotchi {
          name
        }
        gotchiKinship
        timeCreated
        lender
        originalOwner
        splitBorrower
        gotchiTokenId
        whitelistId
      }}
      `
      // console.log('New query', query)
      return query
    })

    const fetchLendings = function () {
      const [isStale, setLoaded, setError] = setLoading()

      fetch(SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: query.value
        })
      })
        .then(async response => {
          if (isStale()) { console.log('Stale request, ignoring'); return }
          if (!response.ok) {
            setError('There was an error fetching lendings')
            return
          }
          const responseJson = await response.json()
          if (responseJson.data?.gotchiLendings) {
            results.value = responseJson.data.gotchiLendings.map((lending, index) => ({
              ...lending,
              tokensToShareMap: Object.fromEntries(
                lending.tokensToShare.map(tokenAddress => [tokenAddress, true])
              )
            }))
            // console.log('results', results.value)
            setLoaded()
          } else {
            setError('Unexpected response')
          }
        })
        .catch(error => {
          console.error(error)
          setError('There was an error fetching lendings')
        })
    }

    watch(
      () => status.value.loaded,
      loaded => {
        if (loaded) {
          fetchGotchiChannelingStatuses(results.value.map(result => result.gotchiTokenId))
        }
      }
    )

    fetchLendings()

    watch(
      () => query.value,
      fetchLendings
    )

    watch(
      () => ({
        pageSize: tablePaging.value.pageSize,
        results2: results2.value
      }),
      () => { tablePaging.value.page = 0 }
    )

    const secondarySortedResults = computed(() => {
      if (!channelingDetails.value || !tableSort2.value.column) {
        return results2.value
      }
      const column = tableSort2.value.column
      const direction = tableSort2.value.direction
      if (column.startsWith('channelingDetails')) {
        const field = column.split(' ')[1]
        return orderBy(results2.value, [row => channelingDetails.value[row.id]?.[field]], [direction])
      }
      return results2.value
    })

    const rowsToDisplay = computed(() => {
      const start = tablePaging.value.page * tablePaging.value.pageSize
      const end = start + tablePaging.value.pageSize
      return secondarySortedResults.value.slice(start, end)
    })

    const channelingSettings = ref({
      aaltarLevel: '1'
    })

    const channelingDetails = computed(() => {
      if (!fetchChannelingStatus.value.loaded || !pricesStatus.value.loaded) { return null }
      const channelingByLending = {}
      const nowMs = Date.now()
      const oneDayMs = 24 * 60 * 60 * 1000
      const nextResetMs = utcMidnightTimestampMs.value + oneDayMs
      for (const result of results.value) {
        // calculate how many channels are possible in rental period
        // given reset time and gotchi's current channeling status
        const canChannelNow = gotchiChannelingStatuses.value.canChannel[result.gotchiTokenId]
        const periodMs = result.period * 1000
        const potentialFinishMs = nowMs + periodMs
        let numChannelingsAfterReset = 0
        if (potentialFinishMs > nextResetMs) {
          const afterNextResetMs = potentialFinishMs - nextResetMs
          numChannelingsAfterReset = Math.ceil(afterNextResetMs / oneDayMs)
        }
        const numChannelings = (canChannelNow ? 1 : 0) + numChannelingsAfterReset

        const kinship = result.gotchiKinship
        const splitBorrower = result.splitBorrower
        const upfrontCost = new BigNumber(result.upfrontCost).div(10e17).toNumber()
        const tokensToShareMap = result.tokensToShareMap

        // calculate channeling yield
        const kinshipMultiplier = Math.sqrt(kinship / 50)
        const spilloverMultiplier = (50 - ((channelingSettings.value.aaltarLevel - 1) * 5)) / 100
        let ghstPerChannel = 0
        for (const token in BASE_CHANNELING) {
          if (tokensToShareMap[TOKEN_ADDRESSES[token]]) {
            ghstPerChannel += BASE_CHANNELING[token] * kinshipMultiplier * (1 - spilloverMultiplier) * ghstPrices.value[token]
          }
        }
        const ghstPerChannelAfterSplit = ghstPerChannel * (splitBorrower / 100)
        const netTotalGhst = (numChannelings * ghstPerChannelAfterSplit) - upfrontCost
        const netTotalGhstPerChannel = numChannelings > 0 ? netTotalGhst / numChannelings : 0
        channelingByLending[result.id] = {
          canChannelNow,
          numChannelings,
          numChannelingsAfterReset,
          // tokensToShareMap,
          // splitBorrower,
          // upfrontCost,
          // periodH: periodMs / (1000 * 60 * 60),
          // kinship,
          // kinshipMultiplier,
          // ghstPerChannel,
          // ghstPerChannelAfterSplit,
          netTotalGhst,
          netTotalGhstPerChannel
        }
      }
      // console.log({ channelingByLending })
      return channelingByLending
    })

    const friendlyDuration = function (periodString) {
      const hours = (periodString - 0) / (60 * 60)
      return `${hours.toFixed(4) - 0} hr${hours !== 1 ? 's' : ''}`
    }

    const friendlyGhst = function (upfrontCost) {
      const cost = new BigNumber(upfrontCost).div(10e17)
      return cost.decimalPlaces(4).toString()
    }

    return {
      fetchPageSize,
      filters,
      filters2,
      TOKEN_ADDRESSES,
      fetchLendings,
      status,
      setLoading,
      tablePaging,
      tableSort,
      tableSort2,
      results,
      results2,
      channelingSettings,
      fetchChannelingStatus,
      lastFetchChannelingStatusDate,
      gotchiChannelingStatuses,
      channelingDetails,
      utcMidnight,
      ghstPrices,
      rowsToDisplay,
      friendlyGhst,
      friendlyDuration
    }
  }
}
</script>

<style scoped>
  .lending-filters {
    max-width: fit-content;
    border-style: solid;
    border-color: var(--site-border-color--transparent);
  }
  .lending-filters > div {
    margin-bottom: 10px;
  }
  .lending-filters input[type=text] {
    width: 70px;
  }
  .shared-token-icon {
    opacity: 0.6;
  }

  .advanced-filters {
    max-width: fit-content;
    position: relative;
    border: 2px solid var(--site-border-color--transparent);
    padding: 10px 15px;
  }
  .advanced-filters > summary {
    max-width: max-content;

    position: relative;
    top: -20px;
    left: -5px;
    margin-bottom: -15px;

    background-color: var(--site-background-color);
  }

  .cannot-channel {
    color: var(--site-text-color--subtle);
    font-size: 0.9em;
  }
  .can-channel,
  .can-channel > div,
  .channeling-net,
  .channeling-net > div {
    position: relative;
    background-clip: padding-box; /* workaround for FF so cell borders display */
  }
  .can-channel::before,
  .channeling-net--profit::before,
  .channeling-net--loss::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(120, 235, 44, 0.2);
  }
  .channeling-net--loss::before {
    background-color: rgba(235, 120, 55, 0.2);
  }
</style>
