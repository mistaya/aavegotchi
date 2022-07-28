<template>
    <div>
      <div v-if="fetchStatus.loading || fetchStatus.error">
        <span class="parcel-details__label">
          Alchemica:
        </span>
        <span v-if="fetchStatus.loading">
          loading...
        </span>
        <div v-if="fetchStatus.error">
          Error fetching parcel alchemica.
        </div>
      </div>
      <div v-if="fetchStatus.loaded">

        <div>
          <span class="parcel-details__label">
            Current Alchemica:
          </span>
          <div
            style="margin-left: 8px;"
          >
            <template v-if="!rounds[0]?.isSurveyed">
              Unsurveyed
            </template>
            <template v-else>
              <div
                v-for="token in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
                :key="token"
              >
                <div style="display: flex; align-items: center; margin: 5px 10px 5px 0;">
                  <CryptoIcon
                    :address="TOKEN_ADDRESSES[token]"
                    style="margin-right: 5px"
                  />
                  <NumberDisplay
                    :number="current[token]"
                  />
                </div>
              </div>
              <div>
                Total FUD-equiv:
                <NumberDisplay
                    :number="current.NORMALIZED"
                  />
              </div>
            </template>
          </div>
        </div>

        <div style="margin-top: 10px;">
          <span class="parcel-details__label">
            Survey results:
          </span>
          <div style="margin-left: 10px;">
            <div v-if="hasBoosts">
              <label>
                <input
                  v-model="includeBoosts"
                  type="checkbox"
                />
                Include boosts
              </label>
            </div>
            <div
              v-for="round in rounds"
              :key="round.id"
            >
              <div>
                <span class="parcel-details__label">
                  Round {{ round.id + 1 }}
                </span>
                <span v-if="!round.isSurveyed">
                  Unsurveyed
                </span>
              </div>
              <div
                v-if="round.isSurveyed"
                style="margin-left: 8px;"
              >
                <div
                  v-for="token in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
                  :key="token"
                >
                  <div style="display: flex; align-items: center; margin: 5px 10px 5px 0;">
                    <CryptoIcon
                      :address="TOKEN_ADDRESSES[token]"
                      style="margin-right: 5px"
                    />
                    <NumberDisplay
                      :number="round[includeBoosts ? 'withBoost' : 'base'][token]"
                    />
                  </div>
                </div>
                <div>
                  Total FUD-equiv:
                  <NumberDisplay
                      :number="round[includeBoosts ? 'withBoost' : 'base'].NORMALIZED"
                    />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
import { ref, computed } from 'vue'
import useParcelAlchemicaSingleFromContract from '@/data/useParcelAlchemicaSingleFromContract'
import CryptoIcon from '@/common/CryptoIcon.vue'
import NumberDisplay from '@/common/NumberDisplay.vue'
import tokens from '@/data/pockets/tokens.json'

const tokensList = Object.values(tokens)
const TOKEN_ADDRESSES = {
  FUD: tokensList.find(({ label }) => label === 'FUD').id,
  FOMO: tokensList.find(({ label }) => label === 'FOMO').id,
  ALPHA: tokensList.find(({ label }) => label === 'ALPHA').id,
  KEK: tokensList.find(({ label }) => label === 'KEK').id,
  GHST: tokensList.find(({ label }) => label === 'GHST').id
}

export default {
  components: {
    CryptoIcon,
    NumberDisplay
  },
  props: {
    id: { type: String, required: true }
  },
  setup (props) {
    const {
      fetchStatus,
      current,
      rounds,
      fetchAlchemica
    } = useParcelAlchemicaSingleFromContract()

    fetchAlchemica(props.id, props.sizeNum - 0)

    const hasBoosts = computed(() => {
      if (!fetchStatus.value.loaded) { return false }
      let foundBoost = false
      const firstRound = rounds.value[0]
      if (firstRound?.isSurveyed) {
        // See if there are boosts by comparing the base/withBoosts round alchemica
        for (const token in firstRound.base) {
          if (firstRound.base[token] && firstRound.base[token].isLessThan(firstRound.withBoost[token])) {
            foundBoost = true
            break
          }
        }
      }
      return foundBoost
    })

    const includeBoosts = ref(true)

    return {
      fetchStatus,
      current,
      rounds,
      TOKEN_ADDRESSES,
      hasBoosts,
      includeBoosts
    }
  }
}
</script>
<style scoped>
  .parcel-details__label {
    margin-right: 5px;
    font-size: 0.9em;
    color: var(--site-text-color--subtle);
  }
</style>
