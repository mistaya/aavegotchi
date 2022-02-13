<template>
  <button class="site-button">
    <span class="site-button__detector" />
    <span class="site-button__detector" />
    <span class="site-button__detector" />
    <span class="site-button__detector" />
    <span class="site-button__shadow"></span>
    <slot></slot>
  </button>
</template>

<script>

export default {
  name: 'SiteButton'
}
</script>

<style>
  /* unscoped styles, so we can reference .site-dark-mode */
  .site-button {
    --site-button-border-width: 2px;
    --site-button-border-color: rgba(84, 23, 82, 0.5);
    --site-button-background-color: rgba(250, 52, 243, 0.05);
    --site-button-background-color--active: rgba(250, 52, 243, 0.2);
    --site-button-background-color--pressed: rgba(250, 52, 243, 0.6);
    --site-button-shadow-color: rgba(250, 52, 243, 0.25);
    --site-button-text-color: rgba(84, 23, 82, 0.9);
    --site-button-text-color--pressed: rgba(52, 16, 51, 0.9);
    --site-button-animation-duration: 0.3s;
  }

  .site-dark-mode .site-button {
    --site-button-border-color: rgba(255, 255, 255, 0.2);
    --site-button-background-color: rgba(100, 45, 98, 0.33);
    --site-button-background-color--active: rgba(250, 52, 243, 0.2);
    --site-button-background-color--pressed: rgba(140, 66, 140, 0.75);
    --site-button-shadow-color: rgba(250, 52, 243, 0.2);
    --site-button-text-color: rgba(255, 255, 255, 0.8);
    --site-button-text-color--pressed: rgba(255, 255, 255, 0.8);
  }
</style>

<style scoped>
  .site-button {
    display: inline-block;
    position: relative; /* so the contents can be stretched to fill this button's size */
    isolation: isolate; /* creating a stacking context, so the shadow doesn't disappear behind other non-button elements */
    color: var(--site-button-text-color);
    background: var(--site-button-background-color);
    border: var(--site-button-border-width) solid var(--site-button-border-color);
    border-radius: 0;
    transform: translateZ(0); /* ensure a layer is created up-front, otherwise it only happens on hover which causes slowness */
    backface-visibility: hidden; /* might help 3d performance */
  }
  @media (prefers-reduced-motion: reduce) {
    .site-button {
      transform: none;
      backface-visibility: initial;
    }
  }
  .site-button:active {
    --site-button-background-color: var(--site-button-background-color--active);
  }
  .site-button:focus-visible {
    outline: 2px solid var(--site-button-background-color--pressed);
    outline-offset: 3px;
  }
  .site-button[aria-pressed=true] {
    --site-button-text-color: var(--site-button-text-color--pressed);
    --site-button-background-color: var(--site-button-background-color--pressed);
    font-weight: bold;
  }
  .site-button__shadow {
    --site-button-shadow-translate-distance: 10px;
    --site-button-shadow-translate-x: 0px;
    --site-button-shadow-translate-y: 0px;
    pointer-events: none;
    display: none;
    position: absolute;
    z-index: -1;
    top: calc(0px - var(--site-button-border-width));
    right: calc(0px - var(--site-button-border-width));
    bottom: calc(0px - var(--site-button-border-width));
    left: calc(0px - var(--site-button-border-width));
    border: var(--site-button-border-width) solid var(--site-button-border-color);
    background-color: var(--site-button-shadow-color);
    opacity: 0;
    will-change: transform, opacity;
  }
  @media (prefers-reduced-motion: reduce) {
    .site-button {
      will-change: initial;
    }
  }
  .site-button:hover .site-button__shadow {
    display: block;
  }
  @keyframes shadow-enter {
    0% {
      opacity: 0;
      transform: translate(var(--site-button-shadow-translate-x), var(--site-button-shadow-translate-y));
    }
    100% {
      opacity: 0.8;
      transform: translate(0, 0);
    }
  }

  .site-button__detector {
    display: block;
    position: absolute;
    z-index: 1;
    top: calc(0px - var(--site-button-border-width));
    right: calc(0px - var(--site-button-border-width));
    bottom: calc(0px - var(--site-button-border-width));
    left: calc(0px - var(--site-button-border-width));
    opacity: 0;
  }
  .site-button__detector:nth-child(1) {
    /*background: yellow;*/
    bottom: 50%;
    left: 50%;
  }
  .site-button__detector:nth-child(1):hover ~ .site-button__shadow {
    --site-button-shadow-translate-x: var(--site-button-shadow-translate-distance);
    --site-button-shadow-translate-y: calc(0px - var(--site-button-shadow-translate-distance));
  }
  .site-button__detector:nth-child(2) {
    /*background: red;*/
    top: 50%;
    left: 50%;
  }
  .site-button__detector:nth-child(2):hover ~ .site-button__shadow {
    --site-button-shadow-translate-x: var(--site-button-shadow-translate-distance);
    --site-button-shadow-translate-y: var(--site-button-shadow-translate-distance);
  }
  .site-button__detector:nth-child(3) {
    /*background: blue;*/
    top: 50%;
    right: 50%;
  }
  .site-button__detector:nth-child(3):hover ~ .site-button__shadow {
    --site-button-shadow-translate-x: calc(0px - var(--site-button-shadow-translate-distance));
    --site-button-shadow-translate-y: var(--site-button-shadow-translate-distance);
  }
  .site-button__detector:nth-child(4) {
    /*background: green;*/
    right: 50%;
    bottom: 50%;
  }
  .site-button__detector:nth-child(4):hover ~ .site-button__shadow {
    --site-button-shadow-translate-x: calc(0px - var(--site-button-shadow-translate-distance));
    --site-button-shadow-translate-y: calc(0px - var(--site-button-shadow-translate-distance));
  }

  .site-button__detector:hover {
    /* when a detector is hovered, immediately expand it and bring it to the top so we can't hover a different one */
    z-index: 2;
    top: calc(0px - var(--site-button-border-width));
    right: calc(0px - var(--site-button-border-width));
    bottom: calc(0px - var(--site-button-border-width));
    left: calc(0px - var(--site-button-border-width));
  }

  .site-button__detector:hover ~ .site-button__shadow {
    animation: var(--site-button-animation-duration) linear 0s forwards shadow-enter;
  }
  @media (prefers-reduced-motion: reduce) {
    .site-button__detector:hover ~ .site-button__shadow {
      animation: none;
      opacity: 0.8;
    }
  }
</style>
