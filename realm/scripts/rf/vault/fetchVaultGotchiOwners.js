const axios = require('axios')
const FETCH_PAGE_SIZE = 1000

const fetchVaultGotchiOwners = async function (gotchiIds, polygonBlock) {
  // TEMP WORKAROUND ONLY: Fetching directly from the contract with multicall uses the latest block.
  // To specify a custom block, need to use a fork https://github.com/joshstevens19/ethereum-multicall/issues/2
  /*
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
  */

  // Alternate approach using subgraph.
  const VAULT_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/gotchi-vault'

  return new Promise((resolve, reject) => {
    let results = []
    let nextIndex = 0
    const fetchFromSubgraph = function () {
      const idsToFetch = gotchiIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      console.log(`Fetching batch of ${idsToFetch.length} vault gotchi owners... ${nextIndex} to ${nextIndex + FETCH_PAGE_SIZE - 1} at block ${polygonBlock}`)
      axios.post(VAULT_SUBGRAPH_URL, {
        query: `{
          aavegotchis(block: { number: ${polygonBlock} }, first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(idsToFetch)} }) {
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

module.exports = fetchVaultGotchiOwners
