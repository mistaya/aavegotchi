<template>
  <div>
    <CollateralIcons />

    <h1>Gotchi Pockets</h1>

    <DataFetcherGotchis />

    <div v-if="hasPrices" style="font-style: italic;">
      Using prices from coingecko
    </div>

    <template v-if="gotchisFetchStatus.loaded">
      <div class="dashboard-controls">
        <div class="dashboard-controls__modes">
          Show totals for
          <button
            type="button"
            class="dashboard-controls__mode"
            :aria-pressed="`${dashboardDisplayMode === 'all'}`"
            @click="dashboardDisplayMode = 'all'"
          >
            All (actual)
          </button>

          or

          <button
            type="button"
            class="dashboard-controls__mode"
            :aria-pressed="`${dashboardDisplayMode === 'minimum'}`"
            @click="dashboardDisplayMode = 'minimum'"
          >
            Minimum (locked)
          </button>
          Collateral
        </div>
      </div>
      <div class="dashboard">
        <div
          v-if="hasPrices"
          class="dashboard-row"
        >
          <div class="dashboard-metric">
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
          <div
            v-if="hasGhst"
            class="dashboard-metric"
          >
            <div class="dashboard-text dashboard-text--primary">
              GHST in Pockets
            </div>
            <div class="dashboard-number dashboard-number--primary">
              <NumberDisplay
                :number="ghstTotals.total"
              />
              GHST
            </div>
            <div
              v-if="hasPrices"
              class="dashboard-number dashboard-number--secondary"
            >
              <NumberDisplay
                :number="ghstTotals.usdTotal"
                usd
              />
            </div>
            <div class="dashboard-text dashboard-text--secondary">
              in <NumberDisplay :number="ghstTotals.numGotchis" /> gotchis
              <br>
              (average
              <template v-if="hasPrices">
                <NumberDisplay
                  :number="ghstTotals.meanUsd"
                  usd
                />
                /
              </template>
                <NumberDisplay
                  :number="ghstTotals.mean"
                />
              GHST)
              <br>
              <br>
              Balances fetched
              <DateFriendly :date="ghstTotals.lastFetchDate" />
            </div>
          </div>
          <div
            v-if="hasRewards"
            class="dashboard-metric"
          >
            <div class="dashboard-text dashboard-text--primary">
              Unclaimed AAVE Rewards
            </div>
            <div class="dashboard-number dashboard-number--primary">
              <NumberDisplay
                :number="rewardTotals.total"
              />
              WMATIC
            </div>
            <div
              v-if="hasPrices"
              class="dashboard-number dashboard-number--secondary"
            >
              <NumberDisplay
                :number="rewardTotals.usdTotal"
                usd
              />
            </div>
            <div class="dashboard-text dashboard-text--secondary">
              in <NumberDisplay :number="rewardTotals.numGotchis" /> gotchis
              <br>
              (average
              <template v-if="hasPrices">
                <NumberDisplay
                  :number="rewardTotals.meanUsd"
                  usd
                />
                /
              </template>
                <NumberDisplay
                  :number="rewardTotals.mean"
                />
              WMATIC)
              <br>
              <br>
              Rewards fetched
              <DateFriendly :date="rewardTotals.lastFetchDate" />
            </div>
          </div>
        </div>
        <div
          v-for="item in collateralTotalsWithPriceOrdered"
          :key="item.collateral.id"
          class="dashboard-metric"
        >
          <CollateralIcon
            :address="item.collateral.id"
            style="width: 40px"
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

      <div class="gotchis-table-filters">
        <form @submit.prevent="gotchisQuery = formQuery">
          <label>
            Search by gotchi ID, name, or owner address:
            <input
              v-model="formQuery"
              type="text"
            />
            <button type="submit">
              Search
            </button>
          </label>
        </form>
      </div>
      <div class="gotchis-table-wrapper">
        <table class="gotchis-table">
          <thead>
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
              <th v-if="hasGhst">
                GHST
                <SortToggle
                  :sort="gotchisSort.column === 'ghst' ? gotchisSort.direction : null"
                  @update:sort="gotchisSort.column = $event ? 'ghst' : null; gotchisSort.direction = $event"
                />
              </th>
              <th v-if="hasRewards">
                Unclaimed WMATIC
                <SortToggle
                  :sort="gotchisSort.column === 'rewards' ? gotchisSort.direction : null"
                  @update:sort="gotchisSort.column = $event ? 'rewards' : null; gotchisSort.direction = $event"
                />
              </th>
              <th>Escrow Address</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="gotchi in gotchisToDisplay"
              :key="gotchi.id"
            >
              <td>
                <a
                  :href="`https://aavegotchi.com/gotchi/${gotchi.id}`"
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
              <td v-if="hasGhst">
                <NumberDisplay
                  v-if="ghstBalances[gotchi.id]"
                  :number="ghstBalances[gotchi.id]"
                />
              </td>
              <td v-if="hasRewards">
                <NumberDisplay
                  v-if="rewards[gotchi.id]"
                  :number="rewards[gotchi.id]"
                />
              </td>
              <td>
                <EthAddress :address="gotchi.escrow" polygonscan />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import orderBy from 'lodash.orderby'
import BigNumber from 'bignumber.js'
import useCollateralPrices from '@/data/useCollateralPrices'
import useGotchis from '@/data/useGotchis'
import useGotchiGhst from '@/data/useGotchiGhst'
import useGotchiAaveRewards from '@/data/useGotchiAaveRewards'
import DataFetcherGotchis from './DataFetcherGotchis.vue'
import CollateralIcons from './CollateralIcons.vue'
import CollateralIcon from './CollateralIcon.vue'
import DateFriendly from './DateFriendly.vue'
import EthAddress from './EthAddress.vue'
import NumberDisplay from './NumberDisplay.vue'
import SortToggle from './SortToggle.vue'
import collaterals from '@/data/pockets/collaterals.json'

export default {
  components: {
    DataFetcherGotchis,
    CollateralIcons,
    CollateralIcon,
    DateFriendly,
    EthAddress,
    NumberDisplay,
    SortToggle
  },
  setup () {
    const dashboardDisplayMode = ref('all') // or 'minimum'

    const {
      usdPrices,
      canSubmitFetch: canSubmitPricesFetch,
      fetchStatus: pricesFetchStatus,
      fetchPrices
    } = useCollateralPrices()

    const {
      gotchis,
      fetchStatus: gotchisFetchStatus
    } = useGotchis()

    const {
      balances: ghstBalances,
      fetchStatus: ghstFetchStatus,
      loadedBalancesDetails: loadedGhstDetails,
      lastFetchDate: ghstLastFetchDate
    } = useGotchiGhst()

    const {
      rewards,
      fetchStatus: rewardsFetchStatus,
      loadedRewardsDetails,
      lastFetchDate: rewardsLastFetchDate
    } = useGotchiAaveRewards()

    // Fetch collateral prices if necessary
    if (!pricesFetchStatus.value.loaded && canSubmitPricesFetch.value) {
      fetchPrices()
    }

    const gotchisData = computed(() => {
      return gotchis.value.map(g => {
        const collateral = collaterals[g.collateral.toLowerCase()]
        const stakedAmount = collateral ? new BigNumber(g.stakedAmount).dividedBy(collateral.factor) : 0
        const minimumStake = collateral ? new BigNumber(g.minimumStake).dividedBy(collateral.factor) : 0
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
    const gotchisSort = ref({
      column: '',
      direction: 'asc'
    })

    const gotchisFiltered = computed(() => {
      const query = gotchisQuery.value?.trim().toLowerCase()
      if (!query) { return gotchisData.value }
      return gotchisData.value.filter(g => g.id === query || g.owner === query || g.nameLowerCase.includes(query))
    })

    const gotchisSorted = computed(() => {
      const { column, direction } = gotchisSort.value
      if (!column) { return gotchisFiltered.value }
      if (column === 'ghst') {
        if (!hasGhst.value) { return gotchisFiltered.value }
        const ghstFor = ghstBalancesSortable.value
        return orderBy(gotchisFiltered.value, [g => ghstFor[g.id] || 0], [direction])
      }
      if (column === 'rewards') {
        if (!hasRewards.value) { return gotchisFiltered.value }
        const rewardsFor = rewardsSortable.value
        return orderBy(gotchisFiltered.value, [g => rewardsFor[g.id] || 0], [direction])
      }
      if (['stakedAmount', 'minimumStake', 'excessStake'].includes(column)) {
        const usdValueFor = gotchisUsdValues.value
        return orderBy(gotchisFiltered.value, [g => usdValueFor[g.id][`${column}Sortable`] || 0], [direction])
      }
      return orderBy(gotchisFiltered.value, [column], [direction])
    })

    const gotchisToDisplay = computed(() => {
      return gotchisSorted.value.slice(0, 100)
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

    const GHST_ID = '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7'

    const hasGhst = computed(() => ghstFetchStatus.value.loaded)

    const ghstBalancesSortable = computed(() => {
      if (!hasGhst.value) { return null }
      const sortableGhst = {}
      for (var key in ghstBalances.value) {
        sortableGhst[key] = ghstBalances.value[key].toNumber()
      }
      return sortableGhst
    })

    const ghstTotals = computed(() => {
      if (!hasGhst.value) {
        return null
      }
      const total = Object.values(ghstBalances.value).reduce((total, item) => total.plus(item), new BigNumber(0))
      const numGotchis = loadedGhstDetails.value.numGotchis
      const mean = total.dividedBy(numGotchis)

      let usdTotal = 0
      let meanUsd = 0
      if (hasPrices.value) {
        usdTotal = total.times(usdPrices.value[GHST_ID])
        meanUsd = usdTotal.dividedBy(numGotchis)
      }
      return {
        total,
        numGotchis,
        mean,
        usdTotal,
        meanUsd,
        lastFetchDate: ghstLastFetchDate.value
      }
    })

    const WMATIC_ID = '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'

    const hasRewards = computed(() => rewardsFetchStatus.value.loaded)

    const rewardsSortable = computed(() => {
      if (!hasGhst.value) { return null }
      const sortableRewards = {}
      for (var key in rewards.value) {
        sortableRewards[key] = rewards.value[key].toNumber()
      }
      return sortableRewards
    })

    const rewardTotals = computed(() => {
      if (!hasRewards.value) {
        return null
      }
      const total = Object.values(rewards.value).reduce((total, item) => total.plus(item), new BigNumber(0))
      const numGotchis = loadedRewardsDetails.value.numPolygonGotchis
      const mean = total.dividedBy(numGotchis)

      let usdTotal = 0
      let meanUsd = 0
      if (hasPrices.value) {
        usdTotal = total.times(usdPrices.value[WMATIC_ID])
        meanUsd = usdTotal.dividedBy(numGotchis)
      }
      return {
        total,
        numGotchis,
        mean,
        usdTotal,
        meanUsd,
        lastFetchDate: rewardsLastFetchDate.value
      }
    })

    return {
      gotchisFetchStatus,
      dashboardDisplayMode,
      collateralTotalsWithPriceOrdered,
      grandTotals,
      hasPrices,
      gotchisUsdValues,
      hasGhst,
      ghstTotals,
      ghstBalances,
      hasRewards,
      rewardTotals,
      rewards,
      formQuery,
      gotchisQuery,
      gotchisSort,
      gotchisToDisplay
    }
  }
}
</script>

<style scoped>
  .dashboard-controls__modes {
    margin: 20px 0 0 50px;
  }
  .dashboard-controls__mode {
    padding: 5px 10px;
  }
  .dashboard-controls__mode[aria-pressed=true] {
    background: var(--purple--contrast-black);
    font-weight: bold;
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
    border: 1px solid #ccc;
    border-radius: 8px;
    text-align: center;
    padding: 15px 25px;
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
  .gotchis-table-wrapper {
    margin: 0;
  }
  .gotchis-table {
    margin: 0 auto 70px;
  }
  .gotchis-table thead th {
    position: sticky;
    top: 0;
    background-color: var(--background-color-transparent);
  }
  .gotchis-table td,
  .gotchis-table th {
    text-align: left;
    padding: 5px;
  }
  .gotchis-table tr:nth-child(even) td {
    background: #eee;
  }

  .gotchis-table .usd-value {
    display: block;
    font-size: 0.9em;
  }
</style>
