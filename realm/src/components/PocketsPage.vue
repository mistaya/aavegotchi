<template>
  <div>
    <CryptoIcons />

    <h1>Gotchi Pockets</h1>

    <div>
      <DataFetcherGotchis />
      <DataFetcherGotchiBalances />
      <DataFetcherGotchiAaveRewards/>
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
          <div
            v-if="hasRewards"
            class="dashboard-metric site-card"
          >
            <div class="dashboard-text dashboard-text--primary">
              <div style="display: flex; align-items: center; justify-content: center;">
                <CryptoIcon
                  :address="WMATIC_ID"
                  :size="40"
                  style="margin-right: 10px"
                />
                <div>Unclaimed AAVE Rewards</div>
              </div>
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
              <br>
              <i>(Note: there is currently no way to claim these rewards)</i>
            </div>
          </div>
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
      <PagingControls
        v-model="gotchisPaging"
        :numItems="numFilteredGotchis"
        itemsLabel="gotchis"
        class="gotchis-table-paging gotchis-table-paging--top"
      />
      <div class="gotchis-table-scroll-text">
        (Scroll the table sideways to see more columns)
      </div>
      <div class="gotchis-table-wrapper visible-scrollbar">
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
                <div v-if="hasVaultOwners">
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
                <div v-if="hasVaultOwners && vaultOwners[gotchi.id]">
                  <EthAddress
                    :address="(hasVaultOwners && vaultOwners[gotchi.id])"
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
      <PagingControls
        v-model="gotchisPaging"
        :numItems="numFilteredGotchis"
        itemsLabel="gotchis"
        class="gotchis-table-paging gotchis-table-paging--bottom"
      />
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
import useGotchiAaveRewards from '@/data/useGotchiAaveRewards'
import useVaultOwners from '@/data/useVaultOwners'
import DataFetcherGotchis from './DataFetcherGotchis.vue'
import DataFetcherGotchiAaveRewards from './DataFetcherGotchiAaveRewards.vue'
import DataFetcherGotchiBalances from './DataFetcherGotchiBalances.vue'
import DataFetcherPrices from './DataFetcherPrices.vue'
import DataFetcherVaultOwners from './DataFetcherVaultOwners.vue'
import CryptoIcons from './CryptoIcons.vue'
import CryptoIcon from './CryptoIcon.vue'
import DateFriendly from './DateFriendly.vue'
import EthAddress from './EthAddress.vue'
import NumberDisplay from './NumberDisplay.vue'
import PagingControls from './PagingControls.vue'
import SortToggle from './SortToggle.vue'
import collaterals from '@/data/pockets/collaterals.json'

export default {
  components: {
    DataFetcherGotchis,
    DataFetcherGotchiAaveRewards,
    DataFetcherGotchiBalances,
    DataFetcherPrices,
    DataFetcherVaultOwners,
    CryptoIcons,
    CryptoIcon,
    DateFriendly,
    EthAddress,
    NumberDisplay,
    PagingControls,
    SortToggle
  },
  setup () {
    const dashboardDisplayMode = ref('all') // or 'minimum'

    const {
      usdPrices,
      canSubmitFetch: canSubmitPricesFetch,
      fetchStatus: pricesFetchStatus,
      fetchPrices,
      tokens
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
      rewards,
      fetchStatus: rewardsFetchStatus,
      loadedRewardsDetails,
      lastFetchDate: rewardsLastFetchDate
    } = useGotchiAaveRewards()

    const {
      ownersByGotchi: vaultOwners,
      fetchStatus: vaultOwnersFetchStatus
    } = useVaultOwners()

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
        sortDirection: gotchisSort.value.direction
      }),
      () => { gotchisPaging.value.page = 0 }
    )

    const gotchisFiltered = computed(() => {
      const query = gotchisQueryCleaned.value
      if (!query) { return gotchisData.value }
      const checkVaultOwner = hasVaultOwners.value
      const vaultOwnerFor = vaultOwners.value
      return gotchisData.value.filter(g =>
        g.id === query ||
        g.owner === query ||
        g.nameLowerCase.includes(query) ||
        (checkVaultOwner && vaultOwnerFor[g.id] === query)
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
      if (column === 'rewards') {
        if (!hasRewards.value) { return gotchisFiltered.value }
        const rewardsFor = rewardsSortable.value
        return orderBy(gotchisFiltered.value, [g => rewardsFor[g.id] || 0], [direction])
      }
      if (['stakedAmount', 'minimumStake', 'excessStake'].includes(column)) {
        const usdValueFor = gotchisUsdValues.value
        return orderBy(gotchisFiltered.value, [g => usdValueFor[g.id][`${column}Sortable`] || 0], [direction])
      }
      if (column === 'trueOwner') {
        if (!hasVaultOwners.value) { return gotchisFiltered.value }
        const vaultOwnerFor = vaultOwners.value
        return orderBy(gotchisFiltered.value, [g => vaultOwnerFor[g.id] || g.owner], [direction])
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

    const WMATIC_ID = Object.values(tokens).find(t => t.label === 'WMATIC')?.id

    const hasRewards = computed(() => rewardsFetchStatus.value.loaded)

    const rewardsSortable = computed(() => {
      if (!hasRewards.value) { return null }
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

    const hasVaultOwners = computed(() => vaultOwnersFetchStatus.value.loaded)

    return {
      WMATIC_ID,
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
      hasRewards,
      rewardTotals,
      rewards,
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

<style>
  /* global styles */
  /* so we can refer to device css class from parent */

  /* Handle table scrolling:

     With a wide enough screen that the columns fit,
     let the table flow normally in the layout, with
     sticky headers.

     1100px width: this magic number needs adjusting for changes

     When the screen is narrower, allow horizontal scrolling.

     Touchscreens are nicest to use with horizontal but no vertical
     overflow, to avoid scroll-in-scroll. Unfortunately this also
     breaks the sticky headers because no height is defined.

     On desktops, can only horizontally scroll using the scrollbar,
     so it's a pain when the bottom of the table is out of view.
     So if no-touch and horizontal scrolling is necessary (narrow),
     also limit the vertical height so the whole scrollable table
     can fit on the viewport at once. (This also reenables the
     sticky headers, as a height is defined.)
   */
  @media (max-width: 1100px) {
    .gotchis-table-wrapper {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .gotchis-table-wrapper {
      max-height: 90vh;
    }
  }
</style>
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
  .gotchis-table-wrapper {
    margin: 0;
    max-width: 100%;
  }

  /* display help text for narrow screens */
  .gotchis-table-scroll-text {
    display: none;
    margin-bottom: 10px;
    font-size: 0.9em;
    font-style: italic;
    text-align: right;
  }
  @media (max-width: 950px) {
    .gotchis-table-scroll-text {
      display: block;
    }
  }

  .gotchis-table {
    margin: 0 auto;
  }
  .gotchis-table thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--site-background-color--transparent);
    color: var(--site-text-color--subtle);
  }
  .gotchis-table td,
  .gotchis-table th {
    text-align: left;
    padding: 5px;
  }
  .gotchis-table tr:nth-child(even) td {
    background: var(--site-background-color--alternate);
  }

  .gotchis-table-paging {
    margin: 20px auto;
    justify-content: center;
  }
  .gotchis-table-paging--bottom {
    margin-bottom: 70px;
  }

  .gotchis-table .usd-value {
    display: block;
    font-size: 0.9em;
  }
</style>
