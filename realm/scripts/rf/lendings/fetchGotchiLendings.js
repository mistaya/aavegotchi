const axios = require('axios')
const FETCH_PAGE_SIZE = 1000

const fetchGotchiLendings = async function (gotchiIds, polygonBlock) {
  const LENDING_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-core-matic'
  return new Promise((resolve, reject) => {
    let results = []
    let nextIndex = 0
    const fetchFromSubgraph = function () {
      const idsToFetch = gotchiIds.slice(nextIndex, nextIndex + FETCH_PAGE_SIZE) // end index not included
      console.log(`Fetching batch of ${idsToFetch.length} potential gotchi lendings... ${nextIndex} to ${nextIndex + FETCH_PAGE_SIZE - 1} at block ${polygonBlock}`)
      axios.post(LENDING_SUBGRAPH_URL, {
        query: `{
          gotchiLendings(
            block: { number: ${polygonBlock} },
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

module.exports = fetchGotchiLendings
