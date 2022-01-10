<template>
  <div class="data-fetcher">
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
    <button
      v-if="!disableFetch && canSubmitFetch"
      type="button"
      style="margin-left: 10px;"
      @click="fetch"
    >
      Fetch
    </button>
    <template v-if="fetchStatus.loading">
      <span class="data-fetcher__loading-spinner-wrapper">
        <span class="data-fetcher__loading-spinner" />
      </span>
      fetching {{ subject }}...
    </template>
  </div>
</template>

<script>
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
    disableFetch: { type: Boolean, default: false }
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

    return {
      result,
      canSubmitFetch,
      fetchStatus,
      fetch,
      lastFetchDate
    }
  }
}
</script>

<style scoped>
  .data-fetcher,
  .data-fetcher button {
    font-family: Courier New,Courier,Lucida Sans Typewriter,Lucida Typewriter,monospace;
  }
  .data-fetcher {
    border:  1px solid black;
    padding: 7px 10px;
    background: #333;
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
    color: #d383f3;
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
  .data-fetcher button {
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

  @keyframes spin {
    0%   {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
