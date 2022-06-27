<template>
  <span>
    {{ preciseDate }}
  </span>
</template>

<script>
import { computed } from 'vue'
import { format } from 'date-fns'

const getFakeUTCDate = function (date) {
  // create a Date that contains the correct days, hours etc for UTC
  // but will be interpreted in the local timezone
  // (this Date is the wrong actual instant)
  const offsetDate = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )
  return offsetDate
}
export default {
  props: {
    date: { type: Date, required: true },
    utc: { type: Boolean, default: false }
  },
  setup (props) {
    const preciseDate = computed(() => {
      if (props.utc) {
        return format(
          getFakeUTCDate(props.date),
          'PP p'
        ) + ' UTC'
      }
      return format(
        props.date,
        'PP p z'
      )
    })

    return {
      preciseDate
    }
  }
}
</script>

<style scoped>
</style>
