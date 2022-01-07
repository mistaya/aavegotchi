<template>
  <span>
    {{ formattedNumber }}
  </span>
</template>

<script>
const usdFormatter = new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' })
const amountFormatter = new Intl.NumberFormat(navigator.language)

export default {
  props: {
    number: { type: [Number, Object], required: true },
    usd: { type: Boolean, default: false }
  },
  computed: {
    formatter () {
      if (this.usd) { return usdFormatter }
      return amountFormatter
    },
    formattedNumber () {
      return this.formatter.format(this.number)
    }
  }
}
</script>

<style scoped>
</style>
