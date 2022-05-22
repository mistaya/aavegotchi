<template>
  <div>
    <div
      v-if="fetchStatus && fetchStatus.loading"
      class="site-alertbox site-alertbox--info"
    >
      <SiteIcon name="info" />
      <div>
        Fetching gotchis' last-channelling times...
      </div>
    </div>

    <div
      v-else-if="fetchStatus && fetchStatus.error"
      class="site-alertbox site-alertbox--warning"
    >
      <SiteIcon name="warning-triangle" />
      <div>
        There was an error fetching the gotchis' last-channeling times.
      </div>
    </div>

    <div
      v-else-if="fetchStatus && fetchStatus.loaded"
      class="site-alertbox site-alertbox--info"
    >
      <SiteIcon name="info" />
      <div>
        Gotchis' last-channelling times were fetched from the subgraph
        <DateFriendly :date="lastFetchDate" />.
        <br>Last gotchi reset (midnight UTC) was <DatePrecise :date="utcMidnight" />
      </div>
    </div>
  </div>
</template>
<script>
import { utcMidnight } from '@/data/useGotchiChanneling'
import DateFriendly from '@/components/DateFriendly.vue'
import DatePrecise from '@/components/DatePrecise.vue'

export default {
  components: {
    DateFriendly,
    DatePrecise
  },
  props: {
    fetchStatus: { type: Object, default: null },
    lastFetchDate: { type: Date, default: null }
  },
  setup () {
    return {
      utcMidnight
    }
  }
}
</script>
