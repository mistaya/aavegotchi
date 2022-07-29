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

        <div style="margin-top: 10px">
          <span class="parcel-details__label">
            Current Alchemica:
          </span>
          <template v-if="!rounds[0]?.isSurveyed">
            Unsurveyed
          </template>
          <div
            v-else
            style="margin-left: 8px;"
          >
            <div
              v-for="token in ['FUD', 'FOMO', 'ALPHA', 'KEK']"
              :key="token"
            >
              <div style="display: flex; align-items: center; margin: 5px 10px 5px 0;">
                <CryptoIcon
                  :label="token"
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
          </div>
        </div>

        <div
          v-if="rounds[0]?.isSurveyed"
          style="margin-top: 15px;"
        >
          <span class="parcel-details__label">
            Survey results:
          </span>
          <a
            href="#"
            style="display: inline-flex; gap: 5px; align-items: center; font-size: 0.85em"
            @click.prevent="surveyPopupIsOpen = true"
          >
            <SiteIcon name="info" />
            about
          </a>

          <SiteDialog
            v-model:isOpen="surveyPopupIsOpen"
          >
            <div class="parcel-details__info-modal-content">
              <div style="display: flex; align-items: center">
                <h2 style="flex: 1 1 auto; margin-left: 10px;">Alchemica Surveys</h2>
                <SiteButton
                  class="parcel-details__info-modal-close"
                  @click="surveyPopupIsOpen = false"
                >
                  Close
                </SiteButton>
              </div>
              <div class="parcel-details__info-modal-container">
                <p>
                  Parcels can be surveyed for alchemica every round.
                  Act 1 contains 10 rounds, over about 2 years.
                  25% of the alchemica will be discovered in Round 1, and the remaining 75% will be split over rounds 2-10.
                </p>
                <p>
                  Most parcels will get about 70-90% of the mean (average) alchemica - this is better than it sounds, it's the most common. The distribution of alchemica is asymmetric: rare lucky high amounts make the mean higher than 'normal'.
                </p>
                <p style="text-align: center;">
                  <img
                    src="./alchemica-distribution.png"
                    style="max-width: 100%; opacity: 0.9"
                  />
                </p>
                <p>
                  Although each survey is random, it only picks between 18 possible results shown on the graph above (scaled by parcel size &amp; alchemica type).
                  See the
                  <a
                    href="https://docs.gotchiverse.io/gameplay/farming/farming-your-parcel"
                    rel="noopener"
                    target="_blank"
                  >
                    Gotchiverse docs
                  </a>
                  for more info.
                </p>
              </div>
            </div>
          </SiteDialog>

          <div style="margin-left: 10px;">
            <div
              v-if="hasBoosts"
              style="margin-top: 10px"
            >
              <label>
                <input
                  v-model="includeBoosts"
                  type="checkbox"
                />
                Include boosts in amounts
              </label>
            </div>
            <div
              v-for="round in rounds"
              :key="round.id"
              style="margin-top: 10px"
            >
              <div>
                <span class="parcel-details__label">
                  Round {{ round.id + 1 }}
                </span>
                <span v-if="!round.isSurveyed">
                  Unsurveyed
                </span>
                <span
                  v-else
                  class="survey-score"
                >
                  ({{ round.combinedMeanX.times(100).integerValue() }}% average)
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
                      :label="token"
                      style="margin-right: 5px"
                    />
                    <NumberDisplay
                      :number="round[includeBoosts ? 'withBoost' : 'base'][token]"
                    />

                    <span
                      style="margin-left: 10px;"
                      class="survey-score"
                    >
                      ({{ round.baseMeanX[token].times(100).integerValue() }}%)
                    </span>
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
import SiteDialog from '@/site/SiteDialog.vue'

export default {
  components: {
    CryptoIcon,
    NumberDisplay,
    SiteDialog
  },
  props: {
    id: { type: String, required: true },
    sizeNum: { type: String, required: true }
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

    const surveyPopupIsOpen = ref(false)

    return {
      fetchStatus,
      current,
      rounds,
      hasBoosts,
      includeBoosts,
      surveyPopupIsOpen
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

  .survey-score {
    font-size: 0.9em;
  }

  @media (min-width: 1000px) {
    .parcel-details__info-modal-content {
      max-width: 900px;
      padding: 0 20px;
    }
  }

  .parcel-details__info-modal-close {
    flex: none;
    margin-top: 10px;
    margin-right: 10px;
    padding: 10px 20px
  }
  .parcel-details__info-modal-container {
    padding: 10px;
  }
</style>
