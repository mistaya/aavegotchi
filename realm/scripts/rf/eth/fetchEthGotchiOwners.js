const axios = require('axios')
const FETCH_PAGE_SIZE = 1000

const fetchEthGotchiOwners = function (gotchiIds, ethBlock) {
  const ETH_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-ethereum'
  return new Promise((resolve, reject) => {
    let results = []
    let nextIndex = 0
    const fetchFromSubgraph = function () {
      const idsToFetch = gotchiIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      console.log(`Fetching batch of ${idsToFetch.length} eth gotchi owners... ${nextIndex} to ${nextIndex + FETCH_PAGE_SIZE - 1} at block ${ethBlock}`)
      axios.post(ETH_SUBGRAPH_URL, {
        query: `{
          aavegotchis(block: { number: ${ethBlock} }, first: ${FETCH_PAGE_SIZE}, where: { id_in: ${JSON.stringify(idsToFetch)} }) {
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

module.exports = fetchEthGotchiOwners
