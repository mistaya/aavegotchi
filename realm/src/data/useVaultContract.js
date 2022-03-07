import { Contract } from 'ethers-multicall'
import { useMulticallProvider } from './useProvider'

let multicallProvider = null
const contractAddress = '0xdd564df884fd4e217c9ee6f65b4ba6e5641eac63'
const gotchiDiamondAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'

let contract = null

const initContract = function () {
  multicallProvider = useMulticallProvider()
  // ABI: only need functions we want to call
  const abi = [
    {
      inputs:
        [],
      name: 'getDepositors',
      outputs: [
        {
          internalType: 'address[]',
          name: '',
          type: 'address[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [
        {
          internalType: 'address',
          name: '_depositor',
          type: 'address'
        },
        {
          internalType: 'address',
          name: '_tokenAddress',
          type: 'address'
        }
      ],
      name: 'getTokenIdsOfDepositor',
      outputs: [
        {
          internalType: 'uint256[]',
          name: '',
          type: 'uint256[]'
        }
      ],
      stateMutability: 'view',
      type: 'function'
    }
  ]
  contract = new Contract(
    contractAddress,
    abi
  )
}

const vault = {
  getDepositors: async function () {
    if (!contract) {
      initContract()
    }
    const contractCalls = [contract.getDepositors()]
    const results = await multicallProvider.all(contractCalls)
    // console.log('getDepositors: Results', { results })
    // This result includes duplicates - use a Set to get uniques
    return [...(new Set(results[0]))]
  },
  getGotchiOwners: async function (ownerAddresses) {
    if (!contract) {
      initContract()
    }
    const contractCalls = ownerAddresses.map(owner => contract.getTokenIdsOfDepositor(owner, gotchiDiamondAddress))

    const results = await multicallProvider.all(contractCalls)
    // console.log({ results })
    const resultsByGotchiId = {}
    for (let i = 0; i < results.length; i++) {
      const gotchiIds = results[i]
      // store owner address as lowercase
      const owner = ownerAddresses[i].toLowerCase()
      for (const gotchiId of gotchiIds) {
        // gotchiId is an ethers BigNumber: convert it to a string
        resultsByGotchiId[gotchiId.toString()] = owner
      }
    }
    // console.log('getGotchiOwners: Results', resultsByGotchiId)
    return resultsByGotchiId
  }
}

export default function () {
  return vault
}
