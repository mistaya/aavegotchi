<template>
  <img
    :key="address"
    :src="imgDataUrl"
    class="eth-icon"
    :class="{
      'eth-icon--special': isSpecialAddress
    }"
    :title="title"
    :alt="title || ''"
  />
</template>

<script>
import blockies from 'ethereum-blockies'
import ethBridgeUrl from './icons/eth.svg'
import gotchiVaultUrl from './icons/gotchivault.svg'

const ADDRESS_ETH_BRIDGE = '0x86935f11c86623dec8a25696e1c19a8659cbf95d'
const ADDRESS_GOTCHI_VAULT = '0xDd564df884Fd4e217c9ee6F65B4BA6e5641eAC63'.toLowerCase()
const SPECIAL_ADDRESSES = {
  [ADDRESS_ETH_BRIDGE]: {
    url: ethBridgeUrl,
    title: 'Bridged to Ethereum'
  },
  [ADDRESS_GOTCHI_VAULT]: {
    url: gotchiVaultUrl,
    title: 'Gotchi Vault'
  }
}

export default {
  props: {
    address: { type: String, required: true }
  },
  computed: {
    isSpecialAddress () {
      return !!SPECIAL_ADDRESSES[this.address.toLowerCase()]
    },
    title () {
      if (this.isSpecialAddress) {
        return SPECIAL_ADDRESSES[this.address.toLowerCase()].title
      }
      return undefined
    },
    imgDataUrl () {
      if (this.isSpecialAddress) {
        return SPECIAL_ADDRESSES[this.address.toLowerCase()].url
      }
      const canvas = blockies.create({ // All options are optional
        seed: this.address.toLowerCase(), // seed used to generate icon data, default: random
        size: 10 // width/height of the icon in blocks, default: 8
      })
      return canvas.toDataURL()
    }
  }
}
</script>

<style scoped>
  .eth-icon {
    max-width: 100%;
    border-radius: 50%;
    border: 1px solid rgba(33,33,33,0.2);
  }
  .eth-icon--special {
    border-radius: 0;
    border: none;
  }
</style>
