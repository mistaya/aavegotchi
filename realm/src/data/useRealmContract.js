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
    },
    {
      inputs:
      [
        {
          internalType: 'uint256',
          name: '_parcelId',
          type: 'uint256'
        }
      ],
      name: 'getParcelLastChanneled',
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
    },
    {
      inputs: [
        {
          internalType: 'uint256[]',
          name: '_parcelIds',
          type: 'uint256[]'
        },
        {
          internalType: 'uint256[]',
          name: '_actionRights',
          type: 'uint256[]'
        }
      ],
      name: 'getParcelsAccessRights',
      outputs:
      [
        {
          internalType: 'uint256[]',
          name: 'output_',
          type: 'uint256[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    // Grid getters
    {
      inputs:
      [
        {
          internalType: 'uint256',
          name: '_parcelId',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_gridType',
          type: 'uint256'
        }
      ],
      name: 'getHumbleGrid',
      outputs:
      [
        {
          internalType: 'uint256[8][8]',
          name: 'output_',
          type: 'uint256[8][8]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs:
      [
        {
          internalType: 'uint256',
          name: '_parcelId',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_gridType',
          type: 'uint256'
        }
      ],
      name: 'getReasonableGrid',
      outputs:
      [
        {
          internalType: 'uint256[16][16]',
          name: 'output_',
          type: 'uint256[16][16]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs:
      [
        {
          internalType: 'uint256',
          name: '_parcelId',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_gridType',
          type: 'uint256'
        }
      ],
      name: 'getSpaciousHorizontalGrid',
      outputs:
      [
        {
          internalType: 'uint256[64][32]',
          name: 'output_',
          type: 'uint256[64][32]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs:
      [
        {
          internalType: 'uint256',
          name: '_parcelId',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_gridType',
          type: 'uint256'
        }
      ],
      name: 'getSpaciousVerticalGrid',
      outputs:
      [
        {
          internalType: 'uint256[32][64]',
          name: 'output_',
          type: 'uint256[32][64]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs:
      [
        {
          internalType: 'uint256',
          name: '_parcelId',
          type: 'uint256'
        },
        {
          internalType: 'uint256',
          name: '_gridType',
          type: 'uint256'
        }
      ],
      name: 'getPaartnerGrid',
      outputs:
      [
        {
          internalType: 'uint256[64][64]',
          name: 'output_',
          type: 'uint256[64][64]'
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
  },
  getParcelLastChanneled: async function (parcelId) {
    if (!contract) {
      initContract()
    }
    return contract.getParcelLastChanneled(parcelId).then(
      result => {
        return result - 0 // result is a BigNumber
      },
      error => { throw error }
    )
  },
  getParcelsAccessRights: async function (parcelIds, actionIds) {
    if (!contract) {
      initContract()
    }
    const promises = []
    for (const actionId of actionIds) {
      const actionIdsForParcels = parcelIds.map(id => actionId)
      const promise = contract.getParcelsAccessRights(parcelIds, actionIdsForParcels)
      promises.push(promise)
    }
    return Promise.all(promises).then(results => {
      for (let i = 0; i < results.length; i++) {
        results[i] = results[i].map(num => num - 0) // convert from BigNumber to a normal number
      }
      return results
    })
  },
  getParcelGrid: async function (id, sizeNumber) {
    if (!contract) {
      initContract()
    }
    const FUNCTION_NAMES = [
      'getHumbleGrid', 'getReasonableGrid', 'getSpaciousVerticalGrid', 'getSpaciousHorizontalGrid', 'getPaartnerGrid'
    ]
    const functionName = FUNCTION_NAMES[sizeNumber]
    if (!functionName) {
      console.error('Unknown size', sizeNumber)
      return Promise.reject(new Error('Unknown parcel size'))
    }
    const fetchingInstallations = contract[functionName](id, 0).then(
      result => {
        return result
      },
      error => { throw error }
    )
    const fetchingTiles = contract[functionName](id, 1).then(
      result => {
        return result
      },
      error => { throw error }
    )
    return Promise.all([fetchingInstallations, fetchingTiles]).then(
      ([installationsGrid, tilesGrid]) => {
        // console.log('Fetched parcel grid', { installationsGrid, tilesGrid })
        return { installationsGrid, tilesGrid }
      }
    )
  }
}

export default function useRealmContract () {
  return realm
}
