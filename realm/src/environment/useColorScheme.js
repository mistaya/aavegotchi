import { ref, computed, watch } from 'vue'

// Browser/OS preference: may be either 'light' (default) or 'dark'
const autoColorScheme = ref('light')

const setColorSchemeFromMediaQuery = function () {
  autoColorScheme.value = colorSchemeMediaQuery.matches ? 'dark' : 'light'
}

const colorSchemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
if (colorSchemeMediaQuery.addEventListener) {
  colorSchemeMediaQuery.addEventListener('change', setColorSchemeFromMediaQuery)
} else if (colorSchemeMediaQuery.addListener) {
  // Safari 13
  colorSchemeMediaQuery.addListener(setColorSchemeFromMediaQuery)
}
setColorSchemeFromMediaQuery()

// User-saved site preference: may be null (unset/auto), 'light' or 'dark'
let initialColorScheme = localStorage.getItem('color-scheme')
if (initialColorScheme !== 'light' && initialColorScheme !== 'dark') {
  initialColorScheme = null
}
const preferredColorScheme = ref(initialColorScheme)

const savePreference = function (colorScheme) {
  if (colorScheme !== null && colorScheme !== 'light' && colorScheme !== 'dark') {
    console.error('invalid colorScheme provided to savePreference')
    return
  }
  preferredColorScheme.value = colorScheme
  // save the setting to localStorage for future page-loads
  if (colorScheme === 'light' || colorScheme === 'dark') {
    localStorage.setItem('color-scheme', colorScheme)
  } else {
    localStorage.removeItem('color-scheme')
  }
}

const toggleColorScheme = function () {
  // we want to toggle the final scheme from whatever it currently is using
  const newScheme = colorScheme.value === 'light' ? 'dark' : 'light'
  // if the newScheme is the same as auto, unset any preference so it falls back to auto
  if (newScheme === autoColorScheme.value) {
    savePreference(null)
  } else {
    // otherwise (the newScheme is different to auto), save the preference
    savePreference(newScheme)
  }
}

// Resolved final color scheme
const colorScheme = computed(() => {
  return preferredColorScheme.value || autoColorScheme.value
})

watch(
  () => colorScheme.value,
  () => {
    document.documentElement.classList.toggle('site-dark-mode', colorScheme.value === 'dark')
  },
  { immediate: true }
)

export default function () {
  return {
    colorScheme,
    toggleColorScheme
  }
}
