const axios = require('axios')
const { writeJsonFile, readJsonFile } = require('../fileUtils.js')
const BigNumber = require('bignumber.js')
const setHelpers = require('./sets/setHelpers.js')

const fetchGotchiLendings = require('./lendings/fetchGotchiLendings.js')
const fetchEthGotchiOwners = require('./eth/fetchEthGotchiOwners.js')
const fetchVaultGotchiOwners = require('./vault/fetchVaultGotchiOwners.js')
// eslint-disable-next-line no-unused-vars
const fetchGotchiImages = require('./images/fetchGotchiImages.js')
const fetchLendingsFromContract = require('./lendings/fetchGotchiLendingsFromContract.js')

// Snapshot blocks
const SEASONS = {
  // None of the S1 leaderboards match up properly, even XP and kinship!
  // What's wrong:
  //     the RF algorithm used?
  //         - this is different in different rounds.
  //     the subgraph data? Could the kinship values in the subgraph NOW be different to THEN?
  //     the block numbers? seems right, R1 matches on main site
  //     the rankings? seems right: R1 Winklevoss and God of Earth total rewards match blockchain GHST
  // - God of Earth is ranked as if it has kinship 51, but the data says 30
  // - lots have a rank-kinship mismatch, e.g. around 50 kinship
  // TODO call contract to find the kinship values at those blocks and compare to subgraph
  // The S1 rewards data is the per-round amount, does not need to be divided by 4
  szn1: {
    // Round 1: rfCalc = 'subgraph'
    // - this relied on the subgraph, which was a perfect match (in order) when originally fetched in Apr 2022
    //   However since then, the subgraph has changed and it no longer matches.
    //   So rerunning this fetch won't give good results.
    rnd1: {
      rfCalc: 'subgraph',
      wearableSets: '2021-01-03', // These sets seem incomplete for this time point e.g. Gotchi King is missing
      blocks: {
        polygon: 14082019, // May-04-2021
        eth: 0
      }
    },
    // Round 2: rfCalc = 'subgraph'
    // - this relied on the subgraph, which was a perfect match (in order) when originally fetched in Apr 2022
    //   However since then, the subgraph has changed and it no longer matches.
    //   So rerunning this fetch won't give good results.
    rnd2: {
      rfCalc: 'subgraph',
      wearableSets: '2021-01-03',
      blocks: {
        polygon: 14645055, // May-18-2021
        eth: 0
      }
    },
    // Round 3:
    // * block published in discord is 15231396. BUT this is wrong:
    //    - it's Jun 2 6:41 AM UTC
    //    - when fetching gotchi details, couldn't find gotchis 3019 and 3023 in round 3
    //    - many gotchis are out of order, notably Felon is only 561 Rarity (expected ~800-900)
    // * according to https://discord.com/channels/732491344970383370/784303575593517087/849219624889483265
    //    "RARITY FARMING ROUND 3 SNAPSHOT HAS BEEN MOVED TO  JUNE 2 AT 2PM UTC!"
    //    - This is block 15244025
    //
    // Round 3 rfCalc:
    //  - starting here, it looks like wearable sets were probably calculated with JS, not the subgraph.
    //    'best' gives ~6 out of order (all due to Runners with water lower than they should be, and Runners with wine higher)
    //      - after modifying the runner sets to look for Wine, 0 are out of order
    // Kinship:
    //    #7677 Randy rank 4962 has 12 Kinship between 52s
    //    #7701 Obi-Wan Kenobi rank 4970, and #7698 Bodhi rank 4972, have 0 kinship (and XP) between 52s
    //    #7076 KINGS OF LEON rank 4946 has 42 kinship between 53s
    //    #8737 Gamestonk rank 4919 has 0 kinship between 54s
    rnd3: {
      rfCalc: 'best',
      wearableSets: '2021-01-03', // with Wine bug
      blocks: {
        polygon: 15244025, // Jun-02-2021
        eth: 0
      }
    },
    // Round 4:
    //    'best' (using corrected Runner sets) gives only 1 out of order: QUEEN #752 who is 523 between 573's, no wearables.
    // Kinship: still buggy.
    //    #7701 Obi-Wan Kenobi rank 4987 and #7698 Bodhi rank 4983 still has 0 kinship (and XP) between 52s
    rnd4: {
      rfCalc: 'best',
      wearableSets: '2021-05-15', // without Wine bug
      blocks: {
        polygon: 15748551, // Jun-15-2021
        eth: 0
      }
    }
  },
  // Ethereum bridge opened 4 Oct 2021
  // S2 leaderboard calcs used raritySortHelpers js in the github
  szn2: {
    rnd1: {
      rfCalc: 'js1',
      wearableSets: '2021-11-06',
      blocks: {
        polygon: 20633778, // Oct-26-2021
        eth: 13493410
      }
    },
    rnd2: {
      rfCalc: 'js1',
      wearableSets: '2021-11-06',
      blocks: {
        polygon: 21170980, // Nov-09-2021
        eth: 13582557
      }
    },
    rnd3: {
      rfCalc: 'js1',
      wearableSets: '2021-11-06',
      blocks: {
        polygon: 21708942, // Nov-23-2021
        eth: 13671252
      }
    },
    rnd4: {
      rfCalc: 'js1',
      wearableSets: '2021-11-06',
      blocks: {
        polygon: 22242200, // Dec-07-2021
        eth: 13758913
      }
    }
  },
  // Gotchi Vault started Jan 2022
  // Gotchi Lendings started Mar 28 2022
  // S3 leaderboard calcs used raritySortHelpers js in the github
  szn3: {
    checkVault: true,
    checkLendings: true,
    rnd1: {
      rfCalc: 'js1',
      wearableSets: '2022-03-11',
      blocks: {
        polygon: 25806267, // Mar-10-2022
        eth: 14359489
      }
    },
    rnd2: {
      rfCalc: 'js1',
      wearableSets: '2022-03-11',
      blocks: {
        polygon: 26308346, // Mar-24-2022
        eth: 14449396
      }
    },
    rnd3: {
      rfCalc: 'js1',
      wearableSets: '2022-03-11',
      blocks: {
        polygon: 26854118, // Apr-07-2022
        eth: 14539158
      }
    },
    rnd4: {
      rfCalc: 'js1',
      wearableSets: '2022-03-11',
      blocks: {
        polygon: 27404025, // Apr-21-2022
        eth: 14635098
      }
    }
  },
  // S4: wearable sets changed
  // New wearable sets JS algorithm is in the works: not deployed during this season
  szn4: {
    checkVault: true,
    checkLendings: true,
    rnd1: {
      // New wearable sets JS algorithm is not quite ready yet.
      // (Still assigning "Sushi Chef" not "Master Sushi Chef")
      rfCalc: 'js1',
      wearableSets: '2022-08-03',
      blocks: {
        polygon: 31770753, // Aug-11-2022
        eth: 15321119
      }
    },
    rnd2: {
      rfCalc: 'js1',
      wearableSets: '2022-08-03',
      blocks: {
        polygon: 32308426, // Aug-25-2022
        eth: 15409495
      }
    },
    rnd3: {
      rfCalc: 'js1',
      wearableSets: '2022-08-03',
      blocks: {
        polygon: 32848474, // Sep-08-2022
        eth: 15496980
      }
    },
    rnd4: {
      rfCalc: 'js1',
      wearableSets: '2022-08-03',
      blocks: {
        polygon: 33427320, // Sep-22-2022
        eth: 15589336
      }
    }
  },
  // S5
  szn5: {
    checkVault: true,
    checkLendings: true,
    rnd1: {
      // Old wearable sets JS algorithm is in use
      // (Still assigning "Sushi Chef" not "Master Sushi Chef")
      rfCalc: 'js1',
      wearableSets: '2022-08-03',
      blocks: {
        polygon: 39284410, // Feb-14-2023
        eth: 16627442
      }
    },
    rnd2: {
      // Old wearable sets JS algorithm is in use
      // (Still assigning "Sushi Chef" not "Master Sushi Chef")
      rfCalc: 'js1',
      wearableSets: '2023-03-01', // Forge wearable sets added
      blocks: {
        polygon: 39807200, // Feb-28-2023
        eth: 16727111
      }
    },
    rnd3: {
      // Old wearable sets JS algorithm is in use
      // (Still assigning "Sushi Chef" not "Master Sushi Chef")
      rfCalc: 'js1',
      wearableSets: '2023-03-01',
      blocks: {
        polygon: 40338030, // Mar-14-2023
        eth: 16826644
      }
    },
    rnd4: {
      // Old wearable sets JS algorithm is in use
      // (Still assigning "Sushi Chef" not "Master Sushi Chef")
      rfCalc: 'js1',
      wearableSets: '2023-03-01',
      blocks: {
        polygon: 40864665, // Mar-28-2023
        eth: 16926285
      }
    }
  },
  // S6: new wearable sets from DAO/Forge to be introduced later in the season?
  // New wearable sets JS algorithm is in the works: will it be used?
  szn6: {
    checkVault: true,
    checkLendings: true,
    rnd1: {
      rfCalc: 'js1',
      wearableSets: '2023-03-01',
      blocks: {
        polygon: 44479233, // Jun-29-2023
        eth: 17585412
      }
    },
    rnd2: {
      rfCalc: 'js1',
      wearableSets: '2023-03-01',
      blocks: {
        polygon: 45031293, // Jul-13-2023
        eth: 17685029
      }
    },
    // subgraph lendings data is incomplete and buggy after the kinship burning upgrade
    rnd3: {
      rfCalc: 'js1',
      wearableSets: '2023-03-01',
      useLendingsFromContract: true,
      blocks: {
        polygon: 45581955, // Jul-27-2023
        eth: 17784859
      }
    },
    rnd4: {
      rfCalc: 'js1',
      wearableSets: '2023-03-01',
      useLendingsFromContract: true,
      blocks: {
        polygon: 46139600, // Aug-10-2023
        eth: 17884944
      }
    }
  }
}

// Params for this run
// - season
const SEASON = SEASONS.szn6
const SEASON_REWARDS_FILE = '../../public/data/rf/szn6/rewards.json'
const NUM_ROUNDS_REWARDS = 4 // change this to 1 for Season 1, 4 for Seasons 2,3,4,5,6
// - round
const ROUND = SEASON.rnd4
const ROUND_WINNERS_FILE = '../../public/data/rf/szn6/rnd4.json'
const GOTCHIS_FILENAME = 'rnd4Gotchis'
// eslint-disable-next-line no-unused-vars
const GOTCHI_IMAGES_FOLDER = './r4'

const ETH_BRIDGE_ADDRESS = '0x86935f11c86623dec8a25696e1c19a8659cbf95d'
const VAULT_ADDRESS = '0xdd564df884fd4e217c9ee6f65b4ba6e5641eac63'

const SUBGRAPH_URL = 'https://subgraph.satsuma-prod.com/tWYl5n5y04oz/aavegotchi/aavegotchi-core-matic/api'
const FETCH_PAGE_SIZE = 1000

const fetchGotchis = function (gotchiIds) {
  return new Promise((resolve, reject) => {
    let gotchis = []
    let nextIndex = 0
    const fetchFromSubgraph = function () {
      const idsToFetch = gotchiIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      console.log(`Fetching batch of ${idsToFetch.length} gotchis... ${nextIndex} to ${nextIndex + FETCH_PAGE_SIZE - 1} at block ${ROUND.blocks.polygon}`)
      axios.post(SUBGRAPH_URL, {
        query: `{
          aavegotchis(block: { number: ${ROUND.blocks.polygon} }, first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(idsToFetch)} }) {
            id
            owner {
              id
            }
            escrow
            hauntId
            name
            numericTraits
            modifiedNumericTraits
            withSetsNumericTraits
            equippedWearables
            equippedSetID
            equippedSetName
            collateral
            kinship
            lastInteracted
            experience
            usedSkillPoints
            level
            baseRarityScore
            modifiedRarityScore
            withSetsRarityScore
            createdAt
          }
        }`
      }).then(async response => {
        if (response.data.data?.aavegotchis) {
          gotchis = gotchis.concat(
            response.data.data.aavegotchis.map(gotchi => ({
              ...gotchi,
              owner: gotchi.owner?.id
            }))
          )
          console.log(`Received ${response.data.data.aavegotchis.length}; total ${gotchis.length}`)
          if (nextIndex + FETCH_PAGE_SIZE >= gotchiIds.length) {
            // finished fetching all pages
            console.log(`Fetched all ${gotchis.length} gotchis`)
            resolve(gotchis)
            return
          }
          // fetch the next page of results
          nextIndex += FETCH_PAGE_SIZE
          fetchFromSubgraph()
        } else {
          console.error('Unexpected response', response.data?.errors)
          reject(new Error('Unexpected response from graph'))
        }
      }).catch(error => {
        console.error(error)
        reject(new Error('Error fetching from graph'))
      })
    }

    fetchFromSubgraph()
  })
}

const fetchRoundData = async function () {
  // Read in the round winners and get unique gotchi ids
  const roundWinners = await readJsonFile(ROUND_WINNERS_FILE)
  let gotchiIds = []
  for (const type in roundWinners) {
    gotchiIds.push(...roundWinners[type])
  }
  gotchiIds = [...new Set(gotchiIds)]
  console.log(`Found ${gotchiIds.length} unique gotchi winners in this round`)

  // Read in the rewards
  const seasonRewards = await readJsonFile(SEASON_REWARDS_FILE)

  // Fetch the gotchi details from the graph, at the time of the snapshot
  const gotchis = await fetchGotchis(gotchiIds)
  const gotchisById = Object.fromEntries(gotchis.map(gotchi => [gotchi.id, gotchi]))

  // Annotate the gotchis with their round rankings and winnings
  for (const type in roundWinners) {
    for (let i = 0; i < roundWinners[type].length; i++) {
      const winnerId = roundWinners[type][i]
      const gotchi = gotchisById[winnerId]
      if (!gotchi) {
        console.error(`Couldn't find gotchi ${winnerId}`)
      } else {
        if (!gotchi.leaderboards) {
          gotchi.leaderboards = {}
        }
        if (!gotchi.leaderboards[type]) {
          gotchi.leaderboards[type] = {}
        }
        gotchi.leaderboards[type].ranking = i + 1 // 1-based ranking
        if (!seasonRewards[type]?.[i]) {
          console.error(`Couldn't find reward for ranking index ${i} in ${type}`)
        } else {
          const seasonRewardForPosition = seasonRewards[type][i]
          gotchi.leaderboards[type].reward = (new BigNumber(seasonRewardForPosition)).div(NUM_ROUNDS_REWARDS).toString()
        }
      }
    }
  }

  // Write the gotchis to file
  await writeJsonFile(`${GOTCHIS_FILENAME}.json`, gotchis)
  console.log(`Written result to ${GOTCHIS_FILENAME}.json`)
}

const fetchLendings = async function () {
  if (SEASON.checkLendings && (SEASON.useLendingsFromContract || ROUND.useLendingsFromContract)) {
    console.log('Fetching lendings from contract')
    const gotchis = await readJsonFile(`${GOTCHIS_FILENAME}.json`)
    const gotchiIds = gotchis.map(gotchi => gotchi.id)
    await fetchLendingsFromContract({ gotchiIds, fileName: `${GOTCHIS_FILENAME}_lendings.json`, blockNumber: ROUND.blocks.polygon })
  }
}

const fetchGotchiOwners = async function () {
  const gotchis = await readJsonFile(`${GOTCHIS_FILENAME}.json`)
  // First look up lent-out gotchis
  const gotchiIds = gotchis.map(gotchi => gotchi.id)
  let gotchiIdToLending = {}
  if (SEASON.checkLendings) {
    if (SEASON.useLendingsFromContract || ROUND.useLendingsFromContract) {
      try {
        gotchiIdToLending = await readJsonFile(`${GOTCHIS_FILENAME}_lendings.json`)
        // the file contains all gotchis: filter it down to only those with lendings
        gotchiIdToLending = Object.fromEntries(
          Object.entries(gotchiIdToLending).filter(([gotchiId, lending]) => !!lending)
        )
      } catch (e) {
        console.error('Fetch the lendings from the contract first using fetchLendings()')
        return
      }
    } else {
      console.log('Fetching lendings from subgraph')
      gotchiIdToLending = await fetchGotchiLendings(gotchiIds, ROUND.blocks.polygon)
    }
    console.log(`Found ${Object.keys(gotchiIdToLending).length} lent-out gotchis`)

    // If the gotchi has an active lending, those details contain the borrower/lender/originalOwner (handles Vault)
    for (const gotchi of gotchis) {
      const lending = gotchiIdToLending[gotchi.id]
      if (!lending) { continue }
      gotchi.borrower = lending.borrower
      gotchi.owner = lending.lender
      gotchi.realOwner = lending.originalOwner
    }
  } else {
    console.log('Not fetching gotchi lendings')
  }

  // For non-lent-out gotchis:
  // Find owners of gotchis bridged to Ethereum or in the Vault
  const ethGotchis = []
  const vaultGotchis = []
  for (const gotchi of gotchis) {
    if (gotchiIdToLending[gotchi.id]) {
      // lent-out gotchi already dealt with
      continue
    }
    if (gotchi.owner === ETH_BRIDGE_ADDRESS) {
      ethGotchis.push(gotchi)
    } else if (gotchi.owner === VAULT_ADDRESS) {
      vaultGotchis.push(gotchi)
    }
  }

  if (ROUND.blocks.eth) {
    console.log(`Find ${ethGotchis.length} Eth gotchi owners`)
    const gotchiIdToEthOwner = await fetchEthGotchiOwners(ethGotchis.map(g => g.id), ROUND.blocks.eth)
    for (const gotchi of ethGotchis) {
      gotchi.realOwner = gotchiIdToEthOwner[gotchi.id] || ''
    }
  } else {
    console.log('Not fetching ETH gotchi owners!')
  }

  if (SEASON.checkVault) {
    console.log(`Find ${vaultGotchis.length} Vault gotchi owners`)
    const gotchiIdToVaultOwner = await fetchVaultGotchiOwners(vaultGotchis.map(g => g.id), ROUND.blocks.polygon)
    for (const gotchi of vaultGotchis) {
      gotchi.realOwner = gotchiIdToVaultOwner[gotchi.id] || ''
    }
  } else {
    console.log('Not fetching Vault gotchi owners!')
  }

  await writeJsonFile(`${GOTCHIS_FILENAME}.json`, gotchis)
  console.log(`Written result to ${GOTCHIS_FILENAME}.json`)
}

const manuallyCalculateBRS = async function () {
  const gotchis = await readJsonFile(`${GOTCHIS_FILENAME}.json`)
  // The withSetsRarityScore from the graph seems to be buggy
  // Manually recalculate this: this introduces risk of getting a different result from the official one.
  // Different rarity farming seasons used different approaches for calculating rarity.
  const useJs1 = ROUND.rfCalc === 'js1'
  const useSubgraph = ROUND.rfCalc === 'subgraph'
  const useBest = ROUND.rfCalc === 'best'
  console.log('Using RF calculation approach', ROUND.rfCalc)
  if (!useJs1 && !useSubgraph && !useBest) {
    console.error('Invalid RF calculation specified', ROUND.rfCalc)
  }
  for (const gotchi of gotchis) {
    // The subgraph's sets are unreliable (withSetsNumericTraits, withSetsRarityScore, equippedSetID, equippedSetName)
    // Calculate sets and BRS manually
    const resultBest = await setHelpers.calculateBest(ROUND.wearableSets, gotchi)
    gotchi.withSetsNumericTraitsBest = resultBest.numericTraits
    gotchi.withSetsRarityScoreBest = resultBest.rarityScore
    gotchi.equippedSetNameBest = resultBest.wearableSetName
    if (useSubgraph) {
      // copy subgraph values
      gotchi.withSetsNumericTraitsRF = gotchi.withSetsNumericTraits
      gotchi.withSetsRarityScoreRF = gotchi.withSetsRarityScore
      gotchi.equippedSetNameRF = gotchi.equippedSetName
    } else if (useJs1) {
      // reproduce the RF JS1 calculation
      const resultJS1 = await setHelpers.calculateJS1(ROUND.wearableSets, gotchi)
      gotchi.withSetsNumericTraitsRF = resultJS1.numericTraits
      gotchi.withSetsRarityScoreRF = resultJS1.rarityScore
      gotchi.equippedSetNameRF = resultJS1.wearableSetName
    } else if (useBest) {
      // use the best calc
      gotchi.withSetsNumericTraitsRF = gotchi.withSetsNumericTraitsBest
      gotchi.withSetsRarityScoreRF = gotchi.withSetsRarityScoreBest
      gotchi.equippedSetNameRF = gotchi.equippedSetNameBest
    }
  }
  await writeJsonFile(`${GOTCHIS_FILENAME}_fixed.json`, gotchis)
  console.log(`Written result to ${GOTCHIS_FILENAME}_fixed.json`)
}

const runAll = async function () {
  await fetchRoundData()
  await fetchLendings()
  await fetchGotchiOwners()
  await manuallyCalculateBRS()
}
// ----------------------------------------------------
//  Uncomment One of the below functions to run
// ----------------------------------------------------

// runAll()
// fetchRoundData()
// fetchLendings()
// fetchGotchiOwners()
// manuallyCalculateBRS()

fetchGotchiImages({ fileName: GOTCHIS_FILENAME, folderName: GOTCHI_IMAGES_FOLDER })

// ----------------------------------------------------
