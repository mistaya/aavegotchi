<template>
  <span>
    {{ friendlyDate }}
  </span>
</template>

<script>
import { computed } from 'vue'
import { formatDistanceStrict, max } from 'date-fns'
import useReactiveDate from '@/data/useReactiveDate'

export default {
  props: {
    date: { type: Date, required: true }
  },
  setup (props) {
    const { tickerDate } = useReactiveDate()
    const friendlyDate = computed(() => formatDistanceStrict(
      props.date,
      max([tickerDate.value, new Date()]),
      { addSuffix: true }
    ))

    return {
      friendlyDate
    }
  }
}
</script>

<style scoped>
</style>
