<template>
  <div class="paging-controls">
    <div>{{ numItems }} {{ itemsLabel }}</div>
    <div
      v-if="numPages > 1"
      class="paging-controls__pages"
    >
      <button
        v-if="showFirstPage"
        type="button"
        title="First page"
        @click="$emit('update:modelValue', { page: 0, pageSize: modelValue.pageSize })"
      >
        <span aria-hidden="true">&lt;&lt;</span>
        <span class="sr-only">First page</span>
      </button>
      <button
        v-if="showPrevPage"
        type="button"
        title="Previous page"
        @click="$emit('update:modelValue', { page: modelValue.page - 1, pageSize: modelValue.pageSize })"
      >
        <span aria-hidden="true">&lt;</span>
        <span class="sr-only">Previous page</span>
      </button>
      <span style="margin: 0 5px 0 3px">
        Page {{ modelValue.page + 1 }}/{{ numPages }}
      </span>
      <button
        v-if="showNextPage"
        type="button"
        title="Next page"
        @click="$emit('update:modelValue', { page: modelValue.page + 1, pageSize: modelValue.pageSize })"
      >
        <span aria-hidden="true">&gt;</span>
        <span class="sr-only">Next page</span>
      </button>
      <button
        v-if="showLastPage"
        type="button"
        title="Last page"
        @click="$emit('update:modelValue', { page: lastPage, pageSize: modelValue.pageSize })"
      >
        <span aria-hidden="true">&gt;&gt;</span>
        <span class="sr-only">Last page</span>
      </button>
    </div>
    <div>
      <label>
        Show
        <select
          :value="modelValue.pageSize + ''"
          @change="$emit('update:modelValue', { page: modelValue.page, pageSize: $event.target.value - 0 })"
        >
          <option
            v-for="size in [10,25,50,100,200]"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        per page
      </label>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    modelValue: { type: Object /* page, pageSize */, required: true },
    numItems: { type: Number, required: true },
    itemsLabel: { type: String, default: 'items' }
  },
  computed: {
    numPages () {
      return Math.ceil(this.numItems / this.modelValue.pageSize)
    },
    showFirstPage () {
      return this.modelValue.page > 0
    },
    lastPage () {
      return this.numPages - 1
    },
    showLastPage () {
      return this.lastPage > 0 && this.modelValue.page !== this.lastPage
    },
    showPrevPage () {
      return this.modelValue.page > 0
    },
    showNextPage () {
      return this.modelValue.page < this.lastPage
    }
  }
}
</script>

<style scoped>
  .paging-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    margin-bottom: -10px;
  }
  .paging-controls > div {
    margin: 10px;
    white-space: nowrap;
    flex: 0 0 auto;
  }
  .paging-controls__pages {
    margin: 0 20px;
  }

  .paging-controls__pages button {
    margin: 0 3px;
  }
</style>
