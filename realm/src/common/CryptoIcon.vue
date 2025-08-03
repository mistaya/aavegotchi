<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="symbol"
    :data-label="label"
    :style="{
      '--icon-size': `${size}px`
    }"
  >
    <use :xlink:href="`#icon_${addressToUse}`"></use>
  </svg>
</template>

<script>
import { computed } from 'vue'
import tokens from '@/data/pockets/tokens'

// this only picks one network's address per label, but that's ok as SVG symbols exist for all addresses
const ADDRESS_BY_LABEL = Object.fromEntries(
  tokens.polygon.collaterals.concat(tokens.polygon.tokens).concat(tokens.base.tokens).map(({ id, label }) => [label, id])
)

export default {
  props: {
    // Either address or label must be provided
    address: { type: String, default: null },
    label: { type: String, default: null },
    size: { type: Number, default: 16 }
  },
  setup (props) {
    const addressToUse = computed(() => {
      if (props.address) { return props.address }
      return ADDRESS_BY_LABEL[props.label]
    })

    return {
      addressToUse
    }
  }
}
</script>

<style scoped>
  svg.symbol {
    width: var(--icon-size);
    height: var(--icon-size);
    /* aspect-ratio not supported in Safari 14, so for now we still need to specify height */
    aspect-ratio: 1/1;
  }
</style>
