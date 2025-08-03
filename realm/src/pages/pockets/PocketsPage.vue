<template>
  <div>
    <CryptoIcons />

    <h1>Gotchi Pockets</h1>

    <div :key="selectedNetwork">
      <DataFetcherGotchis />
      <DataFetcherGotchiBalances />
      <DataFetcherEthereumGotchiOwners v-if="enableEthereumGotchiOwners" />
      <DataFetcherPrices />
    </div>

    <div
      class="site-alertbox site-alertbox--info site-alertbox--compact"
      style="margin-top: 20px"
    >
     Gotchi "Spirit Force" or "collateral" was a Polygon-only feature (it was not migrated to Base). The final owner of the gotchi on Polygon can still withdraw any remaining Spirit Force and GHST rewards there.
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
          v-if="enableStakedCollateral && hasPrices"
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
              in <NumberDisplay :number="grandTotals.numGotchisWithPrice" /> gotchis
              <br>
              (average
                <NumberDisplay
                  :number="dashboardDisplayMode == 'all' ? grandTotals.meanUsd : grandTotals.meanUsdLocked"
                  usd
                />)
            </div>
            <div
              v-if="grandTotals.numGotchisWithoutPrice > 0"
              class="dashboard-text dashboard-text--secondary"
            >
              Plus {{ grandTotals.numGotchisWithoutPrice }} gotchis with unknown $ prices (see below).
            </div>
          </div>
        </div>

        <div
          v-if="enableStakedCollateral"
          class="dashboard-controls"
        >
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
              Original Minimum
            </SiteButton>
            Collateral
          </div>
        </div>

        <div
          v-if="enableStakedCollateral"
          class="dashboard-row"
        >
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
              <div
                v-if="!item.hasPrice"
                class="dashboard-number-error"
              >
                Error fetching {{ item.collateral.label }} price :(
              </div>
              <NumberDisplay
                v-else
                :number="dashboardDisplayMode == 'all' ? item.usdTotal : item.usdTotalLocked"
                usd
              />
            </div>
            <div class="dashboard-text dashboard-text--secondary">
              in <NumberDisplay :number="item.numGotchis" /> gotchis
              <template v-if="hasPrices && item.hasPrice">
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
      <SiteTable
        v-model:page="gotchisPaging.page"
        v-model:pageSize="gotchisPaging.pageSize"
        :numResults="numFilteredGotchis"
        :scrollingBreakpoint="1300"
      >
        <template #headers>
          <tr>
            <th>
              Gotchi ID
              <SortToggle
                defaultDirection="asc"
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
              <div style="white-space: nowrap;">
                Borrower
                <SortToggle
                  defaultDirection="asc"
                  :sort="gotchisSort.column === 'borrower' ? gotchisSort.direction : null"
                  @update:sort="gotchisSort.column = $event ? 'borrower' : null; gotchisSort.direction = $event"
                />
              </div>
              <div style="white-space: nowrap;">
                Owner / Lender
                <SortToggle
                  defaultDirection="asc"
                  :sort="gotchisSort.column === 'owner' ? gotchisSort.direction : null"
                  @update:sort="gotchisSort.column = $event ? 'owner' : null; gotchisSort.direction = $event"
                />
              </div>
              <div style="white-space: nowrap;">
                True Owner
                <SortToggle
                  defaultDirection="asc"
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
            <th v-if="enableStakedCollateral">
              Original Minimum Collateral
              <SortToggle
                v-if="hasPrices"
                :sort="gotchisSort.column === 'minimumStake' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'minimumStake' : null; gotchisSort.direction = $event"
              />
            </th>
            <th v-if="enableStakedCollateral">
              Staked Collateral
              <SortToggle
                v-if="hasPrices"
                :sort="gotchisSort.column === 'stakedAmount' ? gotchisSort.direction : null"
                @update:sort="gotchisSort.column = $event ? 'stakedAmount' : null; gotchisSort.direction = $event"
              />
            </th>
            <th v-if="enableStakedCollateral">
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
                :href="`https://${isPolygonNetwork ? 'polygon' : 'dapp'}.aavegotchi.com/u/${trueOwnersByGotchi[gotchi.id] || ownersByGotchi[gotchi.id]}/inventory?itemType=aavegotchis&chainId=8453&id=${gotchi.id}`"
                target="_blank"
              >
                {{ gotchi.id }}
              </a>
            </td>
            <td>
              {{ gotchi.name }}
            </td>
            <td>
              <div
                v-if="borrowersByGotchi[gotchi.id]"
                style="display: flex; align-items: center;"
              >
                <SiteIcon
                  name="clock"
                  style="margin-right: 4px;"
                />
                <EthAddress
                  :address="borrowersByGotchi[gotchi.id]"
                  icon
                />
              </div>
               <EthAddress
                :address="ownersByGotchi[gotchi.id]"
                icon
                style="margin-left: 20px;"
              />
               <EthAddress
                v-if="trueOwnersByGotchi[gotchi.id] && trueOwnersByGotchi[gotchi.id] !== ownersByGotchi[gotchi.id]"
                :address="trueOwnersByGotchi[gotchi.id]"
                icon
                style="margin-left: 20px;"
              />
            </td>
            <td>
              {{ gotchi.collateral }}
            </td>
            <td v-if="enableStakedCollateral">
              <NumberDisplay :number="gotchi.minimumStake" />
              <span class="usd-value">(<NumberDisplay
                v-if="hasPrices"
                :number="gotchisUsdValues[gotchi.id].minimumStake"
                usd
              />)</span>
            </td>
            <td v-if="enableStakedCollateral">
              <NumberDisplay :number="gotchi.stakedAmount" />
              <span class="usd-value">(<NumberDisplay
                v-if="hasPrices"
                :number="gotchisUsdValues[gotchi.id].stakedAmount"
                usd
              />)</span>
            </td>
            <td v-if="enableStakedCollateral">
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
              <EthAddress
                :address="gotchi.escrow"
                :polygonscan="isPolygonNetwork"
                :basescan="!isPolygonNetwork"
              />
            </td>
          </tr>
        </template>
      </SiteTable>
    </template>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import orderBy from 'lodash.orderby'
import BigNumber from 'bignumber.js'
import useNetwork from '@/environment/useNetwork'
import useTokenPrices from '@/data/useTokenPrices'
import useGotchis from '@/data/useGotchis'
import useGotchiBalances from '@/data/useGotchiBalances'
import useEthereumGotchiOwners from '@/data/useEthereumGotchiOwners'
import DataFetcherGotchis from './DataFetcherGotchis.vue'
import DataFetcherGotchiBalances from './DataFetcherGotchiBalances.vue'
import DataFetcherPrices from './DataFetcherPrices.vue'
import DataFetcherEthereumGotchiOwners from './DataFetcherEthereumGotchiOwners.vue'
import CryptoIcons from '@/common/CryptoIcons.vue'
import CryptoIcon from '@/common/CryptoIcon.vue'
import DateFriendly from '@/common/DateFriendly.vue'
import EthAddress from '@/common/EthAddress.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import SiteTable from '@/site/SiteTable.vue'
import SortToggle from '@/common/SortToggle.vue'
import collaterals from '@/data/pockets/collaterals.json'

export default {
  components: {
    DataFetcherGotchis,
    DataFetcherGotchiBalances,
    DataFetcherPrices,
    DataFetcherEthereumGotchiOwners,
    CryptoIcons,
    CryptoIcon,
    DateFriendly,
    EthAddress,
    NumberDisplay,
    SiteTable,
    SortToggle
  },
  setup () {
    const { selectedNetwork, isPolygonNetwork } = useNetwork()

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

    const enableEthereumGotchiOwners = computed(() => isPolygonNetwork.value)
    // ethereum gotchi owners data loads from cache initially so it's fine to do even if we don't need it
    const {
      ownersByGotchi: ethereumGotchiOwners,
      fetchStatus: ethereumGotchiOwnersFetchStatus
    } = useEthereumGotchiOwners()

    const enableStakedCollateral = computed(() => isPolygonNetwork.value)
    // Fetch token prices if necessary
    if (!pricesFetchStatus.value.loaded && canSubmitPricesFetch.value) {
      fetchPrices()
    }

    const hasEthereumGotchiOwners = computed(() => ethereumGotchiOwnersFetchStatus.value.loaded)

    const gotchisData = computed(() => {
      return gotchis.value.map(g => {
        const collateral = collaterals[g.collateral.toLowerCase()]
        let stakedCollateralData = {}
        if (enableStakedCollateral.value) {
          const stakedAmount = collateral ? new BigNumber(g.stakedAmount).dividedBy(collateral.factor) : new BigNumber(0)
          const minimumStake = collateral ? new BigNumber(g.minimumStake).dividedBy(collateral.factor) : new BigNumber(0)
          const excessStake = stakedAmount.isGreaterThan(minimumStake) ? stakedAmount.minus(minimumStake) : new BigNumber(0)
          stakedCollateralData = {
            stakedAmount,
            minimumStake,
            excessStake
          }
        }

        const owner = g.owner?.id
        return {
          id: g.id,
          idNum: g.id - 0,
          name: g.name,
          nameLowerCase: g.name.toLowerCase(),
          owner,
          lender: g.lender,
          originalOwner: g.originalOwner,
          collateralId: collateral.id,
          collateral: collateral?.label || g.collateral,
          ...stakedCollateralData,
          escrow: g.escrow
        }
      })
    })

    const borrowersByGotchi = computed(() => {
      return Object.fromEntries(
        gotchisData.value
          .filter(g => g.lender) // look for borrowed gotchis
          .map(g => [g.id, g.owner]) // the borrower is temporarily the owner
      )
    })

    // owners may be the true owner or ethereum
    const ownersByGotchi = computed(() => {
      return Object.fromEntries(
        gotchisData.value.map(g => [g.id, g.lender || g.owner])
      )
    })

    const trueOwnersByGotchi = computed(() => {
      const checkEthereumOwner = enableEthereumGotchiOwners.value && hasEthereumGotchiOwners.value
      const ethereumOwnerFor = ethereumGotchiOwners.value
      return Object.fromEntries(
        gotchisData.value.map(g => {
          if (g.lender) {
            return [g.id, g.originalOwner || g.lender]
          }
          // Not borrowed: look up ethereum owners
          return [
            g.id,
            (checkEthereumOwner && ethereumOwnerFor[g.id]) || g.owner
          ]
        })
      )
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
      const borrowers = borrowersByGotchi.value
      const owners = ownersByGotchi.value
      const trueOwners = trueOwnersByGotchi.value
      return gotchisData.value.filter(g =>
        g.id === query ||
        g.nameLowerCase.includes(query) ||
        borrowers[g.id] === query ||
        owners[g.id] === query ||
        trueOwners[g.id] === query
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
      if (column === 'borrower') {
        const borrowers = borrowersByGotchi.value
        return orderBy(gotchisFiltered.value, [g => borrowers[g.id]], [direction])
      }
      if (column === 'owner') {
        const owners = ownersByGotchi.value
        return orderBy(gotchisFiltered.value, [g => owners[g.id]], [direction])
      }
      if (column === 'trueOwner') {
        const trueOwners = trueOwnersByGotchi.value
        return orderBy(gotchisFiltered.value, [g => trueOwners[g.id]], [direction])
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
        const price = usdPrices.value[obj.collateral.id]
        const hasPrice = typeof price !== 'undefined'
        const usdTotal = obj.total.times(price)
        const usdTotalLocked = obj.totalLocked.times(price)

        return {
          ...obj,
          hasPrice,
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
      const numGotchisWithPrice = hasPrices.value
        ? collateralTotalsWithPrice.value.reduce((total, item) => total + (item.hasPrice ? item.numGotchis : 0), 0)
        : 0

      const usdTotal = hasPrices.value
        ? collateralTotalsWithPrice.value.reduce((total, item) => total.plus(item.hasPrice ? item.usdTotal : 0), new BigNumber(0))
        : 0
      const meanUsd = hasPrices.value ? usdTotal.dividedBy(numGotchisWithPrice) : 0
      const usdTotalLocked = hasPrices.value
        ? collateralTotalsWithPrice.value.reduce((total, item) => total.plus(item.hasPrice ? item.usdTotalLocked : 0), new BigNumber(0))
        : 0
      const meanUsdLocked = hasPrices.value ? usdTotalLocked.dividedBy(numGotchisWithPrice) : 0

      return {
        numGotchis,
        numGotchisWithPrice,
        numGotchisWithoutPrice: numGotchis - numGotchisWithPrice,
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
        balanceTokens.value.map(() => new BigNumber(0))
      )

      const numGotchis = loadedBalancesDetails.value.numGotchis

      const statsByTokenIndex = Object.fromEntries(
        balanceTokens.value.map((token, tokenIndex) => {
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

    watch(
      () => isPolygonNetwork.value,
      () => {
        // Reset to page 1 of table
        gotchisPaging.value.page = 0

        if (!isPolygonNetwork.value) {
          // switched to Base
          // If sorting by staked collateral, reset the sort
          const { column } = gotchisSort.value
          if (['stakedAmount', 'minimumStake', 'excessStake'].includes(column)) {
            gotchisSort.value = {
              column: '',
              direction: 'asc'
            }
          }
        }
      }
    )

    return {
      selectedNetwork,
      isPolygonNetwork,
      enableEthereumGotchiOwners,
      enableStakedCollateral,
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
      borrowersByGotchi,
      ownersByGotchi,
      trueOwnersByGotchi,
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
  .dashboard-number-error {
    font-size: 0.8em;
    font-style: italic;
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
