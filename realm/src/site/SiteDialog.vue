<template>
  <Teleport to="body">
    <div
      ref="dialogRef"
      aria-hidden="true"
      class="site-dialog"
    >
      <div
        data-a11y-dialog-hide
        class="site-dialog__overlay"
      ></div>
      <div
        ref="dialogContentRef"
        role="document"
        class="site-dialog__dialog"
      >
        <slot />
      </div>
    </div>
  </Teleport>
</template>
<script>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'

import A11yDialog from 'a11y-dialog'
import { disableBodyScroll, enableBodyScroll, clearAllBodyScrollLocks } from 'body-scroll-lock'

export default {
  props: {
    isOpen: { type: Boolean, default: false }
  },
  setup (props, { emit }) {
    const dialogRef = ref(null)
    const dialogContentRef = ref(null)

    let dialog = null

    onMounted(() => {
      if (dialogRef.value) {
        dialog = new A11yDialog(dialogRef.value)
        dialog.on('show', (event) => {
          disableBodyScroll(dialogContentRef.value)
          emit('update:isOpen', true)
        })
        dialog.on('hide', (event) => {
          enableBodyScroll(dialogContentRef.value)
          emit('update:isOpen', false)
        })
        if (props.isOpen) {
          dialog.show()
        }
      }
    })

    onBeforeUnmount(() => {
      if (dialog) {
        dialog.destroy()
        clearAllBodyScrollLocks()
      }
    })

    watch(
      () => props.isOpen,
      (newIsOpen, oldIsOpen) => {
        if (!dialog) { return }
        if (newIsOpen && !oldIsOpen) {
          dialog.show()
        } else if (!newIsOpen && oldIsOpen) {
          dialog.hide()
        }
      }
    )

    return {
      dialogRef,
      dialogContentRef
    }
  }
}
</script>
<style>
  /* Global styles, as these are teleported to the BODY */

  /* Adapted from https://a11y-dialog.netlify.app/usage/styling */
  /**
   * 1. Make the dialog container, and its child overlay spread across
   *    the entire window.
   */
  .site-dialog,
  .site-dialog__overlay {
    position: fixed; /* 1 */
    top: 0; /* 1 */
    right: 0; /* 1 */
    bottom: 0; /* 1 */
    left: 0; /* 1 */
  }

  /**
   * 1. Make sure the dialog container and all its descendants sits on
   *    top of the rest of the page.
   * 2. Make the dialog container a flex container to easily center the
   *    dialog.
   */
  .site-dialog {
    z-index: 2; /* 1 */
    display: flex; /* 2 */
  }

  /**
   * 1. Make sure the dialog container and all its descendants are not
   *    visible and not focusable when it is hidden.
   */
  .site-dialog[aria-hidden='true'] {
    display: none; /* 1 */
  }

  /**
   * 1. Make the overlay look like an overlay.
   */
  .site-dialog__overlay {
    background-color: var(--site-background-color--transparent); /* 1 */
  }

  /**
   * 1. Vertically and horizontally center the dialog in the page.
   * 2. Make sure the dialog sits on top of the overlay.
   * 3. Make sure the dialog has an opaque background.
   */
  .site-dialog__dialog {
    margin: auto; /* 1 */
    z-index: 2; /* 2 */
    position: relative; /* 2 */
    border: 4px solid var(--site-border-color--transparent); /* 3 */
    background-color: var(--site-background-color); /* 3 */
  }
</style>
