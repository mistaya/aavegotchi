<template>
  <div>
    <PagingControls
      :modelValue="{ page, pageSize }"
      :numItems="numResults"
      :itemsLabel="itemsLabel"
      class="site-table-paging site-table-paging--top"
      @update:modelValue="$emit('update:page', $event.page); $emit('update:pageSize', $event.pageSize)"
    />
    <div class="site-table-scroll-text">
      (Scroll the table sideways to see more columns)
    </div>
    <div
      class="site-table-wrapper visible-scrollbar"
      :class="`site-table-wrapper--breakpoint-${scrollingBreakpoint}`"
    >
      <table
        class="site-table"
        :class="{
          'site-table--bordered': bordered
        }"
      >
        <thead>
          <slot name="headers"></slot>
        </thead>
        <tbody>
          <slot name="rows"></slot>
        </tbody>
      </table>
    </div>
    <PagingControls
      :modelValue="{ page, pageSize }"
      :numItems="numResults"
      :itemsLabel="itemsLabel"
      class="site-table-paging site-table-paging--bottom"
      @update:modelValue="$emit('update:page', $event.page); $emit('update:pageSize', $event.pageSize)"
    />
  </div>
</template>

<script>
import PagingControls from '@/common/PagingControls.vue'

export default {
  components: {
    PagingControls
  },
  props: {
    page: { type: Number, default: 0 },
    pageSize: { type: Number, default: 10 },
    numResults: { type: Number, required: true },
    itemsLabel: { type: String, default: 'gotchis' },
    scrollingBreakpoint: { type: Number, default: 1300 },
    /* for vertical column borders, add 'with-left-border' class on TH and TD */
    bordered: { type: Boolean, default: false }
  }
}
</script>

<style>
  /* global styles */
  /* so we can refer to device css class from parent */

  /* Handle table scrolling:

     With a wide enough screen that the columns fit,
     let the table flow normally in the layout, with
     sticky headers.

     The magic breakpoint number needs adjusting for changes, but
     we can't do that in a variable way.
     Instead define a set of rules with different breakpoints and
     opt-in using classes.

     When the screen is narrower, allow horizontal scrolling.

     Touchscreens are nicest to use with horizontal but no vertical
     overflow, to avoid scroll-in-scroll. Unfortunately this also
     breaks the sticky headers because no height is defined.

     On desktops, can only horizontally scroll using the scrollbar,
     so it's a pain when the bottom of the table is out of view.
     So if no-touch and horizontal scrolling is necessary (narrow),
     also limit the vertical height so the whole scrollable table
     can fit on the viewport at once. (This also reenables the
     sticky headers, as a height is defined.)
   */
  @media (max-width: 800px) {
    .site-table-wrapper--breakpoint-800 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-800 {
      max-height: 90vh;
    }
  }
  @media (max-width: 900px) {
    .site-table-wrapper--breakpoint-900 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-900 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1000px) {
    .site-table-wrapper--breakpoint-1000 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1000 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1100px) {
    .site-table-wrapper--breakpoint-1100 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1100 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1200px) {
    .site-table-wrapper--breakpoint-1200 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1200 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1300px) {
    .site-table-wrapper--breakpoint-1300 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1300 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1400px) {
    .site-table-wrapper--breakpoint-1400 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1400 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1500px) {
    .site-table-wrapper--breakpoint-1500 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1500 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1600px) {
    .site-table-wrapper--breakpoint-1600 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1600 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1700px) {
    .site-table-wrapper--breakpoint-1700 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1700 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1800px) {
    .site-table-wrapper--breakpoint-1800 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1800 {
      max-height: 90vh;
    }
  }
  @media (max-width: 1900px) {
    .site-table-wrapper--breakpoint-1900 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-1900 {
      max-height: 90vh;
    }
  }
  @media (max-width: 2000px) {
    .site-table-wrapper--breakpoint-2000 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-2000 {
      max-height: 90vh;
    }
  }
  @media (max-width: 2100px) {
    .site-table-wrapper--breakpoint-2100 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-2100 {
      max-height: 90vh;
    }
  }
  @media (max-width: 2200px) {
    .site-table-wrapper--breakpoint-2200 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-2200 {
      max-height: 90vh;
    }
  }
  @media (max-width: 2300px) {
    .site-table-wrapper--breakpoint-2300 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-2300 {
      max-height: 90vh;
    }
  }
  @media (max-width: 2400px) {
    .site-table-wrapper--breakpoint-2400 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-2400 {
      max-height: 90vh;
    }
  }
  @media (max-width: 2500px) {
    .site-table-wrapper--breakpoint-2500 {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .site-table-wrapper--breakpoint-2500 {
      max-height: 90vh;
    }
  }
</style>
<style scoped>
  .site-table-wrapper {
    margin: 0;
    max-width: 100%;
  }

  /* display help text for narrow screens */
  .site-table-scroll-text {
    display: none;
    margin-bottom: 10px;
    font-size: 0.9em;
    font-style: italic;
    text-align: right;
  }
  @media (max-width: 950px) {
    .site-table-scroll-text {
      display: block;
    }
  }

  .site-table {
    margin: 0 auto;
  }
  .site-table :deep(thead tr th) {
    background-color: var(--site-background-color--transparent);
    color: var(--site-text-color--subtle);
  }
  .site-table :deep(thead tr:last-child th) {
    position: sticky;
    top: 0;
    z-index: 1;
    background-clip: padding-box; /* workaround for FF so th borders display */
  }
  .site-table :deep(td),
  .site-table :deep(th) {
    text-align: left;
    padding: 5px;
  }
  .site-table :deep(tr:nth-child(even) td) {
    background-color: var(--site-background-color--alternate);
  }

  .site-table--bordered {
    border-collapse: collapse;
  }
  .site-table--bordered :deep(th),
  .site-table--bordered :deep(td) {
    padding: 6px 8px;
  }
  .site-table--bordered thead :deep(tr:not(:last-child) th) {
    text-align: center;
  }
  .site-table--bordered thead :deep(tr:last-child th) {
    border-bottom: 2px solid var(--site-border-color--transparent);
  }
  .site-table--bordered :deep(th.with-left-border),
  .site-table--bordered :deep(td.with-left-border) {
    border-left: 1px solid var(--site-border-color--transparent);
  }

  .site-table-paging {
    margin: 20px auto;
    justify-content: center;
  }
  .site-table-paging--bottom {
    margin-bottom: 70px;
  }
</style>
