import { ref } from 'vue'
import BigNumber from 'bignumber.js'
import useStatus from '@/data/useStatus'

const BASE_DATA_URL = '/data/rf'
const SEASONS = {
  '1': {
    id: '1',
    aboutUrl: 'https://aavegotchi.medium.com/aavegotchi-rarity-farming-season-1-rewards-finalized-2db81e9f66e8',
    startDate: new Date('2021-04-20T14:00Z'),
    endDate: new Date('2021-06-15T14:00Z'),
    ghstTotal: 1_400_000,
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
    numWinners: 5000,
    rounds: {
      '1': {
        id: '1',
        jsonUrl: `${BASE_DATA_URL}/szn1/rnd1Gotchis.json`,
        endDate: new Date('2021-05-04T14:00Z'),
        blockNumber: 14082019,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn1/rnd2Gotchis.json`,
        endDate: new Date('2021-05-18T14:00Z'),
        blockNumber: 14645055,
        tiebreakerTraitIndex: 1
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn1/rnd3Gotchis.json`,
        endDate: new Date('2021-06-02T06:41Z'),
        blockNumber: 15231396,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn1/rnd4Gotchis.json`,
        endDate: new Date('2021-06-15T15:00Z'),
        blockNumber: 15748551,
        tiebreakerTraitIndex: 3
      }
    }
  },
  '2': {
    id: '2',
    aboutUrl: 'https://aavegotchi.medium.com/rarity-farming-season-2-is-coming-dates-announced-7047896eb3ab',
    startDate: new Date('2021-10-12T14:00Z'),
    endDate: new Date('2021-12-07T14:00Z'),
    ghstTotal: 2_000_000,
    leaderboards: [
      {
        id: 'rarity',
        label: 'Rarity',
        percent: 60,
        tiebreaker: 'kinship'
      },
      {
        id: 'kinship',
        label: 'Kinship',
        percent: 10,
        tiebreaker: 'xp'
      },
      {
        id: 'xp',
        label: 'XP',
        percent: 10,
        tiebreaker: 'trait'
      },
      {
        id: 'rookieKinship',
        label: 'Rookie Kinship',
        percent: 10,
        tiebreaker: 'xp'
      },
      {
        id: 'rookieXp',
        label: 'Rookie XP',
        percent: 10,
        tiebreaker: 'trait'
      }
    ],
    numRounds: 4,
    numWinners: 5000,
    rounds: {
      '1': {
        id: '1',
        jsonUrl: `${BASE_DATA_URL}/szn2/rnd1Gotchis.json`,
        endDate: new Date('2021-10-26T14:00Z'),
        blockNumber: 20633778,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn2/rnd2Gotchis.json`,
        endDate: new Date('2021-11-09T14:00Z'),
        blockNumber: 21170980,
        tiebreakerTraitIndex: 1
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn2/rnd3Gotchis.json`,
        endDate: new Date('2021-11-23T14:00Z'),
        blockNumber: 21708942,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn2/rnd4Gotchis.json`,
        endDate: new Date('2021-12-07T14:00Z'),
        blockNumber: 22242200,
        tiebreakerTraitIndex: 3
      }
    }
  },
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
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn3/rnd3Gotchis.json`,
        endDate: new Date('2022-04-07T14:00Z'),
        blockNumber: 26854118,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn3/rnd4Gotchis.json`,
        endDate: new Date('2022-04-22T14:00Z'),
        blockNumber: 27404025,
        tiebreakerTraitIndex: 3
      }
    }
  },
  '4': {
    id: '4',
    aboutUrl: 'https://blog.aavegotchi.com/aavegotchi-rarity-farming-season-4-is-comng/',
    startDate: new Date('2022-07-28T14:00Z'),
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
        jsonUrl: `${BASE_DATA_URL}/szn4/rnd1Gotchis.json`,
        endDate: new Date('2022-08-11T14:00Z'),
        blockNumber: 31770753,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn4/rnd2Gotchis.json`,
        endDate: new Date('2022-08-25T14:00Z'),
        blockNumber: 32308426,
        tiebreakerTraitIndex: 1
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn4/rnd3Gotchis.json`,
        endDate: new Date('2022-09-08T14:00Z'),
        blockNumber: 32848474,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn4/rnd4Gotchis.json`,
        endDate: new Date('2022-09-22T14:00Z'),
        blockNumber: 33427320,
        tiebreakerTraitIndex: 3
      }
    }
  },
  '5': {
    id: '5',
    aboutUrl: 'https://blog.aavegotchi.com/aavegotchi-rarity-farming-season-5-is-coming/',
    startDate: new Date('2023-01-31T14:00Z'),
    endDate: new Date('2023-03-28T14:00Z'),
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
        jsonUrl: `${BASE_DATA_URL}/szn5/rnd1Gotchis.json`,
        endDate: new Date('2023-02-14T14:00Z'),
        blockNumber: 39284410,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn5/rnd2Gotchis.json`,
        endDate: new Date('2023-02-28T14:00Z'),
        blockNumber: 39807200,
        tiebreakerTraitIndex: 1
      }
      /*
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn5/rnd3Gotchis.json`,
        endDate: new Date('2023-03-14T14:00Z'),
        blockNumber: 32848474, // TODO
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn5/rnd4Gotchis.json`,
        endDate: new Date('2023-03-28T14:00Z'),
        blockNumber: 33427320, // TODO
        tiebreakerTraitIndex: 3
      }
      */
    }
  }
}

const allResults = {}

const latestSeason = Object.keys(SEASONS).pop()
const latestRound = Object.keys(SEASONS[latestSeason].rounds).pop()
export {
  SEASONS,
  latestSeason,
  latestRound
}

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
