<template>
  <button
    type="button"
    class="button-reset color-scheme-toggle"
    @click="toggleColorScheme"
  >
    <SiteIcon
      :name="colorScheme === 'light' ? 'moon' : 'sun'"
      class="color-scheme-icon"
      aria-label="``"
    />
    <span class="sr-only">
      Switch to {{ colorScheme === 'light' ? 'dark' : 'light' }} mode
    </span>
  </button>
</template>

<script>
import useColorScheme from '@/environment/useColorScheme'

export default {
  setup () {
    const { colorScheme, toggleColorScheme } = useColorScheme()

    return {
      colorScheme,
      toggleColorScheme
    }
  }
}
</script>

<style scoped>
  .color-scheme-icon {
    flex: 0 0 auto;
    color: var(--site-banner-text-color);
  }

  .color-scheme-toggle:hover .color-scheme-icon {
    filter: drop-shadow(1px 1px 1px rgba(255, 150, 255, 1));
  }

  .color-scheme-toggle:focus-visible {
    outline: 1px solid white;
    outline-offset: 4px;
  }
</style>
