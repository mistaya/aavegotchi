import BigNumber from 'bignumber.js'
import { Contract } from 'ethers-multicall'
import { useMulticallProvider } from './useProvider'

let multicallProvider = null
const contractAddress = '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7'

let contract = null

const initContract = function () {
  multicallProvider = useMulticallProvider()
  contract = new Contract(
    contractAddress,
    // ABI: only need functions we want to call
    [
      // ERC20 balanceOf function
      {
        inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
        name: 'balanceOf',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function'
      }
    ]
  )
}

const ghst = {
  /* gotchi objects should have id and escrow */
  getGotchiBalances: async function (gotchis) {
    if (!contract) {
      initContract()
    }
    // console.log('Get ghst balances', gotchis)
    const contractCalls = gotchis.map(gotchi => contract.balanceOf(gotchi.escrow))

    const results = await multicallProvider.all(contractCalls)
    // console.log({ results })
    // ethers returns the result as its own BigNumber - convert it
    const resultsByGotchiId = Object.fromEntries(
      results.map((result, index) => [gotchis[index]?.id, new BigNumber(result.toString()).div(10e17)])
    )
    // console.log('getGotchiBalances: Results', gotchis, resultsByGotchiId)
    return resultsByGotchiId
  }
}

export default function useGhst () {
  return ghst
}
