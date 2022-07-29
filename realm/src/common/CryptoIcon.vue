<template>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    class="symbol"
    :style="{
      '--icon-size': `${size}px`
    }"
  >
    <use :xlink:href="`#icon_${addressToUse}`"></use>
  </svg>
</template>

<script>
import { computed } from 'vue'
import collaterals from '@/data/pockets/collaterals.json'
import tokens from '@/data/pockets/tokens.json'

const ADDRESS_BY_LABEL = Object.fromEntries(
  Object.values(collaterals).concat(Object.values(tokens)).map(({ id, label }) => [label, id])
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
