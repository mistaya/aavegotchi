<template>
  <div>
    <CollateralIcons />

    <h1>Gotchi Soul Audit</h1>

    <DataFetcherGotchis />

    <div v-if="hasPrices" style="font-style: italic;">
      Using prices from coingecko
    </div>

    <template v-if="gotchisFetchStatus.loaded">
      <div class="dashboard">
        <div
          v-if="hasPrices"
          class="dashboard-row"
        >
          <div class="dashboard-metric">
            <div class="dashboard-text dashboard-text--primary">
              Grand Total
            </div>
            <div class="dashboard-number dashboard-number--primary">
              <NumberDisplay
                :number="grandTotals.usdTotal"
                usd
              />
            </div>
            <div class="dashboard-text dashboard-text--secondary">
              in <NumberDisplay :number="grandTotals.numGotchis" /> gotchis
              <br>
              (average
                <NumberDisplay
                  :number="grandTotals.meanUsd"
                  usd
                />)
            </div>
          </div>
        </div>
        <div
          v-for="item in collateralTotalsWithPrice"
          :key="item.collateral.id"
          class="dashboard-metric"
        >
          <CollateralIcon
            :address="item.collateral.id"
            style="width: 40px"
          />
          <div class="dashboard-number dashboard-number--primary">
            <NumberDisplay :number="item.total" />
            {{ item.collateral.label }}
          </div>
          <div
            v-if="hasPrices"
            class="dashboard-number dashboard-number--secondary"
          >
            <NumberDisplay
              :number="item.usdTotal"
              usd
            />
          </div>
          <div class="dashboard-text dashboard-text--secondary">
            in <NumberDisplay :number="item.numGotchis" /> gotchis
          </div>
        </div>
      </div>

      <table class="gotchis">
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
              <NumberDisplay :number="gotchi.minimumStake" />
            </td>
            <td>
              <NumberDisplay :number="gotchi.stakedAmount" />
            </td>
            <td>
              <NumberDisplay :number="gotchi.excessStake" />
            </td>
            <td>
              <EthAddress :address="gotchi.escrow" polygonscan />
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script>
import { computed } from 'vue'
import BigNumber from 'bignumber.js'
import useCollateralPrices from '@/data/useCollateralPrices'
import useGotchis from '@/data/useGotchis'
import DataFetcherGotchis from './DataFetcherGotchis.vue'
import CollateralIcons from './CollateralIcons.vue'
import CollateralIcon from './CollateralIcon.vue'
import EthAddress from './EthAddress.vue'
import NumberDisplay from './NumberDisplay.vue'
import collaterals from '@/data/pockets/collaterals.json'

export default {
  components: {
    DataFetcherGotchis,
    CollateralIcons,
    CollateralIcon,
    EthAddress,
    NumberDisplay
  },
  setup () {
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
      return Object.values(collateralsMap)
    })

    const hasPrices = computed(() => pricesFetchStatus.value.loaded)
    const collateralTotalsWithPrice = computed(() => {
      if (!hasPrices.value) { return collateralTotals.value }
      return collateralTotals.value.map(obj => {
        const usdTotal = obj.total.times(usdPrices.value[obj.collateral.id])
        return {
          ...obj,
          usdTotal
        }
      })
    })

    const grandTotals = computed(() => {
      const numGotchis = gotchis.value.length
      const usdTotal = hasPrices.value
        ? collateralTotalsWithPrice.value.reduce((total, item) => total.plus(item.usdTotal), new BigNumber(0))
        : 0
      const meanUsd = hasPrices.value ? usdTotal.dividedBy(numGotchis) : 0
      return {
        numGotchis,
        usdTotal,
        meanUsd
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
    padding: 15px;
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

  .gotchis td,
  .gotchis th {
    text-align: left;
    padding: 5px;
  }
  .gotchis tr:nth-child(even) td {
    background: #eee;
  }
</style>
