<template>
  <span :title="preciseDate">
    <template v-if="enableToggle">
      <a
        href="#"
        class="date-friendly__toggle"
        @click.prevent="longDisplay = !longDisplay"
      >
        {{ longDisplay ? preciseDate : friendlyDate }}
      </a>
    </template>
    <template v-else>
      {{ friendlyDate }}
    </template>
  </span>
</template>

<script>
import { ref, computed } from 'vue'
import { formatDistanceStrict, max, format } from 'date-fns'
import useReactiveDate from '@/data/useReactiveDate'

export default {
  props: {
    date: { type: Date, required: true },
    enableToggle: { type: Boolean, default: false }
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
      'PP p z'
    ))

    const longDisplay = ref(false)

    return {
      friendlyDate,
      preciseDate,
      longDisplay
    }
  }
}
</script>

<style scoped>
  .date-friendly__toggle {
    text-decoration-style: dotted;
  }
</style>
