import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import useStatus from '@/data/useStatus'
import useGotchis from '@/data/useGotchis'
import useAaveContract from '@/data/useAaveContract'
import tokens from './pockets/tokens'

// Fetch all unclaimed Polygon AAVE rewards for gotchis
// This has to be done through the AAVE contract, because
// rewards are calculated on demand and aren't in their subgraph
// (the subgraph has fields for rewards but they're out of date)
// We need to look up the reward for each Polygon gotchi's
// escrow address.
// Assume that the gotchi fetch will be triggered separately.

const aaveContract = useAaveContract()

const {
  gotchis,
  fetchStatus: gotchisFetchStatus
} = useGotchis()

const rewards = ref({})

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => gotchisFetchStatus.value.loaded && !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const clearRewards = function () {
  rewards.value = {}
  lastFetchDate.value = null
}
const setRewards = function (rewardsByGotchi, fetchDate = null) {
  Object.assign(rewards.value, rewardsByGotchi)
  lastFetchDate.value = fetchDate || new Date()
}

const polygonGotchis = computed(() => gotchis.value.filter(gotchi => gotchi.escrow && tokens.polygon.collateralsByAddress[gotchi.collateral]?.label?.startsWith('am')))

const loadedRewardsDetails = computed(() => {
  return {
    numPolygonGotchis: polygonGotchis.value.length,
    numRewardsFetched: Object.keys(rewards.value).length
  }
})

const fetchRewards = function () {
  clearRewards()
  const [isStale, setLoaded, setError] = setLoading()

  // Give the UI a chance to display the loading state before we start fetching
  setTimeout(() => {
    if (isStale()) { return }

    let nextGotchiIndex = 0
    const BATCH_SIZE = 600
    const requests = []

    while (nextGotchiIndex < polygonGotchis.value.length) {
      const gotchis = polygonGotchis.value.slice(nextGotchiIndex, nextGotchiIndex + BATCH_SIZE)
      console.log('fetch rewards for ids', gotchis[0].id, 'to', gotchis[gotchis.length - 1].id)

      const request = aaveContract.getGotchiRewardsBalances(gotchis)
      requests.push(request)
      request.then(
        result => {
          if (isStale()) { return }
          // console.log('batch rewards result', { result }, Object.keys(result).length)
          setRewards(result)
        },
        error => {
          if (isStale()) { return }
          console.error(error)
          setError('Error fetching batch of rewards')
        }
      )

      nextGotchiIndex += BATCH_SIZE
    }

    // eslint-disable-next-line no-unused-vars
    Promise.allSettled(requests).then(results => {
      if (isStale()) { return }
      setLoaded()
    })
  }, 100)
}

// Use cached initial results
const [isStale, setLoaded, setError] = setLoading()

const handleInitialResult = function ({ default: json }) {
  if (isStale()) { return }
  // store rewards as BigNumber
  const initialRewards = {}
  for (var key in json) {
    initialRewards[key] = new BigNumber(json[key])
  }
  setRewards(initialRewards, new Date(1667233687066))
  setLoaded()
}

const handleInitialError = function (error) {
  console.error(error)
  setError('Error loading initial gotchis')
}

import(/* webpackChunkName: "assetGotchiRewards" */ '@/data/pockets/assetGotchiRewards.json')
  .then(handleInitialResult)
  .catch(handleInitialError)

export default function useGotchiAaveRewards () {
  return {
    rewards,
    canSubmitFetch,
    fetchStatus,
    loadedRewardsDetails,
    fetchRewards,
    lastFetchDate
  }
}
