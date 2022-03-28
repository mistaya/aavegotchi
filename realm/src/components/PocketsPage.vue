<template>
  <div>
    <CryptoIcons />

    <h1>Gotchi Pockets</h1>

    <div>
      <DataFetcherGotchis />
      <DataFetcherGotchiBalances />
      <DataFetcherEthereumGotchiOwners />
      <DataFetcherVaultOwners />
      <DataFetcherPrices />
    </div>

    <template v-if="gotchisFetchStatus.loaded">
      <div class="dashboard">

        <div
          class="dashboard-row"
          style="margin-bottom: 50px;"
        >
          <template v-if="hasBalances">
            <div
              v-for="(token, tokenIndex) in balanceTokens"
              :key="token.id"
              class="dashboard-metric site-card"
            >
              <div class="dashboard-text dashboard-text--primary">
                <div style="display: flex; align-items: center; justify-content: center;">
                  <CryptoIcon
                    :address="token.id"
                    :size="40"
                    style="margin-right: 10px"
                  />
                  <div>{{ token.label }} in Pockets</div>
                </div>
              </div>
              <div class="dashboard-number dashboard-number--primary">
                <NumberDisplay
                  :number="balanceTotals[tokenIndex].total"
                />
                {{ token.label }}
              </div>
              <div
                v-if="hasPrices"
                class="dashboard-number dashboard-number--secondary"
              >
                <i v-if="balanceTotals[tokenIndex].usdTotal === null">
                  (USD price unknown)
                </i>
                <NumberDisplay
                  v-else
                  :number="balanceTotals[tokenIndex].usdTotal"
                  usd
                />
              </div>
              <div class="dashboard-text dashboard-text--secondary">
                in <NumberDisplay :number="balanceTotals[tokenIndex].numGotchis" /> gotchis
                <br>
                (average
                <template v-if="hasPrices && balanceTotals[tokenIndex].meanUsd !== null">
                  <NumberDisplay
                    :number="balanceTotals[tokenIndex].meanUsd"
                    usd
                  />
                  /
                </template>
                  <NumberDisplay
                    :number="balanceTotals[tokenIndex].mean"
                  />
                {{ token.label }})
                <br>
                <br>
                Balances fetched
                <DateFriendly :date="balanceTotals[tokenIndex].lastFetchDate" />
              </div>
            </div>
          </template>
        </div>

        <div
          v-if="hasPrices"
          class="dashboard-row"
        >
          <div class="dashboard-metric site-card">
            <div class="dashboard-text dashboard-text--primary">
              Spirit Force
            </div>
            <div class="dashboard-number dashboard-number--primary">
              <NumberDisplay
                :number="dashboardDisplayMode == 'all' ? grandTotals.usdTotal : grandTotals.usdTotalLocked"
                usd
              />
            </div>
            <div class="dashboard-text dashboard-text--secondary">
              of different collaterals
              in <NumberDisplay :number="grandTotals.numGotchis" /> gotchis
              <br>
              (average
                <NumberDisplay
                  :number="dashboardDisplayMode == 'all' ? grandTotals.meanUsd : grandTotals.meanUsdLocked"
                  usd
                />)
            </div>
          </div>
        </div>

        <div class="dashboard-controls">
          <div class="dashboard-controls__modes">
            Show totals for
            <SiteButton
              type="button"
              class="dashboard-controls__mode"
              :aria-pressed="`${dashboardDisplayMode === 'all'}`"
              @click="dashboardDisplayMode = 'all'"
            >
              All (actual)
            </SiteButton>

            or

            <SiteButton
              type="button"
              class="dashboard-controls__mode"
              :aria-pressed="`${dashboardDisplayMode === 'minimum'}`"
              @click="dashboardDisplayMode = 'minimum'"
            >
              Minimum (locked)
            </SiteButton>
            Collateral
          </div>
        </div>

        <div class="dashboard-row">
          <div
            v-for="item in collateralTotalsWithPriceOrdered"
            :key="item.collateral.id"
            class="dashboard-metric site-card"
          >
            <CryptoIcon
              :address="item.collateral.id"
              :size="40"
            />
            <div class="dashboard-number dashboard-number--primary">
              <NumberDisplay :number="dashboardDisplayMode == 'all' ? item.total : item.totalLocked" />
              {{ item.collateral.label }}
            </div>
            <div
              v-if="hasPrices"
              class="dashboard-number dashboard-number--secondary"
            >
              <NumberDisplay
                :number="dashboardDisplayMode == 'all' ? item.usdTotal : item.usdTotalLocked"
                usd
              />
            </div>
            <div class="dashboard-text dashboard-text--secondary">
              in <NumberDisplay :number="item.numGotchis" /> gotchis
              <template v-if="hasPrices">
                <br>
                (average
                  <NumberDisplay
                    :number="dashboardDisplayMode == 'all' ? item.meanUsd : item.meanUsdLocked"
                    usd
                  />)
              </template>
            </div>
          </div>
        </div>
      </div>

      <div class="gotchis-table-filters">
        <form @submit.prevent="gotchisQuery = formQuery">
          <label>
            Search by gotchi ID, name, or owner address:
            <input
              v-model="formQuery"
              type="text"
            />
            <SiteButton type="submit">
              Search
            </SiteButton>
          </label>
        </form>
      </div>
      <GotchisTable
        v-model:page="gotchisPaging.page"
        v-model:pageSize="gotchisPaging.pageSize"
        :numResults="numFilteredGotchis"
      >
        <template #headers>
          <tr>
            <th>
              Gotchi ID
              <SortToggle
                :sort="gotchisSort.column === 'idNum' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'idNum' : null; gotchisSort.direction = $event"
              />
            </th>
            <th>
              Name
              <SortToggle
                :sort="gotchisSort.column === 'name' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'name' : null; gotchisSort.direction = $event"
              />
            </th>
            <th>
              Owner
              <SortToggle
                :sort="gotchisSort.column === 'owner' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'owner' : null; gotchisSort.direction = $event"
              />
              <div v-if="hasVaultOwners || hasEthereumGotchiOwners">
                True Owner
                <SortToggle
                  :sort="gotchisSort.column === 'trueOwner' ? gotchisSort.direction : null"
                  @update:sort="gotchisSort.column = $event ? 'trueOwner' : null; gotchisSort.direction = $event"
                />
              </div>
            </th>
            <th>
              Collateral
              <SortToggle
                :sort="gotchisSort.column === 'collateral' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'collateral' : null; gotchisSort.direction = $event"
              />
            </th>
            <th>
              Minimum Collateral
              <SortToggle
                v-if="hasPrices"
                :sort="gotchisSort.column === 'minimumStake' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'minimumStake' : null; gotchisSort.direction = $event"
              />
            </th>
            <th>
              Staked Collateral
              <SortToggle
                v-if="hasPrices"
                :sort="gotchisSort.column === 'stakedAmount' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'stakedAmount' : null; gotchisSort.direction = $event"
              />
            </th>
            <th>
              Excess Collateral
              <SortToggle
                v-if="hasPrices"
                :sort="gotchisSort.column === 'excessStake' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'excessStake' : null; gotchisSort.direction = $event"
              />
            </th>
            <template v-if="hasBalances">
              <th
                v-for="(token, tokenIndex) in balanceTokens"
                :key="token.id"
              >
                {{ token.label }}
                <SortToggle
                  :sort="gotchisSort.column === `tokenBalance:${tokenIndex}` ? gotchisSort.direction : null"
                  @update:sort="gotchisSort.column = $event ? `tokenBalance:${tokenIndex}` : null; gotchisSort.direction = $event"
                />
              </th>
            </template>
            <th>Escrow Address</th>
          </tr>
        </template>

        <template #rows>
          <tr
            v-for="gotchi in gotchisToDisplay"
            :key="gotchi.id"
          >
            <td>
              <a
                :href="`https://app.aavegotchi.com/gotchi/${gotchi.id}`"
                target="_blank"
              >
                {{ gotchi.id }}
              </a>
            </td>
            <td>
              {{ gotchi.name }}
            </td>
            <td>
              <EthAddress
                :address="gotchi.owner"
                icon
              />
              <div v-if="hasVaultOwners && vaultOwners[gotchi.id]">
                <EthAddress
                  :address="vaultOwners[gotchi.id]"
                  icon
                />
              </div>
              <div v-else-if="hasEthereumGotchiOwners && ethereumGotchiOwners[gotchi.id]">
                <EthAddress
                  :address="ethereumGotchiOwners[gotchi.id]"
                  icon
                />
              </div>
            </td>
            <td>
              {{ gotchi.collateral }}
            </td>
            <td>
              <NumberDisplay :number="gotchi.minimumStake" />
              <span class="usd-value">(<NumberDisplay
                v-if="hasPrices"
                :number="gotchisUsdValues[gotchi.id].minimumStake"
                usd
              />)</span>
            </td>
            <td>
              <NumberDisplay :number="gotchi.stakedAmount" />
              <span class="usd-value">(<NumberDisplay
                v-if="hasPrices"
                :number="gotchisUsdValues[gotchi.id].stakedAmount"
                usd
              />)</span>
            </td>
            <td>
              <NumberDisplay :number="gotchi.excessStake" />
              <span class="usd-value">(<NumberDisplay
                v-if="hasPrices"
                :number="gotchisUsdValues[gotchi.id].excessStake"
                usd
              />)</span>
            </td>
            <template v-if="hasBalances">
              <td
                v-for="(token, tokenIndex) in balanceTokens"
                :key="token.id"
              >
                <NumberDisplay
                  v-if="balances[gotchi.id]"
                  :number="balances[gotchi.id][tokenIndex] || 0"
                />
              </td>
            </template>
            <td>
              <EthAddress :address="gotchi.escrow" polygonscan />
            </td>
          </tr>
        </template>
      </GotchisTable>
    </template>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import orderBy from 'lodash.orderby'
import BigNumber from 'bignumber.js'
import useTokenPrices from '@/data/useTokenPrices'
import useGotchis from '@/data/useGotchis'
import useGotchiBalances from '@/data/useGotchiBalances'
import useEthereumGotchiOwners from '@/data/useEthereumGotchiOwners'
import useVaultOwners from '@/data/useVaultOwners'
import DataFetcherGotchis from './DataFetcherGotchis.vue'
import DataFetcherGotchiBalances from './DataFetcherGotchiBalances.vue'
import DataFetcherPrices from './DataFetcherPrices.vue'
import DataFetcherEthereumGotchiOwners from './DataFetcherEthereumGotchiOwners.vue'
import DataFetcherVaultOwners from './DataFetcherVaultOwners.vue'
import CryptoIcons from './CryptoIcons.vue'
import CryptoIcon from './CryptoIcon.vue'
import DateFriendly from './DateFriendly.vue'
import EthAddress from './EthAddress.vue'
import GotchisTable from './GotchisTable.vue'
import NumberDisplay from './NumberDisplay.vue'
import SortToggle from './SortToggle.vue'
import collaterals from '@/data/pockets/collaterals.json'

export default {
  components: {
    DataFetcherGotchis,
    DataFetcherGotchiBalances,
    DataFetcherPrices,
    DataFetcherEthereumGotchiOwners,
    DataFetcherVaultOwners,
    CryptoIcons,
    CryptoIcon,
    DateFriendly,
    EthAddress,
    NumberDisplay,
    GotchisTable,
    SortToggle
  },
  setup () {
    const dashboardDisplayMode = ref('all') // or 'minimum'

    const {
      usdPrices,
      canSubmitFetch: canSubmitPricesFetch,
      fetchStatus: pricesFetchStatus,
      fetchPrices
    } = useTokenPrices()

    const {
      gotchis,
      fetchStatus: gotchisFetchStatus
    } = useGotchis()

    const {
      balances,
      balanceTokens,
      fetchStatus: balancesFetchStatus,
      loadedBalancesDetails,
      lastFetchDate: ghstLastFetchDate
    } = useGotchiBalances()

    const {
      ownersByGotchi: vaultOwners,
      fetchStatus: vaultOwnersFetchStatus
    } = useVaultOwners()

    const {
      ownersByGotchi: ethereumGotchiOwners,
      fetchStatus: ethereumGotchiOwnersFetchStatus
    } = useEthereumGotchiOwners()

    // Fetch collateral prices if necessary
    if (!pricesFetchStatus.value.loaded && canSubmitPricesFetch.value) {
      fetchPrices()
    }

    const gotchisData = computed(() => {
      return gotchis.value.map(g => {
        const collateral = collaterals[g.collateral.toLowerCase()]
        const stakedAmount = collateral ? new BigNumber(g.stakedAmount).dividedBy(collateral.factor) : new BigNumber(0)
        const minimumStake = collateral ? new BigNumber(g.minimumStake).dividedBy(collateral.factor) : new BigNumber(0)
        const excessStake = stakedAmount.minus(minimumStake)
        return {
          id: g.id,
          idNum: g.id - 0,
          name: g.name,
          nameLowerCase: g.name.toLowerCase(),
          owner: g.owner?.id,
          collateralId: collateral.id,
          collateral: collateral?.label || g.collateral,
          stakedAmount,
          minimumStake,
          excessStake,
          escrow: g.escrow
        }
      })
    })

    const formQuery = ref('')
    const gotchisQuery = ref('')
    const gotchisQueryCleaned = computed(() => gotchisQuery.value?.trim().toLowerCase())
    const gotchisSort = ref({
      column: '',
      direction: 'asc'
    })
    const gotchisPaging = ref({
      page: 0,
      pageSize: 10
    })

    watch(
      () => ({
        query: gotchisQueryCleaned.value,
        sortColumn: gotchisSort.value.column,
        sortDirection: gotchisSort.value.direction,
        pageSize: gotchisPaging.value.pageSize
      }),
      () => { gotchisPaging.value.page = 0 }
    )

    const gotchisFiltered = computed(() => {
      const query = gotchisQueryCleaned.value
      if (!query) { return gotchisData.value }
      const checkVaultOwner = hasVaultOwners.value
      const vaultOwnerFor = vaultOwners.value
      const checkEthereumOwner = hasEthereumGotchiOwners.value
      const ethereumOwnerFor = ethereumGotchiOwners.value
      return gotchisData.value.filter(g =>
        g.id === query ||
        g.owner === query ||
        g.nameLowerCase.includes(query) ||
        (checkVaultOwner && vaultOwnerFor[g.id] === query) ||
        (checkEthereumOwner && ethereumOwnerFor[g.id] === query)
      )
    })

    const numFilteredGotchis = computed(() => gotchisFiltered.value.length)

    const gotchisSorted = computed(() => {
      const { column, direction } = gotchisSort.value
      if (!column) { return gotchisFiltered.value }
      if (column.startsWith('tokenBalance:')) {
        if (!hasBalances.value) { return gotchisFiltered.value }
        const tokenIndex = column.substring('tokenBalance:'.length)
        const balancesByGotchi = balancesSortable.value
        return orderBy(gotchisFiltered.value, [g => balancesByGotchi[g.id][tokenIndex] || 0], [direction])
      }
      if (['stakedAmount', 'minimumStake', 'excessStake'].includes(column)) {
        const usdValueFor = gotchisUsdValues.value
        return orderBy(gotchisFiltered.value, [g => usdValueFor[g.id][`${column}Sortable`] || 0], [direction])
      }
      if (column === 'trueOwner') {
        if (!hasVaultOwners.value && !hasEthereumGotchiOwners.value) { return gotchisFiltered.value }
        const vaultOwnerFor = vaultOwners.value
        const ethereumOwnerFor = ethereumGotchiOwners.value
        return orderBy(gotchisFiltered.value, [g => vaultOwnerFor[g.id] || ethereumOwnerFor[g.id] || g.owner], [direction])
      }
      return orderBy(gotchisFiltered.value, [column], [direction])
    })

    const gotchisToDisplay = computed(() => {
      const start = gotchisPaging.value.page * gotchisPaging.value.pageSize
      const end = start + gotchisPaging.value.pageSize
      return gotchisSorted.value.slice(start, end)
    })

    const collateralTotals = computed(() => {
      const collateralsMap = Object.fromEntries(
        Object.values(collaterals).map(collateral => {
          const numGotchis = 0
          const total = new BigNumber(0)
          const totalLocked = new BigNumber(0)
          return [
            collateral.id,
            {
              collateral,
              numGotchis,
              total,
              totalLocked
            }
          ]
        })
      )
      for (const gotchi of gotchisData.value) {
        const collateralObj = collateralsMap[gotchi.collateralId]
        if (!collateralObj) {
          console.error('Unexpected gotchi collateral', gotchi.collateralId)
        } else {
          collateralObj.numGotchis++
          collateralObj.total = collateralObj.total.plus(gotchi.stakedAmount)
          collateralObj.totalLocked = collateralObj.totalLocked.plus(gotchi.minimumStake)
        }
      }
      return Object.values(collateralsMap)
    })

    const hasPrices = computed(() => pricesFetchStatus.value.loaded)

    const gotchisUsdValues = computed(() => {
      if (!hasPrices.value) { return null }
      return Object.fromEntries(
        gotchisData.value.map(g => {
          const collateralPrice = usdPrices.value[g.collateralId]
          const stakedAmount = g.stakedAmount.times(collateralPrice)
          const minimumStake = g.minimumStake.times(collateralPrice)
          const excessStake = g.excessStake.times(collateralPrice)
          return [
            g.id,
            {
              stakedAmount,
              stakedAmountSortable: stakedAmount.toNumber(),
              minimumStake,
              minimumStakeSortable: minimumStake.toNumber(),
              excessStake,
              excessStakeSortable: excessStake.toNumber()
            }
          ]
        })
      )
    })

    const collateralTotalsWithPrice = computed(() => {
      if (!hasPrices.value) { return collateralTotals.value }
      return collateralTotals.value.map(obj => {
        const usdTotal = obj.total.times(usdPrices.value[obj.collateral.id])
        const usdTotalLocked = obj.totalLocked.times(usdPrices.value[obj.collateral.id])
        return {
          ...obj,
          usdTotal,
          meanUsd: usdTotal.dividedBy(obj.numGotchis),
          usdTotalLocked,
          meanUsdLocked: usdTotalLocked.dividedBy(obj.numGotchis)
        }
      })
    })

    const collateralTotalsWithPriceOrdered = computed(() => {
      if (!hasPrices.value) { return collateralTotals.value }
      if (dashboardDisplayMode.value === 'all') {
        return orderBy(collateralTotalsWithPrice.value, [obj => obj.usdTotal.toNumber()], ['desc'])
      }
      return orderBy(collateralTotalsWithPrice.value, [obj => obj.usdTotalLocked.toNumber()], ['desc'])
    })

    const grandTotals = computed(() => {
      const numGotchis = gotchis.value.length
      const usdTotal = hasPrices.value
        ? collateralTotalsWithPrice.value.reduce((total, item) => total.plus(item.usdTotal), new BigNumber(0))
        : 0
      const meanUsd = hasPrices.value ? usdTotal.dividedBy(numGotchis) : 0
      const usdTotalLocked = hasPrices.value
        ? collateralTotalsWithPrice.value.reduce((total, item) => total.plus(item.usdTotalLocked), new BigNumber(0))
        : 0
      const meanUsdLocked = hasPrices.value ? usdTotalLocked.dividedBy(numGotchis) : 0

      return {
        numGotchis,
        usdTotal,
        meanUsd,
        usdTotalLocked,
        meanUsdLocked
      }
    })

    const hasBalances = computed(() => balancesFetchStatus.value.loaded)

    const balanceTotals = computed(() => {
      if (!hasBalances.value) {
        return null
      }
      const totalByToken = Object.values(balances.value).reduce(
        (totals, gotchiBalances) => {
          for (let i = 0; i < gotchiBalances.length; i++) {
            totals[i] = totals[i].plus(gotchiBalances[i])
          }
          return totals
        },
        balanceTokens.map(() => new BigNumber(0))
      )

      const numGotchis = loadedBalancesDetails.value.numGotchis

      const statsByTokenIndex = Object.fromEntries(
        balanceTokens.map((token, tokenIndex) => {
          const total = totalByToken[tokenIndex]
          const mean = total.dividedBy(numGotchis)
          let usdTotal = null
          let meanUsd = null
          if (hasPrices.value && usdPrices.value[token.id] !== undefined) {
            usdTotal = total.times(usdPrices.value[token.id])
            meanUsd = usdTotal.dividedBy(numGotchis)
          }
          const stats = {
            total,
            numGotchis,
            mean,
            usdTotal,
            meanUsd,
            lastFetchDate: ghstLastFetchDate.value
          }
          return [tokenIndex, stats]
        })
      )
      return statsByTokenIndex
    })

    const balancesSortable = computed(() => {
      if (!hasBalances.value) { return null }
      const sortableByGotchi = {}
      for (const gotchiId in balances.value) {
        sortableByGotchi[gotchiId] = []
        for (const balance of balances.value[gotchiId]) {
          sortableByGotchi[gotchiId].push(balance.toNumber())
        }
      }
      return sortableByGotchi
    })

    const hasEthereumGotchiOwners = computed(() => ethereumGotchiOwnersFetchStatus.value.loaded)
    const hasVaultOwners = computed(() => vaultOwnersFetchStatus.value.loaded)

    return {
      gotchisFetchStatus,
      dashboardDisplayMode,
      collateralTotalsWithPriceOrdered,
      grandTotals,
      hasPrices,
      gotchisUsdValues,
      hasBalances,
      balanceTokens,
      balanceTotals,
      balances,
      ethereumGotchiOwners,
      hasEthereumGotchiOwners,
      vaultOwners,
      hasVaultOwners,
      formQuery,
      gotchisQuery,
      gotchisPaging,
      gotchisSort,
      gotchisToDisplay,
      numFilteredGotchis
    }
  }
}
</script>

<style scoped>
  .dashboard-controls__modes {
    margin: 10px 0 0 10px;
  }
  @media (min-width: 550px) {
    .dashboard-controls__modes {
      margin: 20px 0 0 50px;
    }
  }

  .dashboard-controls__mode {
    margin-bottom: 5px;
    padding: 5px 10px;
  }

  .dashboard {
    margin: 20px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .dashboard-row {
    width: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .dashboard-metric {
    flex: 0 0 auto;
    margin: 10px 15px;
    padding: 15px 25px;
    text-align: center;
  }
  .dashboard-number--primary {
    font-size: 1.5em;
  }
  .dashboard-number--secondary {
    margin-top: 5px;
    font-size: 1.2em;
  }
  .dashboard-text--primary {
    margin-bottom: 10px;
    font-size: 1.5em;
  }
  .dashboard-text--secondary {
    margin-top: 8px;
    font-size: 0.9em;
  }
  .dashboard-text--primary + .dashboard-number--primary {
    font-size: 2em;
  }

  .gotchis-table-filters {
    margin: 50px 0 30px;
    text-align: center;
  }

  .usd-value {
    display: block;
    font-size: 0.9em;
  }
</style>
