import { ethers } from 'ethers'
import { useProvider } from './useProvider'

let provider = null
const contractAddress = '0x86935F11C86623deC8a25696E1C19a8659CbF95d'

let contract = null

const initContract = function () {
  provider = useProvider()
  // ABI: only need functions we want to call
  const abi = [
    {
      inputs: [],
      name: 'getWearableSets',
      outputs: [
        {
          components: [
            {
              internalType: 'string',
              name: 'name',
              type: 'string'
            },
            {
              internalType: 'uint8[]',
              name: 'allowedCollaterals',
              type: 'uint8[]'
            },
            {
              internalType: 'uint16[]',
              name: 'wearableIds',
              type: 'uint16[]'
            },
            {
              internalType: 'int8[5]',
              name: 'traitsBonuses',
              type: 'int8[5]'
            }
          ],
          internalType: 'struct WearableSet[]',
          name: 'wearableSets_',
          type: 'tuple[]'
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

const aavegotchi = {
  getWearableSets: async function () {
    if (!contract) {
      initContract()
    }
    return contract.getWearableSets().then(
      result => {
        return result.map((item, index) => ({
          // Wearable sets don't have ids, so generate them
          id: index + 1,
          name: item.name,
          allowedCollaterals: item.allowedCollaterals,
          wearableIds: item.wearableIds,
          traitsBonuses: item.traitsBonuses
        }))
      },
      error => { throw error }
    )
  }
}

export default function useAavegotchiContract () {
  return aavegotchi
}
