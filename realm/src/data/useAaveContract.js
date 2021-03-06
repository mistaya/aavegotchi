import BigNumber from 'bignumber.js'
import { Contract } from 'ethers-multicall'
import { useMulticallProvider } from './useProvider'

let multicallProvider = null
const contractAddress = '0x357D51124f59836DeD84c8a1730D72B749d8BC23'

let contract = null

const initContract = function () {
  multicallProvider = useMulticallProvider()
  // ABI: only need functions we want to call
  const abi = [
    {
      inputs:
      [
        {
          internalType: 'address[]',
          name: 'assets',
          type: 'address[]'
        },
        {
          internalType: 'address',
          name: 'user',
          type: 'address'
        }
      ],
      name: 'getRewardsBalance',
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
  contract = new Contract(
    contractAddress,
    abi
  )
}

const aave = {
  /* gotchi objects should have id, escrow and collateral */
  getGotchiRewardsBalances: async function (gotchis) {
    if (!contract) {
      initContract()
    }
    // console.log('Get aave rewards balances', gotchis)
    const contractCalls = gotchis.map(gotchi => contract.getRewardsBalance([gotchi.collateral], gotchi.escrow))

    const results = await multicallProvider.all(contractCalls)
    // console.log({ results })
    // ethers returns the result as its own BigNumber - convert it
    const resultsByGotchiId = Object.fromEntries(
      results.map((result, index) => [gotchis[index]?.id, new BigNumber(result.toString()).div(10e17)])
    )
    // console.log('getRewardsBalances: Results', gotchis, resultsByGotchiId)
    return resultsByGotchiId
  }
}

export default function useAave () {
  return aave
}
