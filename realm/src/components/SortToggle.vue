<template>
  <button
    type="button"
    class="sort-toggle"
    :aria-pressed="`${!!sort}`"
    @click="nextSort"
  >
    <template v-if="!sort">
      <img
        src="./icon-arrow-up.svg"
        alt="Sort"
      />
    </template>
    <template v-if="sort">
      <span>Sort</span>
      <img
        v-if="sort === 'asc'"
        src="./icon-arrow-up.svg"
        alt="Ascending"
      />
      <img
        v-if="sort === 'desc'"
        src="./icon-arrow-down.svg"
        alt="Descending"
      />
    </template>
  </button>
</template>

<script>
export default {
  props: {
    sort: { type: String, default: null /* null, 'asc' or 'desc' */ }
  },
  methods: {
    nextSort () {
      if (!this.sort) {
        this.$emit('update:sort', 'asc')
      } else if (this.sort === 'asc') {
        this.$emit('update:sort', 'desc')
      } else {
        this.$emit('update:sort', null)
      }
    }
  }
}
</script>

<style scoped>
  .sort-toggle {
    display: inline-flex;
  }
  .sort-toggle[aria-pressed=false] {
    font-style: italic;
  }
  .sort-toggle[aria-pressed=true] {
    background: var(--purple--contrast-black);
    font-weight: bold;
  }
  .sort-toggle img {
    width: 15px;
    height: 15px;
  }
  .sort-toggle img:not(:first-child) {
    margin-left: 5px;
  }
</style>
