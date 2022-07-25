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
        <span class="parcel-details__label">
          Alchemica:
        </span>
        <div style="margin-left: 10px;">
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
                    :number="round.base[token]"
                  />
                </div>
              </div>
              <div>
                Total FUD-equiv:
                <NumberDisplay
                    :number="round.base.NORMALIZED"
                  />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
<script>
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
      rounds,
      fetchAlchemica
    } = useParcelAlchemicaSingleFromContract()

    fetchAlchemica(props.id, props.sizeNum - 0)

    return {
      fetchStatus,
      rounds,
      TOKEN_ADDRESSES
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
