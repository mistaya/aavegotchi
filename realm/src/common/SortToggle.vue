<template>
  <SiteButton
    type="button"
    class="sort-toggle"
    :aria-pressed="`${!!sort}`"
    @click="nextSort"
  >
    <template v-if="!sort">
      <SiteIcon
        name="arrow-up-down"
      />
      <span class="sr-only">Sort</span>
    </template>
    <template v-if="sort">
      <span class="sr-only">
        Sorting
        {{ sort === 'asc' ? 'Ascending' : 'Descending' }}
      </span>
      <SiteIcon
        :name="sort === 'asc' ? 'arrow-up' : 'arrow-down'"
      />
    </template>
  </SiteButton>
</template>

<script>
export default {
  props: {
    sort: { type: String, default: null /* null, 'asc' or 'desc' */ },
    defaultDirection: { type: String, default: 'desc' }
  },
  methods: {
    nextSort () {
      if (!this.sort) {
        this.$emit('update:sort', this.defaultDirection)
      } else if (this.sort === this.defaultDirection) {
        this.$emit('update:sort', this.defaultDirection === 'desc' ? 'asc' : 'desc')
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
  .sort-toggle img {
    width: 15px;
    height: 15px;
  }
  .sort-toggle img:not(:first-child) {
    margin-left: 5px;
  }
</style>
