<template>
  <div
    v-if="paartnerDetails"
    class="paartner-parcel-details"
  >
    <button
      type="button"
      style="float: right"
      @click="$emit('close')"
    >
      Close
    </button>

    <h2>Paartner Parcel:</h2>

    <div style="margin: 15px 0;font-weight: bold;">
      {{ paartnerDetails.label }}
    </div>

    <div
      v-if="paartnerDetails.twitter"
      style="margin: 15px 0;font-weight: bold;"
    >
      <a
        :href="`https://twitter.com/${paartnerDetails.twitter}`"
        target="_blank"
        rel="nofollow noopener noreferrer"
        title="twitter"
      >
        @{{ paartnerDetails.twitter }} twitter
      </a>
    </div>
  </div>
</template>

<script>
import PAARTNER_DETAILS from '@/data/parcels/paartners.json'

export default {
  props: {
    paartner: { type: String, required: true }
  },
  computed: {
    paartnerDetails () {
      return PAARTNER_DETAILS[this.paartner]
    }
  }
}
</script>

<style scoped>
  .paartner-parcel-details {
    border: 1px solid #ccc;
    padding: 10px;
  }
</style>
