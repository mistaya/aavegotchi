<template>
  <div>
    <CryptoIcons />
    <h2>Gotchis Available to Borrow</h2>
    <div>
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

          <label style="margin-left: 20px; white-space: nowrap;">
            <input
              :checked="filters.upfrontMax === '0'"
              type="checkbox"
              @click="filters.upfrontMax === '0' ? filters.upfrontMax = '' : filters.upfrontMax = '0'"
            />
            No upfront cost only
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
      </fieldset>

      <div class="site-alertbox site-alertbox--warning" style="margin-bottom: 20px">
        <SiteIcon name="warning-triangle" />
        <div>
          <b>WARNING:</b> there is currently NO alchemica dropping in the gotchiverse: the April playdrop event is finished.
          <br>
          <br>You can still borrow a gotchi to try out the gotchiverse, craft LE Tiles, or play minigames, but <b>there is nothing to earn right now</b>.
          <br>
          <br><b>May 18th onwards</b> is when Alchemica will start dropping frequently again, but it will be different, as the real game will be starting!
          <br>Join the <a href="https://discord.gg/aavegotchi" target="_blank" rel="noopener">Discord</a> and read the <a href="https://blog.aavegotchi.com/" target="_blank" rel="noopener">official blog</a> to keep up-to-date with announcements.
        </div>
      </div>
      <br>

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
            <SiteButton
              v-if="results.length >= 100"
              type="button"
              @click="fetchPageSize = fetchPageSize === 100 ? 1000 : 100"
            >
              Fetch max
              {{ fetchPageSize === 100 ? 1000 : 100 }}
            </SiteButton>
          </div>

          <div style="margin-top: 30px; margin-bottom: 20px;">
            <SiteButton
              type="button"
              @click="fetchLendings"
            >
              Fetch lending offers again
            </SiteButton>
          </div>

          <SiteTable
            v-model:page="tablePaging.page"
            v-model:pageSize="tablePaging.pageSize"
            :numResults="results.length"
            itemsLabel="listings"
            :scrollingBreakpoint="1000"
          >
            <template #headers>
              <tr>
                <th>Listing ID</th>
                <th>
                  Posted
                  <SortToggle
                    :sort="tableSort.column === 'timeCreated' ? tableSort.direction : null"
                    @update:sort="tableSort.column = $event ? 'timeCreated' : null; tableSort.direction = $event"
                  />
                </th>
                <th>
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
                <th>Gotchi</th>
                <th>Owner</th>
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
                <td>
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
                <td>
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
                  <EthAddress icon :address="result.lender" />
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
import { ref, computed, watch } from 'vue'
import useStatus from '@/data/useStatus'
import CryptoIcon from '@/components/CryptoIcon.vue'
import CryptoIcons from '@/components/CryptoIcons.vue'
import DateFriendly from '@/components/DateFriendly.vue'
import EthAddress from '@/components/EthAddress.vue'
import SiteButton from '@/components/SiteButton.vue'
import SiteTable from '@/components/SiteTable.vue'
import SortToggle from '@/components/SortToggle.vue'
import tokens from '@/data/pockets/tokens.json'

const tokensList = Object.values(tokens)
const TOKEN_ADDRESSES = {
  FUD: tokensList.find(({ label }) => label === 'FUD').id,
  FOMO: tokensList.find(({ label }) => label === 'FOMO').id,
  ALPHA: tokensList.find(({ label }) => label === 'ALPHA').id,
  KEK: tokensList.find(({ label }) => label === 'KEK').id,
  GHST: tokensList.find(({ label }) => label === 'GHST').id
}

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending'

export default {
  components: {
    CryptoIcon,
    CryptoIcons,
    DateFriendly,
    EthAddress,
    SiteButton,
    SiteTable,
    SortToggle
  },
  setup () {
    const { status, setLoading } = useStatus()
    const results = ref([])

    const fetchPageSize = ref(100)
    const filters = ref({
      upfrontMax: '',
      borrowerSplit: '',
      hours: '',
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

    const tablePaging = ref({
      page: 0,
      pageSize: 50
    })

    const tableSort = ref({
      column: 'timeCreated',
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
      }) {
        id
        upfrontCost
        period
        tokensToShare
        gotchi {
          name
        }
        timeCreated
        lender
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
            results.value = responseJson.data.gotchiLendings
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

    fetchLendings()

    watch(
      () => query.value,
      fetchLendings
    )

    watch(
      () => ({
        pageSize: tablePaging.value.pageSize,
        results: results.value
      }),
      () => { tablePaging.value.page = 0 }
    )

    const rowsToDisplay = computed(() => {
      const start = tablePaging.value.page * tablePaging.value.pageSize
      const end = start + tablePaging.value.pageSize
      return results.value.slice(start, end)
    })

    const friendlyDuration = function (periodString) {
      const hours = (periodString - 0) / (60 * 60)
      return `${hours.toFixed(4) - 0} hr${hours !== 1 ? 's' : ''}`
    }

    const friendlyGhst = function (upfrontCost) {
      const cost = new BigNumber(upfrontCost).div(10e17)
      return `${cost.decimalPlaces(4).toString()} GHST`
    }

    return {
      fetchPageSize,
      filters,
      TOKEN_ADDRESSES,
      fetchLendings,
      status,
      setLoading,
      tablePaging,
      tableSort,
      results,
      rowsToDisplay,
      friendlyGhst,
      friendlyDuration
    }
  }
}
</script>

<style scoped>
  .lending-filters > div {
    margin-bottom: 10px;
  }
  .lending-filters input[type=text] {
    width: 70px;
  }
  .shared-token-icon {
    opacity: 0.6;
  }
</style>
