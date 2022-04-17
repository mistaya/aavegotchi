const axios = require('axios')
const { writeJsonFile, readJsonFile, writeTextFile } = require('../fileUtils.js')
const BigNumber = require('bignumber.js')
const setHelpers = require('./sets/setHelpers.js')
const diamond = require('./diamond/diamond.js')
const vaultContract = require('./vault/vaultContract.js')

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
    },
    rnd3: {
      polygon: 26854118,
      eth: 14539158
    }
  }
}

// Params for this run
// - round
const BLOCKS = RF_BLOCKS.szn3.rnd3
const ROUND_WINNERS_FILE = '../../public/data/rf/szn3/rnd3.json'
const GOTCHIS_FILENAME = 'rnd3Gotchis'
// - season
const SEASON_REWARDS_FILE = '../../public/data/rf/szn3/rewards.json'
const NUM_ROUNDS = 4
const GOTCHI_IMAGES_FOLDER = './svgs'

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
  // First look up lent-out gotchis
  const gotchiIds = gotchis.map(gotchi => gotchi.id)
  const gotchiIdToLending = await fetchGotchiLendings(gotchiIds)
  console.log(`Found ${Object.keys(gotchiIdToLending).length} lent-out gotchis`)

  // If the gotchi has an active lending, those details contain the borrower/lender/originalOwner (handles Vault)
  for (const gotchi of gotchis) {
    const lending = gotchiIdToLending[gotchi.id]
    if (!lending) { continue }
    gotchi.borrower = lending.borrower
    gotchi.owner = lending.lender
    gotchi.realOwner = lending.originalOwner
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

const fetchGotchiLendings = async function (gotchiIds) {
  const LENDING_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/froid1911/aavegotchi-lending'
  return new Promise((resolve, reject) => {
    let results = []
    let nextIndex = 0
    const fetchFromSubgraph = function () {
      const idsToFetch = gotchiIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      console.log(`Fetching batch of ${idsToFetch.length} potential gotchi lendings... ${nextIndex} to ${nextIndex + FETCH_PAGE_SIZE - 1} at block ${BLOCKS.polygon}`)
      axios.post(LENDING_SUBGRAPH_URL, {
        query: `{
          gotchiLendings(
            block: { number: ${BLOCKS.polygon} },
            first: ${FETCH_PAGE_SIZE},
            where: {
              cancelled: false,
              completed: false,
              timeAgreed_gt: 0,
              gotchiTokenId_in: ${JSON.stringify(idsToFetch)}
            }
          ) {
            id
            gotchiTokenId,
            borrower
            lender
            originalOwner
          }
        }`
      }).then(async response => {
        if (response.data.data?.gotchiLendings) {
          results = results.concat(response.data.data.gotchiLendings)
          console.log(`Received ${response.data.data.gotchiLendings.length} lendings; total ${results.length}`)
          if (nextIndex + FETCH_PAGE_SIZE >= gotchiIds.length) {
            // finished fetching all pages
            console.log(`Fetched all ${results.length} gotchi lendings in ${gotchiIds.length} potential gotchis`)
            const gotchiIdToLending = Object.fromEntries(
              results.map(r => [r.gotchiTokenId, r])
            )
            resolve(gotchiIdToLending)
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

const fetchVaultGotchiOwners = async function (gotchiIds) {
  const result = {}
  const BATCH_SIZE = 500
  for (let i = 0; i < gotchiIds.length; i += BATCH_SIZE) {
    const batchGotchis = gotchiIds.slice(i, i + BATCH_SIZE)
    console.log(`Fetching vault owners of gotchis #${i} to ${i + BATCH_SIZE - 1}`)
    const ownersByGotchiId = await vaultContract.getGotchiOwners(batchGotchis)
    Object.assign(result, ownersByGotchiId)
  }
  console.log(`Found vault owners for ${Object.keys(result).length} gotchis`)
  return result
  /*
  // TODO this subgraph is no longer accurate since lendings started
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
  */
}

const manuallyCalculateBRS = async function () {
  const gotchis = await readJsonFile(`${GOTCHIS_FILENAME}.json`)
  await setHelpers.init()
  // The withSetsRarityScore from the graph seems to be buggy
  // Manually recalculate this: this introduces risk of getting a different result from the official one.
  for (const gotchi of gotchis) {
    // The subgraph's sets are unreliable (withSetsNumericTraits, withSetsRarityScore, equippedSetID, equippedSetName)
    // Calculate sets and BRS manually
    const resultBest = setHelpers.calculateBest(gotchi)
    gotchi.withSetsNumericTraitsBest = resultBest.numericTraits
    gotchi.withSetsRarityScoreBest = resultBest.rarityScore
    gotchi.equippedSetNameBest = resultBest.wearableSetName
    const resultRF = setHelpers.calculateRF(gotchi)
    gotchi.withSetsNumericTraitsRF = resultRF.numericTraits
    gotchi.withSetsRarityScoreRF = resultRF.rarityScore
    gotchi.equippedSetNameRF = resultRF.wearableSetName
  }
  await writeJsonFile(`${GOTCHIS_FILENAME}_fixed.json`, gotchis)
  console.log(`Written result to ${GOTCHIS_FILENAME}_fixed.json`)
}

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

const runAll = async function () {
  await fetchRoundData()
  await fetchGotchiOwners()
  await manuallyCalculateBRS()
}
// ----------------------------------------------------
//  Uncomment One of the below functions to run
// ----------------------------------------------------

runAll()
// fetchRoundData()
// fetchGotchiOwners()
// manuallyCalculateBRS()

// fetchGotchiImages()

// ----------------------------------------------------
