<template>
  <div class="channeling-fetch-status">
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
        <br>Last gotchi reset (midnight UTC) was <DatePrecise :date="utcMidnight" /> in your timezone.
        <div class="channel-legend">
          <div class="channel-legend-item">
            <SiteIcon
              name="channel"
              class="channel-legend-icon"
            />
            <div class="channel-legend-text">
              Gotchi hasn't channeled yet
            </div>
          </div>
          <div class="channel-legend-item">
            <SiteIcon
              name="moon"
              class="channel-legend-icon"
            />
            <div class="channel-legend-text">
              Gotchi has already channeled
            </div>
          </div>
        </div>
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

<style scoped>
  .channeling-fetch-status {
    font-size: 0.9em;
  }
  .channel-legend {
    margin-top: 10px;
    display: flex;
    flex-wrap: wrap;
    row-gap: 7px;
    column-gap: 16px;
  }
  .channel-legend-item {
    display: flex;
    gap: 4px;
  }
  .channel-legend-icon {
    flex: none;
  }
  .channel-legend-text {
    flex: 1 1 auto;
  }
</style>
