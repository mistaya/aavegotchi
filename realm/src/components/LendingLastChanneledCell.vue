<template>
  <td
    :class="{
      'can-channel': enableCellHighlight && gotchiChannelingStatuses && gotchiChannelingStatuses.canChannel[gotchiId]
    }"
  >
    <div>
      <template v-if="fetchStatus">
        <template v-if="fetchStatus.loading">
          ...
        </template>
        <template v-else-if="fetchStatus.error">
          ?
        </template>
        <template v-else-if="fetchStatus.loaded && gotchiChannelingStatuses">
          <div :title="gotchiChannelingStatuses.canChannel[gotchiId] ? 'can channel' : 'cannot channel'">
            <SiteIcon
              :name="gotchiChannelingStatuses.canChannel[gotchiId] ? 'channel' : 'moon'"
              :alt="gotchiChannelingStatuses.canChannel[gotchiId] ? 'can channel' : 'cannot channel'"
              style="margin-bottom: -2px; margin-right: 5px"
            />
            <template v-if="gotchiChannelingStatuses.dates[gotchiId]">
              <DatePrecise :date="gotchiChannelingStatuses.dates[gotchiId]" utc />
            </template>
            <template v-else>
              <span>Never</span>
            </template>
          </div>
        </template>
      </template>
      <template v-else>
        Unknown
      </template>
    </div>
  </td>
</template>
<script>
import DatePrecise from '@/components/DatePrecise.vue'

export default {
  components: { DatePrecise },
  props: {
    gotchiId: {
      type: String,
      required: true
    },
    fetchStatus: {
      type: Object,
      default: null
    },
    gotchiChannelingStatuses: {
      type: Object,
      default: null
    },
    enableCellHighlight: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
  .can-channel,
  .can-channel > div {
    position: relative;
  }
  .can-channel::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background-color: rgba(120, 235, 44, 0.4);
  }
</style>
