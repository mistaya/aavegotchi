const { readJsonFile } = require('../../fileUtils.js')
const { ethers } = require('ethers')
const { Provider, Contract } = require('@pelith/ethers-multicall') // this fork of ethers-multicall supports blockTag

// https://chainlist.org/chain/137
// const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/')
// const provider = new ethers.providers.JsonRpcProvider('https://matic-mainnet.chainstacklabs.com')
// const provider = new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/polygon')
// const provider = new ethers.providers.JsonRpcProvider('https://rpc-mainnet.matic.quiknode.pro')
const provider = new ethers.providers.JsonRpcProvider('https://1rpc.io/matic')
// provide chainId so we don't need to call init
const multicallProvider = new Provider(provider, 137)

let contract = null

const initContract = async function () {
  // https://raw.githubusercontent.com/aavegotchi/aavegotchi-contracts/master/diamondABI/diamond.json
  const diamondAbi = await readJsonFile('./diamond/diamondAbi.json')
  const diamondAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'
  contract = new Contract(
    diamondAddress,
    diamondAbi
  )
}

const diamond = {
  /* array of [gotchiId, hauntId, collateralType, numericTraits, equippedWearables] */
  getPreviewAavegotchisSideSvgs: async function (gotchis) {
    const contractCalls = gotchis.map(([gotchiId, hauntId, collateralType, numericTraits, equippedWearables]) =>
      contract.previewSideAavegotchi(hauntId, collateralType, numericTraits, equippedWearables)
    )
    const results = await multicallProvider.all(contractCalls)
    const resultsByGotchiId = Object.fromEntries(
      results.map((result, index) => [gotchis[index]?.[0], result])
    )
    return resultsByGotchiId
  },

  getIsLent: async function (gotchiIds, blockNumber) {
    const contractCalls = gotchiIds.map(id =>
      contract.isAavegotchiLent(id)
    )
    const results = await multicallProvider.all(contractCalls, blockNumber)
    const resultsByGotchiId = Object.fromEntries(
      results.map((result, index) => [gotchiIds[index], result])
    )
    return resultsByGotchiId
  },

  getGotchiLending: async function (gotchiIds, blockNumber) {
    const contractCalls = gotchiIds.map(id =>
      contract.getGotchiLendingFromToken(id)
    )
    const results = await multicallProvider.all(contractCalls, blockNumber)
    const resultsByGotchiId = Object.fromEntries(
      results.map((result, index) => [gotchiIds[index], result])
    )
    return resultsByGotchiId
  }
}

initContract()

module.exports = diamond
