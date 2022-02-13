<template>
  <div class="color-scheme-toggles">
    <label title="light mode">
      <input
        type="radio"
        name="color-scheme-toggle-group"
        :checked="preferredColorScheme === 'light'"
        class="sr-only"
        @click="onClickRadio('light')"
      />
      <span class="sr-only">light mode</span>
      <SiteIcon name="sun" class="color-scheme-icon" />
    </label>
    <label title="use default color scheme">
      <input
        type="radio"
        name="color-scheme-toggle-group"
        :checked="preferredColorScheme === null"
        class="sr-only"
        @click="onClickRadio(null)"
      />
      <span class="color-scheme-visible-label">auto</span>
    </label>
    <label title="dark mode">
      <input
        type="radio"
        name="color-scheme-toggle-group"
        :checked="preferredColorScheme === 'dark'"
        class="sr-only"
        @click="onClickRadio('dark')"
      />
      <span class="sr-only">dark mode</span>
      <SiteIcon name="moon" class="color-scheme-icon" />
    </label>
  </div>
</template>

<script>
import useColorScheme from '@/data/useColorScheme'

export default {
  setup () {
    const { preferredColorScheme, savePreference } = useColorScheme()

    const onClickRadio = function (mode) {
      savePreference(mode)
    }
    return {
      preferredColorScheme,
      onClickRadio
    }
  }
}
</script>

<style scoped>
  .color-scheme-toggles {
    height: 24px;
    display: flex;
    align-items: center;
    margin-top: 5px;
    margin-right: 10px;
  }
  .color-scheme-toggles label {
    cursor: pointer;
    flex: 0 0 auto;
  }
  .color-scheme-toggles label:not(:last-child) {
    margin-right: 5px;
  }
  .color-scheme-toggles .color-scheme-icon {
    position: relative;
    top: 2px;
  }
  .color-scheme-toggles .color-scheme-visible-label {
    text-transform: uppercase;
    font-size: 0.8em;
  }

  .color-scheme-toggles label:hover .color-scheme-icon,
  .color-scheme-toggles label:hover .color-scheme-visible-label {
    filter: drop-shadow(1px 1px 1px rgba(255, 150, 255, 1));
  }
  .color-scheme-toggles .color-scheme-visible-label:hover {
    filter: drop-shadow(1px 1px 1px rgba(255, 150, 255, 1));
  }
  .color-scheme-toggles input[type=radio]:checked ~ .color-scheme-icon,
  .color-scheme-toggles input[type=radio]:checked ~ .color-scheme-visible-label {
    color: var(--purple);
  }
  .color-scheme-toggles input[type=radio]:focus-visible ~ .color-scheme-icon,
  .color-scheme-toggles input[type=radio]:focus-visible ~ .color-scheme-visible-label {
    outline: 1px solid white;
    outline-offset: 4px;
  }
</style>
