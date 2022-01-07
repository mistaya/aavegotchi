import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import abi from './pockets/aaveContractAbi.json'

let provider = null
const contractAddress = '0x357D51124f59836DeD84c8a1730D72B749d8BC23'

let contract = null

const initContract = function () {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider('https://polygon-rpc.com/')
  }
  contract = new ethers.Contract(
    contractAddress,
    abi,
    provider
  )
}

const aave = {
  // call manually
  getGotchiRewardsBalance (gotchi) {
    if (!contract) {
      initContract()
    }
    // console.log('Get aave rewards balance', gotchi)
    return contract.getRewardsBalance([gotchi.collateral], gotchi.escrow).then(
      result => {
        // ethers returns the result as its own BigNumber - convert it
        const resultNum = new BigNumber(result.toString()).div(10e17)
        // console.log('getRewardsBalance: Result', gotchi.escrow, result, `${resultNum.toString()} WMATIC`)
        return resultNum
      },
      error => {
        console.error('getRewardsBalance: Error calling contract function', error)
        throw error
      }
    )
  }
}

export default function useAave () {
  return aave
}
