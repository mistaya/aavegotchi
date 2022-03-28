const axios = require('axios')
const { writeJsonFile, readJsonFile } = require('./fileUtils.js')
const BigNumber = require('bignumber.js')
const calculateWithSets = require('./calculateWithSets.js')
// const diamond = require('./diamond.js')

// Snapshot blocks
const RF_BLOCKS = {
  szn3: {
    rnd1: {
      polygon: 25806267,
      eth: 14359489
    },
    rnd2: {
      polygon: 26308346,
      eth: 14449396
    }
  }
}

// Params for this run
// - round
const BLOCKS = RF_BLOCKS.szn3.rnd1
const ROUND_WINNERS_FILE = '../public/data/rf/szn3/rnd1.json'
const GOTCHIS_FILENAME = 'rnd1Gotchis'
// - season
const SEASON_REWARDS_FILE = '../public/data/rf/szn3/rewards.json'
const NUM_ROUNDS = 4
// const GOTCHI_IMAGES_FOLDER = './svgs'

const ETH_BRIDGE_ADDRESS = '0x86935f11c86623dec8a25696e1c19a8659cbf95d'
const VAULT_ADDRESS = '0xdd564df884fd4e217c9ee6f65b4ba6e5641eac63'

const SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
const FETCH_PAGE_SIZE = 1000

const fetchGotchis = function (gotchiIds) {
  return new Promise((resolve, reject) => {
    let gotchis = []
    let nextIndex = 0
    const fetchFromSubgraph = function () {
      const idsToFetch = gotchiIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      console.log(`Fetching batch of ${idsToFetch.length} gotchis... ${nextIndex} to ${nextIndex + FETCH_PAGE_SIZE - 1} at block ${BLOCKS.polygon}`)
      axios.post(SUBGRAPH_URL, {
        query: `{
          aavegotchis(block: { number: ${BLOCKS.polygon} }, first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(idsToFetch)} }) {
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
              owner: gotchi.owner.id
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
          gotchi.leaderboards[type].reward = (new BigNumber(seasonRewardForPosition)).div(NUM_ROUNDS).toString()
        }
      }
    }
  }

  // Write the gotchis to file
  await writeJsonFile(`${GOTCHIS_FILENAME}.json`, gotchis)
  console.log(`Written result to ${GOTCHIS_FILENAME}.json`)
}

const fetchGotchiOwners = async function () {
  const gotchis = await readJsonFile(`${GOTCHIS_FILENAME}.json`)
  // Find owners of gotchis bridged to Ethereum or in the Vault
  const ethGotchis = []
  const vaultGotchis = []
  for (const gotchi of gotchis) {
    if (gotchi.owner === ETH_BRIDGE_ADDRESS) {
      ethGotchis.push(gotchi)
    } else if (gotchi.owner === VAULT_ADDRESS) {
      vaultGotchis.push(gotchi)
    }
  }
  console.log(`Find ${ethGotchis.length} Eth gotchi owners`)
  const gotchiIdToEthOwner = await fetchEthGotchiOwners(ethGotchis.map(g => g.id))
  for (const gotchi of ethGotchis) {
    gotchi.realOwner = gotchiIdToEthOwner[gotchi.id] || ''
  }

  console.log(`Find ${vaultGotchis.length} Vault gotchi owners`)
  const gotchiIdToVaultOwner = await fetchVaultGotchiOwners(vaultGotchis.map(g => g.id))
  for (const gotchi of vaultGotchis) {
    gotchi.realOwner = gotchiIdToVaultOwner[gotchi.id] || ''
  }

  await writeJsonFile(`${GOTCHIS_FILENAME}.json`, gotchis)
  console.log(`Written result to ${GOTCHIS_FILENAME}.json`)
}

const fetchEthGotchiOwners = function (gotchiIds) {
  const ETH_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-ethereum'
  return new Promise((resolve, reject) => {
    let results = []
    let nextIndex = 0
    const fetchFromSubgraph = function () {
      const idsToFetch = gotchiIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      console.log(`Fetching batch of ${idsToFetch.length} eth gotchi owners... ${nextIndex} to ${nextIndex + FETCH_PAGE_SIZE - 1} at block ${BLOCKS.eth}`)
      axios.post(ETH_SUBGRAPH_URL, {
        query: `{
          aavegotchis(block: { number: ${BLOCKS.eth} }, first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(idsToFetch)} }) {
            id
            owner {
              id
            }
          }
        }`
      }).then(async response => {
        if (response.data.data?.aavegotchis) {
          results = results.concat(
            response.data.data.aavegotchis.map(gotchi => ({
              ...gotchi,
              owner: gotchi.owner.id
            }))
          )
          console.log(`Received ${response.data.data.aavegotchis.length}; total ${results.length}`)
          if (nextIndex + FETCH_PAGE_SIZE >= gotchiIds.length) {
            // finished fetching all pages
            console.log(`Fetched all ${results.length} eth gotchi owners`)
            const gotchiIdToOwner = Object.fromEntries(
              results.map(r => [r.id, r.owner])
            )
            resolve(gotchiIdToOwner)
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

const fetchVaultGotchiOwners = function (gotchiIds) {
  const VAULT_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-vault'
  return new Promise((resolve, reject) => {
    let results = []
    let nextIndex = 0
    const fetchFromSubgraph = function () {
      const idsToFetch = gotchiIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      console.log(`Fetching batch of ${idsToFetch.length} vault gotchi owners... ${nextIndex} to ${nextIndex + FETCH_PAGE_SIZE - 1} at block ${BLOCKS.polygon}`)
      axios.post(VAULT_SUBGRAPH_URL, {
        query: `{
          aavegotchis(block: { number: ${BLOCKS.polygon} }, first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(idsToFetch)} }) {
            id
            owner {
              id
            }
          }
        }`
      }).then(async response => {
        if (response.data.data?.aavegotchis) {
          results = results.concat(
            response.data.data.aavegotchis.map(gotchi => ({
              ...gotchi,
              owner: gotchi.owner.id
            }))
          )
          console.log(`Received ${response.data.data.aavegotchis.length}; total ${results.length}`)
          if (nextIndex + FETCH_PAGE_SIZE >= gotchiIds.length) {
            // finished fetching all pages
            console.log(`Fetched all ${results.length} vault gotchi owners`)
            const gotchiIdToOwner = Object.fromEntries(
              results.map(r => [r.id, r.owner])
            )
            resolve(gotchiIdToOwner)
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

const manuallyCalculateBRS = async function () {
  const gotchis = await readJsonFile(`${GOTCHIS_FILENAME}.json`)
  await calculateWithSets.init()
  // The withSetsRarityScore from the graph seems to be buggy
  // Manually recalculate this: this introduces risk of getting a different result from the official one.
  for (const gotchi of gotchis) {
    // gotchi.withSetsNumericTraitsOriginal = gotchi.withSetsNumericTraits
    // gotchi.withSetsRarityScoreOriginal = gotchi.withSetsRarityScore
    // gotchi.equippedSetNameOriginal = gotchi.equippedSetName
    // Testing: for comparison, calculate sets and BRS both ways
    const resultBest = calculateWithSets.calculate(gotchi)
    gotchi.withSetsNumericTraitsBest = resultBest.numericTraits
    gotchi.withSetsRarityScoreBest = `${resultBest.rarityScore}`
    gotchi.equippedSetNameBest = resultBest.wearableSetName
    const resultRF = calculateWithSets.calculate(gotchi, true)
    gotchi.withSetsNumericTraitsRF = resultRF.numericTraits
    gotchi.withSetsRarityScoreRF = `${resultRF.rarityScore}`
    gotchi.equippedSetNameRF = resultRF.wearableSetName
  }
  await writeJsonFile(`${GOTCHIS_FILENAME}_fixed.json`, gotchis)
  console.log(`Written result to ${GOTCHIS_FILENAME}_fixed.json`)
}

const runAll = async function () {
  await fetchRoundData()
  await fetchGotchiOwners()
  await manuallyCalculateBRS()
}
// ----------------------------------------------------
//  Uncomment One of the below functions to run
// ----------------------------------------------------

// runAll()
// fetchRoundData()
// fetchGotchiOwners()
manuallyCalculateBRS()

// ----------------------------------------------------
/*
// This works, but takes up too much space storing the images

const gotchiHideDefaultBgSvg = `
    <style>
        .gotchi-bg { display: none }
    </style>
`
const hideDefaultBg = function (svgText) {
  // simple hack, assumes there is a <g class="gotchi-eyeColor" in the SVG
  // This might break in future
  const insertionPoint = '<g class="gotchi-eyeColor'
  return svgText.replace(insertionPoint, `${gotchiHideDefaultBgSvg}${insertionPoint}`)
}
const tweakSvg = function (svgText) {
  return hideDefaultBg(svgText)
}

const fetchGotchiImages = async function () {
  const gotchis = await readJsonFile(`${GOTCHIS_FILENAME}.json`)
  const writingFiles = []
  const BATCH_SIZE = 10
  for (let i = 0; i < gotchis.length; i += BATCH_SIZE) {
    const batchGotchis = gotchis.slice(i, i + BATCH_SIZE)
    console.log(`Fetching images for gotchis #${i} to ${i + BATCH_SIZE - 1}`)
    const batchGotchiParams = batchGotchis.map(gotchi => [
      gotchi.id,
      gotchi.hauntId,
      gotchi.collateral,
      gotchi.numericTraits,
      gotchi.equippedWearables
    ])
    const svgsByGotchiId = await diamond.getPreviewAavegotchisSideSvgs(batchGotchiParams)
    for (const gotchiId in svgsByGotchiId) {
      const svgs = svgsByGotchiId[gotchiId]
      const svgText = tweakSvg(svgs[0])
      const svgFilename = `${GOTCHI_IMAGES_FOLDER}/${gotchiId}.svg`
      // console.log(`Writing svg to ${svgFilename}`)
      writingFiles.push(writeTextFile(svgFilename, svgText))
    }
  }
  await Promise.all(writingFiles)
  console.log(`Written svgs to ${GOTCHI_IMAGES_FOLDER}`)
}
*/

// fetchGotchiImages()
