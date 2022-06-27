import { ref, computed } from 'vue'

const headData = ref({
  siteTitle: 'Aadventure.io',
  pageTitle: '',
  description: 'Tools and data to explore Aavegotchi',
  url: '',
  imageUrl: ''
})

const title = computed(() => {
  if (headData.value.pageTitle) {
    return `${headData.value.pageTitle} | ${headData.value.siteTitle}`
  }
  return headData.value.siteTitle
})

export default function useSiteHead () {
  return { headData, title }
}
