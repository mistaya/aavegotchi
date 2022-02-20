import { Contract } from 'ethers-multicall'

export default function useERC20Contract (contractAddress) {
  const contract = new Contract(
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
  return contract
}
