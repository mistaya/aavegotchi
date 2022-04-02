<template>
  <div>
    <h1>Gotchi lending activity</h1>
    <div>
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
            Here are the latest {{ fetchPageSize }} lendings.
            <button
              type="button"
              @click="fetchPageSize = fetchPageSize === 100 ? 1000 : 100"
            >
              Show
              {{ fetchPageSize === 100 ? 1000 : 100 }}
            </button>
          </div>
          <div style="margin-bottom: 10px">
            <label>
              <input
                v-model="withWhitelist"
                type="checkbox"
              />
              whitelisted (private) lendings only
            </label>
          </div>
          <div style="margin-bottom: 10px">
            <label>
              <input
                v-model="onlyZeroUpfront"
                type="checkbox"
              />
              0 GHST upfront only
            </label>
          </div>
          <div style="margin-top: 20px; margin-bottom: 20px;">
            <button
              type="button"
              @click="fetchLendings"
            >
              Fetch latest lendings again
            </button>
          </div>

          <table>
            <thead>
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
            </thead>
            <tbody>
              <tr
                v-for="result in results"
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
            </tbody>
          </table>
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import { ref, watch } from 'vue'
import useStatus from '@/data/useStatus'
import DateFriendly from '@/components/DateFriendly.vue'
import EthAddress from '@/components/EthAddress.vue'

const SUBGRAPH_URL = 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-two'

export default {
  components: {
    DateFriendly,
    EthAddress
  },
  setup () {
    const { status, setLoading } = useStatus()
    const results = ref([])
    const withWhitelist = ref(false)
    const onlyZeroUpfront = ref(false)
    const fetchPageSize = ref(100)

    const fetchLendings = function () {
      const [isStale, setLoaded, setError] = setLoading()
      const whitelistQuery = `, whitelistId${withWhitelist.value ? '_not' : ''}: null`
      const upfrontQuery = onlyZeroUpfront.value ? ', upfrontCost: "0"' : ''
      const query = `
      {gotchiLendings(first: ${fetchPageSize.value}, orderBy: "timeAgreed", orderDirection: "desc", where: { timeAgreed_not: null ${whitelistQuery} ${upfrontQuery} }) {
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
      fetch(SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query
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
            console.log('results', results.value)
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
      () => [fetchPageSize.value, withWhitelist.value, onlyZeroUpfront.value],
      fetchLendings
    )

    const friendlyDuration = function (periodString) {
      const hours = (periodString - 0) / (60 * 60)
      return `${hours} hrs`
    }

    const friendlyGhst = function (upfrontCost) {
      const cost = new BigNumber(upfrontCost).div(10e17)
      return `${cost.toString()} GHST`
    }

    return {
      fetchPageSize,
      withWhitelist,
      onlyZeroUpfront,
      status,
      fetchLendings,
      results,
      friendlyDuration,
      friendlyGhst
    }
  }
}
</script>

<style scoped>
  table td, th {
    text-align: center;
    padding: 5px 10px;
  }
  table thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--site-background-color--transparent);
    color: var(--site-text-color--subtle);
  }
  table tr:nth-child(even) td {
    background: var(--site-background-color--alternate);
  }
</style>
