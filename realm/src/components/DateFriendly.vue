<template>
  <span :title="preciseDate">
    {{ friendlyDate }}
  </span>
</template>

<script>
import { computed } from 'vue'
import { formatDistanceStrict, max, format } from 'date-fns'
import useReactiveDate from '@/data/useReactiveDate'

export default {
  props: {
    date: { type: Date, required: true }
  },
  setup (props) {
    const { tickerDate } = useReactiveDate()
    const friendlyDate = computed(() => {
      let str = formatDistanceStrict(
        props.date,
        max([tickerDate.value, new Date()]),
        { addSuffix: true }
      )
      // Shorten it further
      if (str.includes(' second')) {
        str = str.replace(/(\d) seconds?/, '$1s')
      } else if (str.includes(' minute')) {
        str = str.replace(/(\d) minutes?/, '$1 min')
      } else if (str.includes(' hour')) {
        str = str.replace(/(\d) hours?/, '$1h')
      }
      return str
    })

    const preciseDate = computed(() => format(
      props.date,
      'PPP ppp'
    ))

    return {
      friendlyDate,
      preciseDate
    }
  }
}
</script>

<style scoped>
</style>
