<template>
  <div>
    <h2>Gotchi Lending Activity</h2>
    <div>
      <div style="margin-bottom: 30px;">
        Here you can see recently-agreed lendings from
        <a
          href="https://app.aavegotchi.com/lending"
          target="_blank"
          rel="noopener nofollow"
        >
          Gotchi Lending
          <SiteIcon name="open-window" />
        </a>
        <span style="font-size: 0.9em;">
          (note that on the official site, you need to connect your wallet to see listings).
        </span>
      </div>

      <div
        class="lending-filters"
        style="margin-bottom: 30px;"
      >
        <div>
          <label>
            <input
              v-model="withWhitelist"
              type="checkbox"
            />
            whitelisted (private) lendings only
          </label>
        </div>
        <div>
          <label>
            <input
              v-model="onlyZeroUpfront"
              type="checkbox"
            />
            0 GHST upfront only
          </label>
        </div>
        <div>
          <label>
            Owner % &ge;
            <input
              v-model.lazy="ownerSplit"
              type="text"
            />
          </label>
          <span style="font-size: 0.9em">
            (press Enter or click outside field to search)
          </span>
        </div>
        <div>
          <label>
            Borrower % &ge;
            <input
              v-model.lazy="borrowerSplit"
              type="text"
            />
          </label>
        </div>
        <div>
          <label>
            Other % &ge;
            <input
              v-model.lazy="otherSplit"
              type="text"
            />
          </label>
        </div>
        <div>
          <label>
            Duration &ge;
            <input
              v-model.lazy="hours"
              type="text"
            />
            hours
          </label>
        </div>
      </div>

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
            Here are the latest {{ fetchPageSize }}
            <template v-if="withWhitelist">
              whitelisted (private)
            </template>
            <template v-else>
              public (no whitelist)
            </template>
            lendings.
            <SiteButton
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
              Fetch latest lendings again
            </SiteButton>
          </div>

          <SiteTable
            v-model:page="tablePaging.page"
            v-model:pageSize="tablePaging.pageSize"
            :numResults="results.length"
            itemsLabel="listings"
          >
            <template #headers>
              <tr>
                <th>Listing ID</th>
                <th>Lending Started</th>
                <th>Listing Posted</th>
                <th>Lending Duration</th>
                <th>Upfront GHST</th>
                <th>Owner %</th>
                <th>Borrower %</th>
                <th>Other %</th>
                <th v-if="withWhitelist">
                  Whitelist
                </th>
                <th>Gotchi</th>
                <th>Owner</th>
                <th>Borrower</th>
              </tr>
            </template>
            <template #rows>
              <tr
                v-for="result in rowsToDisplay"
                :key="result.id"
              >
                <td>
                  <a
                    :href="`https://app.aavegotchi.com/lending/${result.id}`"
                    target="_blank"
                  >
                    {{ result.id }}
                  </a>
                </td>
                <td>
                  <DateFriendly
                    :date="new Date(result.timeAgreed * 1000)"
                  />
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
                  {{ result.splitOwner }}
                </td>
                <td>
                  {{ result.splitBorrower }}
                </td>
                <td>
                  {{ result.splitOther }}
                </td>
                <td v-if="withWhitelist">
                  {{ result.whitelistId }}
                </td>
                <td>
                  <a
                    :href="`https://app.aavegotchi.com/gotchi/${result.gotchiTokenId}`"
                    target="_blank"
                  >
                    {{ result.gotchi.name }}
                    #{{ result.gotchiTokenId }}
                  </a>
                </td>
                <td>
                  <EthAddress icon :address="result.lender" />
                </td>
                <td>
                  <EthAddress icon :address="result.borrower" />
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
import DateFriendly from '@/components/DateFriendly.vue'
import EthAddress from '@/components/EthAddress.vue'
import SiteTable from '@/components/SiteTable.vue'

const SUBGRAPH_URL = 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-four'

export default {
  components: {
    DateFriendly,
    EthAddress,
    SiteTable
  },
  setup () {
    const { status, setLoading } = useStatus()
    const results = ref([])

    const tablePaging = ref({
      page: 0,
      pageSize: 25
    })

    const withWhitelist = ref(false)
    const onlyZeroUpfront = ref(false)
    const fetchPageSize = ref(100)
    const ownerSplit = ref('')
    const borrowerSplit = ref('')
    const otherSplit = ref('')
    const hours = ref('')

    const query = computed(() => {
      const whitelistQuery = `, whitelistId${withWhitelist.value ? '_not' : ''}: null`
      const upfrontQuery = onlyZeroUpfront.value ? ', upfrontCost: "0"' : ''
      const ownerSplitNum = ownerSplit.value - 0
      const ownerSplitQuery = !Number.isNaN(ownerSplitNum) && ownerSplitNum > 0 ? `, splitOwner_gte: "${ownerSplitNum}"` : ''
      const borrowerSplitNum = borrowerSplit.value - 0
      const borrowerSplitQuery = !Number.isNaN(borrowerSplitNum) && borrowerSplitNum > 0 ? `, splitBorrower_gte: "${borrowerSplitNum}"` : ''
      const otherSplitNum = otherSplit.value - 0
      const otherSplitQuery = !Number.isNaN(otherSplitNum) && otherSplitNum > 0 ? `, splitOther_gte: "${otherSplitNum}"` : ''
      const hoursNum = hours.value - 0
      const periodQuery = !Number.isNaN(hoursNum) && hoursNum > 0 ? `, period_gte: "${hoursNum * 60 * 60}"` : ''
      const query = `
      {gotchiLendings(first: ${fetchPageSize.value}, orderBy: "timeAgreed", orderDirection: "desc", where: { timeAgreed_not: "0", cancelled: false, ${whitelistQuery} ${upfrontQuery} ${ownerSplitQuery} ${borrowerSplitQuery} ${otherSplitQuery} ${periodQuery} }) {
        id
        rentDuration
        upfrontCost
        period
        gotchi {
          name
        }
        timeCreated
        timeAgreed
        lender
        borrower
        splitOther
        splitBorrower
        splitOwner
        gotchiTokenId
        whitelistId
      }}
      `
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
          setError('There was an error fetching parcels')
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
      return `${hours} hr${hours !== 1 ? 's' : ''}`
    }

    const friendlyGhst = function (upfrontCost) {
      const cost = new BigNumber(upfrontCost).div(10e17)
      return `${cost.toString()} GHST`
    }

    return {
      tablePaging,
      fetchPageSize,
      withWhitelist,
      onlyZeroUpfront,
      ownerSplit,
      borrowerSplit,
      otherSplit,
      hours,
      status,
      fetchLendings,
      results,
      rowsToDisplay,
      friendlyDuration,
      friendlyGhst
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
</style>
