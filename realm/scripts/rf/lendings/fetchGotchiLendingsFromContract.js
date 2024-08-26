const { readJsonFile, writeJsonFile } = require('../../fileUtils.js')
const diamond = require('../diamond/diamond.js')

const fetchGotchiLendings = async function ({ gotchiIds, fileName, blockNumber }) {
  let lendingsByGotchiId = {}
  try {
    lendingsByGotchiId = await readJsonFile(fileName)
  } catch (e) {
    console.log(`Error opening file ${fileName}`)
  }

  // Don't want re-fetch lendings for gotchiIds we already have
  const fetchedIds = Object.keys(lendingsByGotchiId)
  const gotchisToFetch = gotchiIds.filter(id => !fetchedIds.includes(id))
  console.log(`There are total ${gotchiIds.length} to look up lendings for.`)
  console.log(`There are ${fetchedIds.length} already fetched, fetching remaining ${gotchisToFetch.length} gotchi lendings`)

  const BATCH_SIZE = 500

  for (let i = 0; i < gotchisToFetch.length; i += BATCH_SIZE) {
    const batchGotchis = gotchisToFetch.slice(i, i + BATCH_SIZE)
    console.log(`Fetching lendings for gotchis #${i} to ${i + BATCH_SIZE - 1}`)
    const isLentByGotchiId = await diamond.getIsLent(batchGotchis, blockNumber)
    const batchLentGotchiIds = batchGotchis.filter(id => isLentByGotchiId[id])
    const batchLendingsByGotchiId = await diamond.getGotchiLending(batchLentGotchiIds, blockNumber)

    for (const id of batchGotchis) {
      if (batchLendingsByGotchiId[id]) {
        const lending = batchLendingsByGotchiId[id]
        lendingsByGotchiId[id] = {
          id: lending.listingId,
          gotchiTokenId: id,
          borrower: lending.borrower,
          lender: lending.lender,
          originalOwner: lending.originalOwner
        }
      } else {
        lendingsByGotchiId[id] = null
      }
    }
    await writeJsonFile(fileName, lendingsByGotchiId)
  }
  console.log(`Written gotchi lendings to ${fileName}`)
}

module.exports = fetchGotchiLendings
