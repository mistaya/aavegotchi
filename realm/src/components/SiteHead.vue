<template>
  <teleport to="head">
    <title>{{ title }}</title>
    <meta
      name="description"
      :content="headData.description"
    />
    <meta
      v-if="headData.url"
      property="og:url"
      :content="headData.url"
    />
    <meta
      property="og:title"
      :content="title"
    />
    <meta
      property="og:description"
      :content="headData.description"
    />
    <meta
      v-if="headData.imageUrl"
      property="og:image"
      :content="headData.imageUrl"
    />
  </teleport>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import useSiteHead from '@/data/useSiteHead'

export default {
  setup () {
    const { headData, title } = useSiteHead()
    const route = useRoute()
    headData.value.url = computed(() => route.fullPath)

    return {
      title,
      headData
    }
  },
  created () {
    // remove original elements
    const title = document.querySelector('title[data-original]')
    if (title) {
      title.remove()
    }
    const meta = document.querySelector('meta[data-original]')
    if (meta) {
      meta.remove()
    }
  }
}
</script>

<style scoped>
  .eth-icon {
    max-width: 100%;
    border-radius: 50%;
    border: 1px solid rgba(33,33,33,0.2);
  }
</style>
