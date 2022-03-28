<template>
  <div>
    <PagingControls
      :modelValue="{ page, pageSize }"
      :numItems="numResults"
      itemsLabel="gotchis"
      class="gotchis-table-paging gotchis-table-paging--top"
      @update:modelValue="$emit('update:page', $event.page); $emit('update:pageSize', $event.pageSize)"
    />
    <div class="gotchis-table-scroll-text">
      (Scroll the table sideways to see more columns)
    </div>
    <div class="gotchis-table-wrapper visible-scrollbar">
      <table class="gotchis-table">
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
      itemsLabel="gotchis"
      class="gotchis-table-paging gotchis-table-paging--bottom"
      @update:modelValue="$emit('update:page', $event.page); $emit('update:pageSize', $event.pageSize)"
    />
  </div>
</template>

<script>
import PagingControls from './PagingControls.vue'

export default {
  components: {
    PagingControls
  },
  props: {
    // TODO set the magic number for horizontal scrolling here
    page: { type: Number, default: 0 },
    pageSize: { type: Number, default: 10 },
    numResults: { type: Number, required: true }
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

     1100px width: this magic number needs adjusting for changes

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
  @media (max-width: 1100px) {
    .gotchis-table-wrapper {
      position: relative;
      overflow: auto;
    }
    .device--no-touch .gotchis-table-wrapper {
      max-height: 90vh;
    }
  }
</style>
<style scoped>
  .gotchis-table-wrapper {
    margin: 0;
    max-width: 100%;
  }

  /* display help text for narrow screens */
  .gotchis-table-scroll-text {
    display: none;
    margin-bottom: 10px;
    font-size: 0.9em;
    font-style: italic;
    text-align: right;
  }
  @media (max-width: 950px) {
    .gotchis-table-scroll-text {
      display: block;
    }
  }

  .gotchis-table {
    margin: 0 auto;
  }
  .gotchis-table :deep(thead th) {
    position: sticky;
    top: 0;
    z-index: 1;
    background-color: var(--site-background-color--transparent);
    color: var(--site-text-color--subtle);
  }
  .gotchis-table :deep(td),
  .gotchis-table :deep(th) {
    text-align: left;
    padding: 5px;
  }
  .gotchis-table :deep(tr:nth-child(even) td) {
    background: var(--site-background-color--alternate);
  }

  .gotchis-table-paging {
    margin: 20px auto;
    justify-content: center;
  }
  .gotchis-table-paging--bottom {
    margin-bottom: 70px;
  }
</style>
