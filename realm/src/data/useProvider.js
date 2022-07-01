import { ethers } from 'ethers'
import { Provider } from 'ethers-multicall'

const RPC_URL = 'https://rpc.ankr.com/polygon'
// const RPC_URL = 'https://polygon-rpc.comn'

let provider = null
let multicallProvider = null

const useProvider = function () {
  if (!provider) {
    provider = new ethers.providers.JsonRpcProvider(RPC_URL)
  }
  return provider
}

const useMulticallProvider = function () {
  if (!multicallProvider) {
    // provide chainId so we don't need to call init
    multicallProvider = new Provider(useProvider(), 137)
  }
  return multicallProvider
}

export {
  useProvider,
  useMulticallProvider
}
