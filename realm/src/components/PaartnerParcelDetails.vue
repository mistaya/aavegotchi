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
const PAARTNER_DETAILS = {
  aave: {
    id: 'aave',
    label: 'AAVE',
    twitter: 'AaveAave'
  },
  cgu: {
    id: 'cgu',
    label: 'Crypto Gaming United',
    twitter: 'cryptogamingutd'
  },
  flamingo: {
    id: 'flamingo',
    label: 'Flamingo',
    twitter: 'FLAMINGODAO'
  },
  readyplayerdao: {
    id: 'readyplayerdao',
    label: 'Ready Player DAO',
    twitter: 'ReadyPlayerDAO'
  },
  blackpool: {
    id: 'blackpool',
    label: 'BlackPool',
    twitter: 'BlackpoolHQ'
  },
  yggsea: {
    id: 'yggsea',
    label: 'YGGSEA',
    twitter: 'yggsea'
  }
}

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
