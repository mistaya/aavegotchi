<template>
  <div class="data-fetcher site-dark-mode">
    <span class="data-fetcher__prompt">data:</span>
    <template v-if="!fetchStatus.loaded && !fetchStatus.loading && !fetchStatus.error">
      {{ subject }}:
    </template>
    <template v-if="fetchStatus.loaded">
      <SiteIcon
        class="data-fetcher__status data-fetcher__status--success"
        name="check"
      />
      <slot
        name="loaded"
        :result="result"
        :lastFetchDate="lastFetchDate"
        :showingMore="showingMore"
        :toggleMore="toggleMore"
      >
        {{ subject }} fetched
        <DateFriendly :date="lastFetchDate" />
      </slot>
    </template>
    <template v-if="fetchStatus.error">
      <SiteIcon
        class="data-fetcher__status data-fetcher__status--error"
        name="warning-triangle"
      />
      error loading {{ subject }}<template v-if="fetchStatus.errorMessage">: {{ fetchStatus.errorMessage }}</template>
    </template>
    <SiteButton
      v-if="!disableFetch && canSubmitFetch"
      type="button"
      style="margin-left: 10px;"
      @click="fetch"
    >
      Fetch
    </SiteButton>
    <template v-if="fetchStatus.loading">
      <span class="data-fetcher__loading-spinner-wrapper">
        <span class="data-fetcher__loading-spinner" />
      </span>
      fetching {{ subject }}...
    </template>
    <div
      v-if="fetchStatus.loaded && hasMore && showingMore"
      class="data-fetcher__more"
    >
      <slot
        name="more"
        :result="result"
        :toggleMore="toggleMore"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import DateFriendly from './DateFriendly'

export default {
  components: {
    DateFriendly
  },
  props: {
    subject: { type: String, required: true },
    use: { type: Function, required: true },
    fetchProperty: { type: String, required: true },
    resultProperty: { type: String, default: null },
    disableFetch: { type: Boolean, default: false },
    hasMore: { type: Boolean, default: false }
  },
  setup (props) {
    const useObj = props.use()
    const {
      canSubmitFetch,
      fetchStatus,
      lastFetchDate
    } = useObj
    const fetch = useObj[props.fetchProperty]
    const result = props.resultProperty ? useObj[props.resultProperty] : null

    const showingMore = ref(false)
    const toggleMore = function () {
      showingMore.value = !showingMore.value
    }

    return {
      result,
      canSubmitFetch,
      fetchStatus,
      fetch,
      lastFetchDate,
      showingMore,
      toggleMore
    }
  }
}
</script>

<style>
  /* global styles for color scheme */
  .data-fetcher {
    --data-fetcher-background-color: #333;
  }
  .site-dark-mode .data-fetcher {
    --data-fetcher-background-color: rgba(80, 69, 80, 0.35);
  }
</style>
<style scoped>
  .data-fetcher,
  .data-fetcher :deep(button) {
    font-family: Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace;
  }

  .data-fetcher {
    border:  1px solid black;
    padding: 7px 10px;
    background: var(--data-fetcher-background-color);
    color: white;
    font-size: 0.8em;
    line-height: 1.5;
  }
  /* groups of data fetchers should be put in their own container for these border styles to work */
  .data-fetcher:first-child {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }
  .data-fetcher:last-child {
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
  .data-fetcher + .data-fetcher {
    border-top-width: 0;
  }

  .data-fetcher__prompt {
    margin-right: 8px;
    color: var(--rarity-color--mythical);
  }
  .data-fetcher__status {
    margin-right: 3px;
    margin-bottom: -3px;
  }
  .data-fetcher__status--success {
    color: #0ddd0d;
  }
  .data-fetcher__status--error {
    color: red;
  }
  .data-fetcher :deep(button) {
    font-size: inherit;
    padding: 2px 10px;
  }
  .data-fetcher__loading-spinner-wrapper {
    display: inline-block;
    position: relative;
    top: 1px;
    width: 14px;
    margin-right:2px;
    text-align: center;
  }
  .data-fetcher__loading-spinner {
    display: inline-block;
    width: 1px;
    height: 12px;
    background-color: white;
    animation: 3s steps(8) 0s infinite normal forwards spin;
  }
  .data-fetcher__more {
    margin-top: 5px;
  }

  @keyframes spin {
    0%   {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
