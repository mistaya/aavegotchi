<template>
  <span>
    {{ preciseDate }}
  </span>
</template>

<script>
import { computed } from 'vue'
import { format } from 'date-fns'

export default {
  props: {
    date: { type: Date, required: true }
  },
  setup (props) {
    const preciseDate = computed(() => format(
      props.date,
      'PPP ppp'
    ))

    return {
      preciseDate
    }
  }
}
</script>

<style scoped>
</style>
