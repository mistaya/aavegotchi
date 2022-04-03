import { ref } from 'vue'
import BigNumber from 'bignumber.js'
import useStatus from '@/data/useStatus'

const BASE_DATA_URL = '/data/rf'
const SEASONS = {
  '3': {
    id: '3',
    aboutUrl: 'https://blog.aavegotchi.com/aavegotchi-rarity-farming-season-3-is-coming/',
    startDate: new Date('2022-02-24T14:00Z'),
    endDate: new Date('2022-04-21T14:00Z'),
    ghstTotal: 1_500_000,
    leaderboards: [
      {
        id: 'rarity',
        label: 'Rarity',
        percent: 70,
        tiebreaker: 'kinship'
      },
      {
        id: 'kinship',
        label: 'Kinship',
        percent: 20,
        tiebreaker: 'xp'
      },
      {
        id: 'xp',
        label: 'XP',
        percent: 10,
        tiebreaker: 'trait'
      }
    ],
    numRounds: 4,
    numWinners: 7500,
    rounds: {
      '1': {
        id: '1',
        jsonUrl: `${BASE_DATA_URL}/szn3/rnd1Gotchis.json`,
        endDate: new Date('2022-03-10T14:00Z'),
        blockNumber: 25806267,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn3/rnd2Gotchis.json`,
        endDate: new Date('2022-03-24T14:00Z'),
        blockNumber: 26308346,
        tiebreakerTraitIndex: 1
      }
    }
  }
}

const allResults = {}

export default function useRarityFarming (seasonId, roundId) {
  if (allResults[seasonId]?.[roundId]) { return allResults[seasonId][roundId] }

  const seasonInfo = SEASONS[seasonId]
  if (!seasonInfo) {
    console.error('Invalid seasonId provided to useRarityFarming')
    return null
  }
  const roundInfo = seasonInfo.rounds[roundId]
  if (!roundInfo) {
    console.error('Invalid roundId provided to useRarityFarming')
    return null
  }

  // Extend info
  if (!seasonInfo.ghstTotalPerRound) {
    seasonInfo.ghstTotalPerRound = (new BigNumber(seasonInfo.ghstTotal)).div(seasonInfo.numRounds).toNumber()
  }

  const winners = ref([])

  const { status: fetchStatus, setLoading } = useStatus()

  const fetchWinners = function () {
    const [isStale, setLoaded, setError] = setLoading()
    fetch(roundInfo.jsonUrl)
      .then(response => response.json())
      .then(json => {
        if (isStale()) { console.log('Stale request, ignoring'); return }
        for (const gotchi of json) {
          // convert ghst rewards to BigNumber
          for (const board of Object.values(gotchi.leaderboards)) {
            board.reward = new BigNumber(board.reward)
          }
        }
        winners.value = json
        setLoaded()
      }).catch(error => {
        console.error(error)
        setError('There was an error fetching round winners')
      })
  }

  fetchWinners()

  if (!allResults[seasonId]) {
    allResults[seasonId] = {}
  }
  allResults[seasonId][roundId] = {
    winners,
    fetchStatus,
    seasonInfo,
    roundInfo
  }

  return allResults[seasonId][roundId]
}
