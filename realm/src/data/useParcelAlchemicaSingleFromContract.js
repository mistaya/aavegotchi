import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import useNetwork, { useNetworkCachedItem } from '@/environment/useNetwork'
import useStatus from '@/data/useStatus'
import useRealmContract from '@/data/useRealmContract'

const { selectedNetwork } = useNetwork()

// the realm contract automatically changes to match the current network
const realm = useRealmContract()

const MEAN_ALCHEMICA = [
  // humble
  {
    FUD: 28_473,
    FOMO: 14_237,
    ALPHA: 7118,
    KEK: 2847
  },
  // reasonable
  {
    FUD: 113_893,
    FOMO: 56_947,
    ALPHA: 28_786,
    KEK: 11_389
  },
  // spacious 1
  {
    FUD: 911_145,
    FOMO: 455_573,
    ALPHA: 227_786,
    KEK: 91_115
  },
  // spacious 2
  {
    FUD: 911_145,
    FOMO: 455_573,
    ALPHA: 227_786,
    KEK: 91_115
  },
  // partner
  {
    FUD: 1_822_290,
    FOMO: 911_145,
    ALPHA: 455_573,
    KEK: 182_229
  }
]

const meanAlchemicaForRound = function (roundNum, sizeNum) {
  const total = MEAN_ALCHEMICA[sizeNum]
  // Act 1: Round 1 is 25%, rest is split between remaining 9 rounds
  const multiplier = roundNum === 0 ? 0.25 : (0.75 / 9)
  return {
    FUD: (new BigNumber(total.FUD)).times(multiplier),
    FOMO: (new BigNumber(total.FOMO)).times(multiplier),
    ALPHA: (new BigNumber(total.ALPHA)).times(multiplier),
    KEK: (new BigNumber(total.KEK)).times(multiplier)
  }
}

// Implementation here is the same, but we still store separate data for each network
const useParcelAlchemicaSingleForNetwork = function (network) {
  const current = ref(null)
  const rounds = ref([])
  const totals = ref(null)

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const resetAlchemica = function () {
    current.value = null
    rounds.value = []
    totals.value = null
    lastFetchDate.value = null
  }

  const fetchAlchemica = function (parcelId, sizeNum) {
    // console.log('fetchAlchemica', parcelId, network)
    resetAlchemica()
    const [isStale, setLoaded, setError] = setLoading()
    realm.getParcelAlchemica(parcelId).then(async result => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (result && result.current && result.rounds) {
        current.value = result.current
        rounds.value = result.rounds.map(round => {
          if (!round.isSurveyed) {
            return round
          }
          const means = meanAlchemicaForRound(round.id, sizeNum)
          const baseMeanX = {
            FUD: round.base.FUD.div(means.FUD),
            FOMO: round.base.FOMO.div(means.FOMO),
            ALPHA: round.base.ALPHA.div(means.ALPHA),
            KEK: round.base.KEK.div(means.KEK)
          }
          const combinedMeanX = (baseMeanX.FUD.plus(baseMeanX.FOMO).plus(baseMeanX.ALPHA).plus(baseMeanX.KEK)).div(4)
          return {
            ...round,
            baseMeanX,
            combinedMeanX
          }
        })

        // Calculate totals across surveyed rounds
        const surveyedRounds = rounds.value.filter(round => round.isSurveyed)
        const numRoundsSurveyed = surveyedRounds.length
        const totalBase = surveyedRounds.reduce((totals, round) => {
          totals.FUD = totals.FUD.plus(round.base.FUD)
          totals.FOMO = totals.FOMO.plus(round.base.FOMO)
          totals.ALPHA = totals.ALPHA.plus(round.base.ALPHA)
          totals.KEK = totals.KEK.plus(round.base.KEK)
          return totals
        }, {
          FUD: new BigNumber(0),
          FOMO: new BigNumber(0),
          ALPHA: new BigNumber(0),
          KEK: new BigNumber(0)
        })
        const totalWithBoost = surveyedRounds.reduce((totals, round) => {
          totals.FUD = totals.FUD.plus(round.withBoost.FUD)
          totals.FOMO = totals.FOMO.plus(round.withBoost.FOMO)
          totals.ALPHA = totals.ALPHA.plus(round.withBoost.ALPHA)
          totals.KEK = totals.KEK.plus(round.withBoost.KEK)
          return totals
        }, {
          FUD: new BigNumber(0),
          FOMO: new BigNumber(0),
          ALPHA: new BigNumber(0),
          KEK: new BigNumber(0)
        })
        const totalMeansForSurveyedRounds = surveyedRounds.reduce((totals, round) => {
          const means = meanAlchemicaForRound(round.id, sizeNum)
          totals.FUD = totals.FUD.plus(means.FUD)
          totals.FOMO = totals.FOMO.plus(means.FOMO)
          totals.ALPHA = totals.ALPHA.plus(means.ALPHA)
          totals.KEK = totals.KEK.plus(means.KEK)
          return totals
        }, {
          FUD: new BigNumber(0),
          FOMO: new BigNumber(0),
          ALPHA: new BigNumber(0),
          KEK: new BigNumber(0)
        })
        const totalBaseMeanX = {
          FUD: totalBase.FUD.div(totalMeansForSurveyedRounds.FUD),
          FOMO: totalBase.FOMO.div(totalMeansForSurveyedRounds.FOMO),
          ALPHA: totalBase.ALPHA.div(totalMeansForSurveyedRounds.ALPHA),
          KEK: totalBase.KEK.div(totalMeansForSurveyedRounds.KEK)
        }
        const totalCombinedMeanX = totalBaseMeanX.FUD.plus(totalBaseMeanX.FOMO).plus(totalBaseMeanX.ALPHA).plus(totalBaseMeanX.KEK).div(4)

        totals.value = {
          numRoundsSurveyed,
          base: totalBase,
          withBoost: totalWithBoost,
          baseMeanX: totalBaseMeanX,
          combinedMeanX: totalCombinedMeanX
        }

        lastFetchDate.value = new Date()
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching the parcel alchemica')
    })
  }

  return {
    current,
    rounds,
    totals,
    canSubmitFetch,
    fetchStatus,
    fetchAlchemica,
    lastFetchDate
  }
}

const { getItemForNetwork } = useNetworkCachedItem({ initItem: (network) => useParcelAlchemicaSingleForNetwork(network) })

export default function useParcelAlchemicaSingle () {
  // use the currently selected network, which can change over time
  const resultToUse = computed(() => getItemForNetwork(selectedNetwork.value))
  const current = computed(() => resultToUse.value.current.value)
  const rounds = computed(() => resultToUse.value.rounds.value)
  const totals = computed(() => resultToUse.value.totals.value)
  const fetchStatus = computed(() => resultToUse.value.fetchStatus.value)
  const fetchAlchemica = computed(() => resultToUse.value.fetchAlchemica)

  return {
    current,
    rounds,
    totals,
    fetchStatus,
    fetchAlchemica
  }
}
