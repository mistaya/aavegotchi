<template>
  <div class="copy-to-clipboard">
    <input
      ref="inputRef"
      type="text"
      :value="text"
      class="copy-to-clipboard__input"
      tabindex="-1"
    />
    <button
      ref="buttonRef"
      type="button"
      class="copy-to-clipboard__button"
      :title="label"
      @click="copyToClipboard"
    >
      <span class="sr-only">{{ label }}</span>
      <SiteIcon name="copy" />
    </button>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  props: {
    text: { type: String, default: '' },
    label: { type: String, default: 'copy address' }
  },
  setup () {
    const inputRef = ref(null)
    const buttonRef = ref(null)
    const copyToClipboard = () => {
      if (!inputRef.value || !buttonRef.value) { return }
      inputRef.value.select()
      document.execCommand('copy')
      buttonRef.value.focus()
    }
    return {
      inputRef,
      buttonRef,
      copyToClipboard
    }
  }
}
</script>

<style scoped>
  .copy-to-clipboard {
    position: relative;
    display: inline-block;
  }
  .copy-to-clipboard__input {
    width: 10px; /* a minimum width is needed for copying to work in chrome */
    height: 10px; /* a minimum height is needed for copying to work in safari */
    opacity: 0;
    pointer-events: none;
    position: absolute;
  }
  .copy-to-clipboard__button {
    cursor: pointer;
    width: 15px;
    height: 15px;
    margin-left: 5px;
    border: none;
    padding: 0;
    background: transparent;
    box-shadow: none;
  }
  .copy-to-clipboard__button:hover {
    filter: drop-shadow(1px 1px 1px rgba(255, 150, 255, 1));
  }
  .copy-to-clipboard__button img {
    width: 100%;
    height: 100%;
  }
</style>
