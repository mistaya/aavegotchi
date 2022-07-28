import BigNumber from 'bignumber.js'
import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import useRealmContract from '@/data/useRealmContract'

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

export default function () {
  const current = ref(null)
  const rounds = ref([])

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const resetAlchemica = function () {
    current.value = null
    rounds.value = []
    lastFetchDate.value = null
  }

  const fetchAlchemica = function (parcelId, sizeNum) {
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
    canSubmitFetch,
    fetchStatus,
    fetchAlchemica,
    lastFetchDate
  }
}
