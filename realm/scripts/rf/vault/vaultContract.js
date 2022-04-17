const { readJsonFile } = require('../../fileUtils.js')
const { ethers } = require('ethers')
const { Provider, Contract } = require('ethers-multicall')

const provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/')
// provide chainId so we don't need to call init
const multicallProvider = new Provider(provider, 137)

let contract = null

const initContract = async function () {
  // get ABI from the implementation linked on gotchivault.com 0xDd4241Af59389145214f3b5EDA435204196A1e23
  const vaultAbi = await readJsonFile('./vault/vaultAbi.json')
  const vaultProxyAddress = '0xDd564df884Fd4e217c9ee6F65B4BA6e5641eAC63'
  contract = new Contract(
    vaultProxyAddress,
    vaultAbi
  )
}

const vaultContract = {
  getGotchiOwners: async function (gotchiIds) {
    const contractCalls = gotchiIds.map(gotchiId =>
      contract.getGotchi(gotchiId)
    )
    const results = await multicallProvider.all(contractCalls)
    const resultsByGotchiId = Object.fromEntries(
      results.map((result, index) => [gotchiIds[index], result[0].toLowerCase()])
    )
    return resultsByGotchiId
  }
}

initContract()

module.exports = vaultContract
