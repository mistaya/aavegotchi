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

    <div style="display: flex; flex-wrap: wrap">
      <img
        :src="paartnerDetails.logoUrl"
        class="paartner-logo"
      />

      <div style="margin: 15px 0;font-weight: bold;">
        {{ paartnerDetails.label }}
      </div>
    </div>

    <div
      v-if="paartnerDetails.website"
      style="margin: 15px 0;font-weight: bold;"
      class="word-break"
    >
      <a
        :href="paartnerDetails.website"
        target="_blank"
        rel="nofollow noopener noreferrer"
      >
        {{ paartnerDetails.website }}
      </a>
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
      const details = PAARTNER_DETAILS[this.paartner]
      const logoUrl = require(`./paartnerLogos/${details.id}.svg`)
      return {
        ...details,
        logoUrl
      }
    }
  }
}
</script>

<style scoped>
  .paartner-parcel-details {
    border: 1px solid #ccc;
    padding: 10px;
  }

  .paartner-logo {
    float: left;
    max-width: 50%;
    max-height: 50px;
    margin-right: 15px;
    margin-bottom: 10px;
  }
</style>
