const { readJsonFile } = require('../../fileUtils.js')
const { ethers } = require('ethers')
const { MulticallWrapper } = require('ethers-multicall-provider') // this supports blockTag

const RPC = {
  // https://chainlist.org/chain/8453
  polygon: 'https://polygon-rpc.com/',
  // 'https://matic-mainnet.chainstacklabs.com'
  // 'https://rpc.ankr.com/polygon'
  // 'https://rpc-mainnet.matic.quiknode.pro'
  // 'https://polygon.llamarpc.com'
  // base: 'https://base-rpc.publicnode.com'
  // base: 'https://base.llamarpc.com'
  base: 'https://base.drpc.org'
  // Troubleshooting:
  // - contract error 'missing trie node' when attempting multicall means the node doesn't have historical (blockNumber) data available, so try another RPC
  // - too big, or gas limit exceeded: reduce the BATCH_SIZE in fetchGotchiLendingsFromContract or fetchGotchiImages
  // - gotchi images: can't parse result: try a different RPC
}

// const CHAIN_ID = {
//   polygon: 137,
//   base: 8453
// }

const DIAMOND_ADDRESS = {
  polygon: '0x86935F11C86623deC8a25696E1C19a8659CbF95d',
  base: '0xA99c4B08201F2913Db8D28e71d020c4298F29dBF'
}

const initDiamond = async function (network) {
  const provider = new ethers.JsonRpcProvider(RPC[network])

  const multicallProvider = MulticallWrapper.wrap(provider)

  let contract = null

  const initContract = async function () {
    // https://raw.githubusercontent.com/aavegotchi/aavegotchi-contracts/master/diamondABI/diamond.json
    const diamondAbi = await readJsonFile('./diamond/diamondAbi.json')
    const diamondAddress = DIAMOND_ADDRESS[network]
    contract = new ethers.Contract(
      diamondAddress,
      diamondAbi,
      multicallProvider
    )
    // console.log('initContract', contract)
  }

  const diamond = {
    /* array of [gotchiId, hauntId, collateralType, numericTraits, equippedWearables] */
    getPreviewAavegotchisSideSvgs: async function (gotchis) {
      // eslint-disable-next-line no-unused-vars
      const contractCalls = gotchis.map(([gotchiId, hauntId, collateralType, numericTraits, equippedWearables]) => {
        // console.log('call', hauntId, collateralType, numericTraits, equippedWearables)
        return contract.previewSideAavegotchi(hauntId, collateralType, numericTraits, equippedWearables)
      }
      )
      const results = await Promise.all(contractCalls)
      const resultsByGotchiId = Object.fromEntries(
        results.map((result, index) => [gotchis[index]?.[0], result])
      )
      return resultsByGotchiId
    },

    getIsLent: async function (gotchiIds, blockNumber) {
      const overrides = { blockTag: blockNumber }
      console.log(`contract multicall: getIsLent for ${gotchiIds.length} gotchis`)
      const contractCalls = gotchiIds.map(id =>
        contract.isAavegotchiLent(id, overrides)
      )
      const results = await Promise.all(contractCalls)
      const resultsByGotchiId = Object.fromEntries(
        results.map((result, index) => [gotchiIds[index], result])
      )
      // console.log('is lent results', resultsByGotchiId)
      return resultsByGotchiId
    },

    getGotchiLending: async function (gotchiIds, blockNumber) {
      if (!gotchiIds.length) {
        console.log(`contract multicall: getGotchiLending for ${gotchiIds.length} gotchis (skipping)`)
        return {}
      }
      const overrides = { blockTag: blockNumber }
      console.log(`contract multicall: getGotchiLending for ${gotchiIds.length} gotchis`)
      const contractCalls = gotchiIds.map(id =>
        contract.getGotchiLendingFromToken(id, overrides)
      )
      const results = await Promise.all(contractCalls)
      const resultsByGotchiId = Object.fromEntries(
        results.map((result, index) => [gotchiIds[index], result?.toObject()])
      )
      // console.log('lending results', resultsByGotchiId)
      return resultsByGotchiId
    }
  }

  await initContract()

  return diamond
}

const diamonds = {}

const getDiamond = async function (network) {
  if (!diamonds[network]) {
    diamonds[network] = await initDiamond(network)
  }
  return diamonds[network]
}
module.exports = getDiamond
