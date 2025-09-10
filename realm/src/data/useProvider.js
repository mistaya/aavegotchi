import { ethers } from 'ethers'
import { MulticallWrapper } from 'ethers-multicall-provider'
import { useNetworkCachedItem } from '@/environment/useNetwork'

// https://chainlist.org/
const RPC_URL = {
  // polygon: 'https://polygon-rpc.com',
  polygon: 'https://polygon-bor-rpc.publicnode.com',
  // base: 'https://base.drpc.org'
  // base: 'https://1rpc.io/base'
  // base: 'https://0xrpc.io/base'
  // base: 'https://base.llamarpc.com'
  base: 'https://base-rpc.publicnode.com'
}
const CHAIN_ID = {
  polygon: 137,
  base: 8453
}

const { getItemForNetwork: getProviderForNetwork } = useNetworkCachedItem({
  initItem: (network) => new ethers.JsonRpcProvider(RPC_URL[network], null, { staticNetwork: ethers.Network.from(CHAIN_ID[network]) })
})

const useProvider = function (network) {
  if (!network) {
    network = 'polygon'
  }
  return getProviderForNetwork(network)
}

const { getItemForNetwork: getMulticallProviderForNetwork } = useNetworkCachedItem({
  initItem: (network) => MulticallWrapper.wrap(useProvider(network))
})

const useMulticallProvider = function (network) {
  if (!network) {
    network = 'polygon'
  }
  return getMulticallProviderForNetwork(network)
}

export {
  useProvider,
  useMulticallProvider
}
