import { ref, computed } from 'vue'
import BigNumber from 'bignumber.js'
import useStatus from '@/data/useStatus'
import useGotchis from '@/data/useGotchis'
import useAaveContract from '@/data/useAaveContract'
import collaterals from './pockets/collaterals.json'
import initialRewardsUrl from './pockets/assetGotchiRewards.json'

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

const polygonGotchis = computed(() => gotchis.value.filter(gotchi => gotchi.escrow && collaterals[gotchi.collateral]?.polygon))

const loadedRewardsDetails = computed(() => {
  return {
    numPolygonGotchis: polygonGotchis.value.length,
    numRewardsFetched: Object.keys(rewards.value).length
  }
})

const fetchRewards = function () {
  clearRewards()
  const [isStale, setLoaded] = setLoading()

  let nextGotchiIndex = 0
  const BATCH_SIZE = 100
  const BATCH_DELAY = 1000

  const sendBatch = function () {
    const requests = []
    const gotchiIds = []
    let i = nextGotchiIndex
    for (; i < polygonGotchis.value.length && requests.length < BATCH_SIZE; i++) {
      const gotchi = polygonGotchis.value[i]
      const request = aaveContract.getGotchiRewardsBalance({
        collateral: gotchi.collateral,
        escrow: gotchi.escrow
      }).then(resultNum => [gotchi.id, resultNum])
      requests.push(request)
      gotchiIds.push(gotchi.id)
    }
    nextGotchiIndex = i
    console.log('fetched batch', gotchiIds)

    Promise.allSettled(requests).then(results => {
      if (isStale()) { return }
      const fetchedRewardsByGotchi = {}
      for (const result of results) {
        if (result.status === 'fulfilled') {
          fetchedRewardsByGotchi[result.value[0]] = result.value[1]
        }
        // Ignore any errors - they'll have been printed in the console.
        // Better to store and use what results we have managed to get.
      }
      setRewards(fetchedRewardsByGotchi)

      if (nextGotchiIndex < polygonGotchis.value.length) {
        // send next batch
        setTimeout(sendBatch, BATCH_DELAY)
      } else {
        setLoaded()
      }
    })
  }

  sendBatch()
}

// Use cached initial results
const [isStale, setLoaded, setError] = setLoading()
fetch(initialRewardsUrl)
  .then(response => response.json())
  .then(json => {
    if (isStale()) { return }
    // store rewards as BigNumber
    const initialRewards = {}
    for (var key in json) {
      initialRewards[key] = new BigNumber(json[key])
    }
    setRewards(initialRewards, new Date(1641564009995))
    setLoaded()
  }).catch(error => {
    console.error(error)
    setError('Error loading initial gotchis')
  })

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
