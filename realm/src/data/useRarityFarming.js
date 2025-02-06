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
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn5/rnd3Gotchis.json`,
        endDate: new Date('2023-03-14T14:00Z'),
        blockNumber: 40338030,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn5/rnd4Gotchis.json`,
        endDate: new Date('2023-03-28T14:00Z'),
        blockNumber: 40864665,
        tiebreakerTraitIndex: 3
      }
    }
  },
  '6': {
    id: '6',
    aboutUrl: 'https://blog.aavegotchi.com/announcing-aavegotchi-rarity-farming-season-6/',
    startDate: new Date('2023-06-29T14:00Z'),
    endDate: new Date('2023-08-10T14:00Z'),
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
        jsonUrl: `${BASE_DATA_URL}/szn6/rnd1Gotchis.json`,
        endDate: new Date('2023-06-29T14:00Z'),
        blockNumber: 44479233,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn6/rnd2Gotchis.json`,
        endDate: new Date('2023-07-13T14:00Z'),
        blockNumber: 45031293,
        tiebreakerTraitIndex: 1
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn6/rnd3Gotchis.json`,
        endDate: new Date('2023-07-27T14:00Z'),
        blockNumber: 45581955,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn6/rnd4Gotchis.json`,
        endDate: new Date('2023-08-10T14:00Z'),
        blockNumber: 46139600,
        tiebreakerTraitIndex: 3
      }
    }
  },
  '7': {
    id: '7',
    aboutUrl: 'https://blog.aavegotchi.com/farming-frenzy-announcing-a-new-season-of-rarity-farming/',
    startDate: new Date('2023-10-31T14:00Z'),
    endDate: new Date('2023-12-26T14:00Z'),
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
        jsonUrl: `${BASE_DATA_URL}/szn7/rnd1Gotchis.json`,
        endDate: new Date('2023-11-14T14:00Z'),
        blockNumber: 49935600,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn7/rnd2Gotchis.json`,
        endDate: new Date('2023-11-28T14:00Z'),
        blockNumber: 50494489,
        tiebreakerTraitIndex: 1
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn7/rnd3Gotchis.json`,
        endDate: new Date('2023-12-12T14:00Z'),
        blockNumber: 51047500,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn7/rnd4Gotchis.json`,
        endDate: new Date('2023-12-26T14:00Z'),
        blockNumber: 51580651,
        tiebreakerTraitIndex: 3
      }
    }
  },
  '8': {
    id: '8',
    aboutUrl: 'https://blog.aavegotchi.com/rarity-farming-season-8/',
    startDate: new Date('2024-03-16T14:00Z'),
    endDate: new Date('2024-05-11T14:00Z'),
    ghstTotal: 1_500_000,
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
        percent: 20,
        tiebreaker: 'xp'
      },
      {
        id: 'xp',
        label: 'XP',
        percent: 10,
        tiebreaker: 'trait'
      }/* ,
      {
        id: 'battler',
        label: 'Gotchi Battler',
        percent: 10,
        tiebreaker: ''
      } */
    ],
    numRounds: 4,
    numWinners: 7500,
    rounds: {
      '1': {
        id: '1',
        jsonUrl: `${BASE_DATA_URL}/szn8/rnd1Gotchis.json`,
        endDate: new Date('2024-03-30T14:30Z'),
        blockNumber: 55253790,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn8/rnd2Gotchis.json`,
        endDate: new Date('2024-04-13T14:30Z'),
        blockNumber: 55777712,
        tiebreakerTraitIndex: 1
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn8/rnd3Gotchis.json`,
        endDate: new Date('2024-04-27T14:30Z'),
        blockNumber: 56315278,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn8/rnd4Gotchis.json`,
        endDate: new Date('2024-05-11T14:30Z'),
        blockNumber: 56845067,
        tiebreakerTraitIndex: 3
      }
    }
  },
  '9': {
    id: '9',
    aboutUrl: 'https://blog.aavegotchi.com/rarity-farming-season-9/',
    startDate: new Date('2024-08-10T14:00Z'),
    endDate: new Date('2024-10-05T14:00Z'),
    ghstTotal: 1_500_000,
    leaderboards: [
      {
        id: 'rarity',
        label: 'Rarity',
        percent: 50,
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
      }/* ,
      {
        id: 'battler',
        label: 'Gotchi Battler',
        percent: 20,
        tiebreaker: ''
      } */
    ],
    numRounds: 4,
    numWinners: 7500,
    rounds: {
      '1': {
        id: '1',
        jsonUrl: `${BASE_DATA_URL}/szn9/rnd1Gotchis.json`,
        endDate: new Date('2024-08-24T14:00Z'),
        blockNumber: 60983872,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn9/rnd2Gotchis.json`,
        endDate: new Date('2024-09-07T14:00Z'),
        blockNumber: 61536077,
        tiebreakerTraitIndex: 1
      },
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn9/rnd3Gotchis.json`,
        endDate: new Date('2024-09-21T14:00Z'),
        blockNumber: 62099103,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn9/rnd4Gotchis.json`,
        endDate: new Date('2024-10-05T14:00Z'),
        blockNumber: 62665467,
        tiebreakerTraitIndex: 3
      }
    }
  },
  '10': {
    id: '10',
    aboutUrl: 'https://blog.aavegotchi.com/rarity-farming-season-10/',
    startDate: new Date('2025-01-06T14:00Z'),
    endDate: new Date('2025-03-03T14:00Z'),
    ghstTotal: 1_500_000,
    leaderboards: [
      {
        id: 'rarity',
        label: 'Rarity',
        percent: 50,
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
      }/* ,
      {
        id: 'battler',
        label: 'Gotchi Battler',
        percent: 20,
        tiebreaker: ''
      } */
    ],
    numRounds: 4,
    numWinners: 7500,
    rounds: {
      '1': {
        id: '1',
        jsonUrl: `${BASE_DATA_URL}/szn10/rnd1Gotchis.json`,
        endDate: new Date('2025-01-20T14:00Z'),
        blockNumber: 66930990,
        tiebreakerTraitIndex: 0
      },
      '2': {
        id: '2',
        jsonUrl: `${BASE_DATA_URL}/szn10/rnd2Gotchis.json`,
        endDate: new Date('2025-02-03T14:00Z'),
        blockNumber: 67490569,
        tiebreakerTraitIndex: 1
      } /*,
      '3': {
        id: '3',
        jsonUrl: `${BASE_DATA_URL}/szn10/rnd3Gotchis.json`,
        endDate: new Date('2025-02-17T14:00Z'),
        blockNumber: 0,
        tiebreakerTraitIndex: 2
      },
      '4': {
        id: '4',
        jsonUrl: `${BASE_DATA_URL}/szn10/rnd4Gotchis.json`,
        endDate: new Date('2025-03-03T14:00Z'),
        blockNumber: 0,
        tiebreakerTraitIndex: 3
      } */
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
