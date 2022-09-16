<template>
  <div>
    <h2>Gotchi Lending Exports</h2>
    <div>
      <div style="margin-bottom: 30px;">
        This page will fetch current and historical lending data and let you save it as CSV for further analysis (in Excel or any spreadsheet).
        <br>It does <b>NOT</b> include unclaimed pocket balances, or alchemica that is still in-game and hasn't been withdrawn through a vortex.
        <br>
        <br>All the following filters are optional, though please be considerate of the subgraphs if you're exporting a lot :)
      </div>

      <div style="margin-bottom: 15px;">
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

      <div style="margin-bottom: 30px;">
        <div class="site-alertbox site-alertbox--warning">
          <SiteIcon name="warning-triangle" />
          <div>
            Due to a bug with lending data between 13-18 May 2022, the reported <code>timeEnded</code> (and therefore <code>actualPeriod</code>) are likely to be <b>wrong</b> for lendings that finished during this period, and also for many of the first 25000 lendings (these now incorrectly appear to have finished between 13-18 May).
            <br>Hopefully this will be fixed in the subgraph at some point.
          </div>
        </div>
      </div>

      <form
        class="lending-filters"
        style="margin-bottom: 30px;"
        @submit.prevent="fetchData"
      >
        <div>
          <label>
            Lender Address
            <input
              v-model="filters.lenderAddress"
              type="text"
              :disabled="!!filters.vaultOwnerAddress"
            />
          </label>
        </div>
        <div>
          <label>
            Borrower Address
            <input
              v-model="filters.borrowerAddress"
              type="text"
            />
          </label>
        </div>
        <div>
          <label>
            Third-Party Address
            <input
              v-model="filters.thirdPartyAddress"
              type="text"
            />
          </label>
        </div>
        <div>
          <label>
            "Original Owner" Address
            <input
              v-model="filters.originalOwnerAddress"
              type="text"
              :disabled="!!filters.vaultOwnerAddress"
            />
          </label>
        </div>
        <div>
          <label>
            Vault Depositor Address
            <input
              v-model="filters.vaultOwnerAddress"
              type="text"
            />
          </label>
        </div>
        <div>
          <label>
            Whitelist ID
            <input
              v-model="filters.whitelistId"
              type="text"
            />
          </label>
        </div>
        <div>
          Lendings posted between:
          <label>
            <input
              v-model="filters.startDate"
              type="date"
            />
            <span class="sr-only">
              start date
            </span>
          </label>
          and
          <label>
            <input
              v-model="filters.endDate"
              type="date"
            />
            <span class="sr-only">
              end date
            </span>
          </label>
        </div>
        <div>
          <div
            v-if="filtersEmpty"
            style="margin: 15px 0;"
            class="site-alertbox site-alertbox--warning"
          >
            <SiteIcon name="warning-triangle" />
            Warning: no filters are set, which will export ALL lendings!
          </div>
        </div>
        <SiteButton type="submit">
          Fetch Data
        </SiteButton>
      </form>

      <template v-if="status.loading">
        Fetching, please wait... (this might take a while)
      </template>
      <template v-if="status.error">
        Sorry, there was an error fetching data.
      </template>
      <template v-if="status.loaded">
        <template v-if="!lendings || !lendings.length">
          No lendings found.
        </template>
        <template v-else>
          {{ lendings.length }} lendings found.

          <br>
          <br>
          <LendingsExport
            :lendings="lendings"
            :earningsById="earnings"
          />

          <br>
          <br>
          Note: this data is unlikely to be 100% accurate, it's using the best info I can find at this time. Don't rely on it for your tax returns ;) In future I'm sure we'll have more authoritative and complete data available from Pixelcraft.
        </template>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import BigNumber from 'bignumber.js'
import orderBy from 'lodash.orderby'
import add from 'date-fns/add'
import isValid from 'date-fns/isValid'
import parseISO from 'date-fns/parseISO'
import useStatus from '@/data/useStatus'
import LendingsExport from './LendingsExport.vue'
import SiteIcon from '@/site/SiteIcon.vue'

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
const LENDING_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/sudeepb02/gotchi-lending'
const FETCH_PAGE_SIZE = 1000
const VAULT_ADDRESS = '0xdd564df884fd4e217c9ee6f65b4ba6e5641eac63'

export default {
  components: {
    LendingsExport,
    SiteIcon
  },
  setup () {
    const { status: lendingsStatus, setLoading: setLendingsLoading } = useStatus()
    const { status: earningsStatus, setLoading: setEarningsLoading } = useStatus()

    const status = computed(() => ({
      loading: lendingsStatus.value.loading || earningsStatus.value.loading,
      error: lendingsStatus.value.error || earningsStatus.value.error,
      loaded: lendingsStatus.value.loaded && earningsStatus.value.loaded
    }))

    const lendings = ref([])
    const earnings = ref([])

    const filters = ref({
      lenderAddress: null,
      borrowerAddress: null,
      thirdPartyAddress: null,
      originalOwnerAddress: null,
      vaultOwnerAddress: null,
      whitelistId: null,
      startDate: null,
      endDate: null
    })

    const filtersEmpty = computed(() => {
      const f = filters.value
      return !f.lenderAddress && !f.borrowerAddress && !f.thirdPartyAddress && !f.vaultOwnerAddress && !f.whitelistId && !f.startDate && !f.endDate
    })

    const fetchLendings = function () {
      const [isStale, setLoaded, setError] = setLendingsLoading()
      let lastIdNum = 0
      let fetchedLendings = []

      const { lenderAddress, borrowerAddress, thirdPartyAddress, originalOwnerAddress, vaultOwnerAddress, whitelistId, startDate, endDate } = filters.value
      const whitelistQuery = whitelistId ? `, whitelistId: "${whitelistId}"` : ''
      const lenderQuery = lenderAddress && !vaultOwnerAddress ? `, lender: "${lenderAddress.toLowerCase()}"` : ''
      const borrowerQuery = borrowerAddress ? `, borrower: "${borrowerAddress.toLowerCase()}"` : ''
      const thirdPartyQuery = thirdPartyAddress ? `, thirdPartyAddress: "${thirdPartyAddress.toLowerCase()}"` : ''
      const originalOwnerQuery = originalOwnerAddress && !vaultOwnerAddress ? `, originalOwner: "${originalOwnerAddress.toLowerCase()}"` : ''
      const vaultOwnerQuery = vaultOwnerAddress ? `, originalOwner: "${vaultOwnerAddress.toLowerCase()}", lender: "${VAULT_ADDRESS}"` : ''

      // Interpret dates in local timezone, and also export them that way.
      // Treat range as inclusive
      // Timestamp for specified date is at the beginning of the day.
      const startDateLocal = parseISO(startDate)
      let endDateLocal = parseISO(endDate)
      let startDateQuery = ''
      let endDateQuery = ''
      if (isValid(startDateLocal)) {
        startDateQuery = `, timeCreated_gte: ${startDateLocal.getTime() / 1000}`
      }
      if (isValid(endDateLocal)) {
        endDateLocal = add(endDateLocal, { days: 1 })
        endDateQuery = `, timeCreated_lt: ${endDateLocal.getTime() / 1000}`
      }

      const fetchFromSubgraph = function () {
        const query = `
        {gotchiLendings(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: {
          id_gt: ${lastIdNum},
          cancelled: false,
          timeAgreed_gt: 0
          ${whitelistQuery}
          ${lenderQuery}
          ${borrowerQuery}
          ${thirdPartyQuery}
          ${originalOwnerQuery}
          ${vaultOwnerQuery}
          ${startDateQuery}
          ${endDateQuery}
        }) {
          id
          upfrontCost
          period
          tokensToShare

          gotchiTokenId
          gotchi {
            name
          }
          gotchiKinship

          timeCreated
          timeAgreed
          lastClaimed
          completed

          originalOwner
          lender
          borrower
          thirdPartyAddress
          splitOther
          splitBorrower
          splitOwner
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
              fetchedLendings = fetchedLendings.concat(responseJson.data.gotchiLendings)

              if (responseJson.data.gotchiLendings.length < FETCH_PAGE_SIZE) {
                // finished fetching all pages
                lendings.value = orderBy(
                  fetchedLendings.map(item => {
                    return {
                      ...item,
                      gotchiName: item.gotchi.name,
                      periodHours: item.period / (60 * 60),
                      timeAgreed: item.timeAgreed ? new Date(item.timeAgreed * 1000) : null,
                      timeCreated: item.timeCreated ? new Date(item.timeCreated * 1000) : null,
                      lastClaimed: item.lastClaimed && item.lastClaimed ? new Date(item.lastClaimed * 1000) : null,
                      upfrontCost: new BigNumber(item.upfrontCost).div(10e17).toString()
                    }
                  }),
                  ['timeCreated'],
                  ['asc']
                )
                console.log('listings', lendings.value)
                setLoaded()
                return
              }
              // fetch the next page of results
              lastIdNum = responseJson.data.gotchiLendings[responseJson.data.gotchiLendings.length - 1].id - 0
              fetchFromSubgraph()
            } else {
              setError('Unexpected response')
            }
          })
          .catch(error => {
            console.error(error)
            setError('There was an error fetching lendings')
          })
      }

      fetchFromSubgraph()
    }

    const fetchEarnings = function () {
      const [isStale, setLoaded, setError] = setEarningsLoading()
      let fetchedLendings = []
      const lendingIds = lendings.value.map(({ id }) => id)
      let nextIndex = 0

      const fetchFromSubgraph = function () {
        const idsToFetch = lendingIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
        const query = `{
          gotchiLendings(first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(idsToFetch)} }) {
            id
            actualPeriod,
            endTimestamp
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
                    const {
                      id,
                      endTimestamp,
                      actualPeriod,
                      claimedFUD,
                      claimedFOMO,
                      claimedALPHA,
                      claimedKEK
                    } = item
                    return [
                      id,
                      {
                        timeEnded: endTimestamp && endTimestamp !== '0' ? new Date(endTimestamp * 1000) : null,
                        actualPeriod: actualPeriod !== '0' ? actualPeriod : null,
                        actualPeriodHours: actualPeriod !== '0' ? actualPeriod / (60 * 60) : null,
                        claimedFUD: new BigNumber(claimedFUD).div(10e17).toString(),
                        claimedFOMO: new BigNumber(claimedFOMO).div(10e17).toString(),
                        claimedALPHA: new BigNumber(claimedALPHA).div(10e17).toString(),
                        claimedKEK: new BigNumber(claimedKEK).div(10e17).toString()
                      }
                    ]
                  })
                )
                console.log('earnings', earnings.value)
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
      () => lendingsStatus.value.loaded,
      () => {
        if (lendingsStatus.value.loaded) {
          fetchEarnings()
        }
      }
    )

    const fetchData = function () {
      fetchLendings()
    }

    return {
      filters,
      filtersEmpty,
      fetchData,
      status,
      lendings,
      earnings
    }
  }
}
</script>

<style scoped>
  .lending-filters > div {
    margin-bottom: 10px;
  }
  .lending-filters input[type=text] {
    width: 20em;
  }
</style>
