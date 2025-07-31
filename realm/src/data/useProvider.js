import { ethers } from 'ethers'
import { Provider, setMulticallAddress } from 'ethers-multicall'
import { useNetworkCachedItem } from '@/environment/useNetwork'

// https://chainlist.org/
const RPC_URL = {
  polygon: 'https://polygon-rpc.com',
  // base: 'https://1rpc.io/base'
  base: 'https://base-rpc.publicnode.com'
}

const { getItemForNetwork: getProviderForNetwork } = useNetworkCachedItem({
  initItem: (network) => new ethers.providers.JsonRpcProvider(RPC_URL[network])
})

const useProvider = function (network) {
  if (!network) {
    network = 'polygon'
  }
  return getProviderForNetwork(network)
}

const CHAIN_ID = {
  polygon: 137,
  base: 8453
}

// tell ethers-multicall where the multicall contract is on Base
setMulticallAddress(CHAIN_ID.base, '0xcA11bde05977b3631167028862bE2a173976CA11')

const { getItemForNetwork: getMulticallProviderForNetwork } = useNetworkCachedItem({
  // provide chainId so we don't need to call init
  initItem: (network) => new Provider(useProvider(network), CHAIN_ID[network])
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
