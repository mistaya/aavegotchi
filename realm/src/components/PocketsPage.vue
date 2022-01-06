<template>
  <div>
    <h1>Gotchi Soul Audit</h1>

    <DataFetcherGotchis />

    <div v-if="hasPrices" style="font-style: italic;">
      Using prices from coingecko
    </div>

    <div class="dashboard">
      <div
        v-if="hasPrices"
        class="dashboard-metric"
      >
        <b>Grand Total:</b>
        <div class="dashboard-number">
          {{ grandTotals.usdTotalFormatted }}
        </div>
        <div>
          in {{ grandTotals.numGotchis }} gotchis
        </div>
      </div>
      <div
        v-for="item in collateralTotalsWithPrice"
        :key="item.collateral.id"
        class="dashboard-metric"
      >
        <div class="dashboard-number">
          {{ item.totalFormatted }} {{ item.collateral.label }}
        </div>
        <div
          v-if="hasPrices"
          class="dashboard-number"
        >
          {{ item.usdTotalFormatted }}
        </div>
        <div>({{ item.numGotchis }} gotchis)</div>
      </div>
    </div>

    <div v-if="gotchisFetchStatus.loaded">
      <table>
        <thead>
          <tr>
            <th>Gotchi ID</th>
            <th>Name</th>
            <th>Owner</th>
            <th>Collateral</th>
            <th>Minimum Collateral</th>
            <th>Staked Collateral</th>
            <th>Excess Collateral</th>
            <th>Escrow Address</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="gotchi in gotchisData.slice(0, 100)"
            :key="gotchi.id"
          >
            <td>
              {{ gotchi.id }}
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
              {{ gotchi.minimumStake }}
            </td>
            <td>
              {{ gotchi.stakedAmount }}
            </td>
            <td>
              {{ gotchi.excessStake }}
            </td>
            <td>
              <EthAddress :address="gotchi.escrow" polygonscan />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import BigNumber from 'bignumber.js'
import useCollateralPrices from '@/data/useCollateralPrices'
import useGotchis from '@/data/useGotchis'
import DataFetcherGotchis from './DataFetcherGotchis.vue'
import EthAddress from './EthAddress.vue'
import collaterals from '@/data/pockets/collaterals.json'

export default {
  components: {
    DataFetcherGotchis,
    EthAddress
  },
  setup () {
    const usdFormatter = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' })
    const amountFormatter = new Intl.NumberFormat(undefined, { maximumSignificantDigits: 7 })

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

    // Fetch collateral prices if necessary
    if (!pricesFetchStatus.value.loaded && canSubmitPricesFetch.value) {
      fetchPrices()
    }

    const gotchisData = computed(() => {
      return gotchis.value.map(g => {
        const collateral = collaterals[g.collateral.toLowerCase()]
        const stakedAmount = collateral ? new BigNumber(g.stakedAmount).dividedBy(collateral.factor) : 0
        const minimumStake = collateral ? new BigNumber(g.minimumStake).dividedBy(collateral.factor) : 0
        return {
          id: g.id,
          name: g.name,
          owner: g.owner?.id,
          collateralId: collateral.id,
          collateral: collateral?.label || g.collateral,
          stakedAmount,
          minimumStake,
          excessStake: stakedAmount.minus(minimumStake),
          escrow: g.escrow
        }
      })
    })

    const collateralTotals = computed(() => {
      const collateralsMap = Object.fromEntries(
        Object.values(collaterals).map(collateral => {
          const numGotchis = 0
          const total = new BigNumber(0)
          return [
            collateral.id,
            {
              collateral,
              numGotchis,
              total
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
        }
      }
      for (const collateralObj of Object.values(collateralsMap)) {
        collateralObj.totalFormatted = amountFormatter.format(collateralObj.total)
      }
      return Object.values(collateralsMap)
    })

    const hasPrices = computed(() => pricesFetchStatus.value.loaded)
    const collateralTotalsWithPrice = computed(() => {
      if (!hasPrices.value) { return collateralTotals.value }
      return collateralTotals.value.map(obj => {
        const usdTotal = obj.total.times(usdPrices.value[obj.collateral.id]).decimalPlaces(0)
        return {
          ...obj,
          usdTotal,
          usdTotalFormatted: usdFormatter.format(usdTotal)
        }
      })
    })

    const grandTotals = computed(() => {
      const usdTotal = hasPrices.value
        ? collateralTotalsWithPrice.value.reduce((total, item) => total.plus(item.usdTotal), new BigNumber(0))
        : 0
      return {
        numGotchis: gotchis.value.length,
        usdTotal,
        usdTotalFormatted: usdFormatter.format(usdTotal)
      }
    })

    return {
      gotchisFetchStatus,
      gotchisData,
      collateralTotalsWithPrice,
      grandTotals,
      hasPrices
    }
  }
}
</script>

<style scoped>
  .dashboard {
    margin: 20px;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
  }
  .dashboard-metric {
    margin: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 15px;
  }
</style>
