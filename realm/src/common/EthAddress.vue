<template>
  <span>
    <div class="address-row">
      <EthIcon
        v-if="icon"
        style="width: 15px"
        :address="address"
      />
      <span
        class="eth-address"
        :title="address"
      >
        {{ shortAddress }}
      </span>
      <CopyToClipboard :text="address" />
      <a
        v-if="polygonscan"
        :href="`https://polygonscan.com/address/${address}${polygonscan === 'erc20' ? '#tokentxns' : ''}`"
        target="_blank"
        rel="nofollow noopener noreferrer"
        title="open in polygonscan"
        class="polygonscan"
      >
        <span class="sr-only">
          polygonscan
        </span>
        <SiteIcon name="open-window" />
      </a>
    </div>
  </span>
</template>

<script>
import CopyToClipboard from '@/common/CopyToClipboard.vue'
import EthIcon from '@/common/EthIcon.vue'

export default {
  components: {
    CopyToClipboard,
    EthIcon
  },
  props: {
    address: { type: String, required: true },
    polygonscan: { type: [Boolean, String], default: false },
    icon: { type: Boolean, default: false },
    shortest: { type: Boolean, default: false }
  },
  computed: {
    shortAddress () {
      if (this.shortest) {
        return this.address.substring(0, 5)
      }
      return `${this.address.substring(0, 5)}...${this.address.substring(this.address.length - 4)}`
    }
  }
}
</script>

<style scoped>
  .address-row {
    /* Bug workaround https://stackoverflow.com/questions/65083319/flex-box-inside-table-cell-or-with-width-min-content-shrinks-despite-flex-shrin */
    width: max-content;

    display: inline-flex;
    align-items: center;
  }
  .address-row > * {
    flex: 0 0 auto;
  }
  .eth-address {
    margin: 0 3px 0 5px;
    font-family: monospace;
  }
  .polygonscan {
    margin-left: 5px;
  }
  .polygonscan > img {
    width: 15px;
    height: 15px;
  }
  .polygonscan:hover {
    filter: drop-shadow(1px 1px 1px var(--site-link-underline-color--hover));
  }
</style>
