import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { useProvider } from './useProvider'

let provider = null
// vGHST token address
const contractAddress = '0x51195e21BDaE8722B29919db56d95Ef51FaecA6C'

let contract = null

const initContract = function () {
  provider = useProvider()
  // ABI: only need functions we want to call
  const abi = [
    {
      inputs: [
        {
          internalType: 'uint256',
          name: '_share',
          type: 'uint256'
        }
      ],
      name: 'convertVGHST',
      outputs: [
        {
          internalType: 'uint256',
          name: '_ghst',
          type: 'uint256'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    }
  ]
  contract = new ethers.Contract(
    contractAddress,
    abi,
    provider
  )
}

const vghst = {
  getGhstExchangeRate: async function () {
    if (!contract) {
      initContract()
    }
    // provide 1 vGHST as input param
    return contract.convertVGHST('1000000000000000000').then(
      result => {
        // ethers returns the result as its own BigNumber - convert it
        return new BigNumber(result.toString()).div(10e17)
      },
      error => { throw error }
    )
  }
}

export default function () {
  return vghst
}
