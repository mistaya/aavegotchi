import { ethers } from 'ethers'
import { useProvider } from './useProvider'

let provider = null
const contractAddress = '0x1D0360BaC7299C86Ec8E99d0c1C9A95FEfaF2a11'

let contract = null

const initContract = function () {
  provider = useProvider()
  // ABI: only need functions we want to call
  const abi = [
    {
      inputs:
      [
        {
          internalType: 'uint256',
          name: '_gotchiId',
          type: 'uint256'
        }
      ],
      name: 'getLastChanneled',
      outputs:
      [
        {
          internalType: 'uint256',
          name: '',
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

const realm = {
  getLastChanneled: async function (gotchiId) {
    if (!contract) {
      initContract()
    }
    return contract.getLastChanneled(gotchiId).then(
      result => {
        return result - 0 // result is a BigNumber
      },
      error => { throw error }
    )
  }
}

export default function useRealmContract () {
  return realm
}
