<template>
  <span>
    {{ formattedNumber }}
  </span>
</template>

<script>
// Safari <14.1 doesn't support currencyDisplay: narrowSymbol, so fallback
const getUsdFormatter = function () {
  try {
    return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD', currencyDisplay: 'narrowSymbol' })
  } catch (e) {}
  return new Intl.NumberFormat(navigator.language, { style: 'currency', currency: 'USD', currencyDisplay: 'symbol' })
}
const usdFormatter = getUsdFormatter()
const amountFormatter = new Intl.NumberFormat(navigator.language)
const maxDecimalsFormatter = new Intl.NumberFormat(navigator.language, {
  maximumFractionDigits: 18
})

export default {
  props: {
    number: { type: [Number, Object], required: true },
    usd: { type: Boolean, default: false },
    maxDecimals: { type: Boolean, default: false }
  },
  computed: {
    formatter () {
      if (this.usd) { return usdFormatter }
      if (this.maxDecimals) { return maxDecimalsFormatter }
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
