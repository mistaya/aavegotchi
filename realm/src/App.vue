<template>
  <div
    class="app-layout"
    :class="{
      'device--no-touch': deviceNoTouch,
      'app-layout--large-screen-fit-height': largeScreenFitHeight
    }"
  >
    <SiteHead />
    <SiteIcons />
    <SiteNav />
    <main>
      <div v-if="pageLoading">
        Loading...
      </div>
      <router-view v-else />
    </main>
    <SiteFooter />
    <div
      class="site-global-alert"
      v-if="pageLazyLoadError && !hideAlert"
    >
      <SiteButton
        type="button"
        style="position: absolute; top: 5px; right: 5px; display: flex;"
        title="Close"
        @click="hideAlert = true"
      >
        <span class="sr-only">Close</span>
        <SiteIcon name="cancel" />
      </SiteButton>
      A new version of this website is available!
      <br>
      Please <a href="">refresh this page</a>.
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import useAppLayout from './useAppLayout'
import usePageLoading from '@/router/usePageLoading'
import SiteHead from '@/components/SiteHead.vue'
import SiteIcons from '@/components/SiteIcons.vue'
import SiteNav from '@/components/SiteNav.vue'
import SiteFooter from '@/components/SiteFooter.vue'

export default {
  name: 'App',
  components: {
    SiteHead,
    SiteIcons,
    SiteNav,
    SiteFooter
  },
  setup: function () {
    const { pageLoading, pageLazyLoadError } = usePageLoading()
    const { largeScreenFitHeight } = useAppLayout()
    const hideAlert = ref(false)

    return {
      pageLoading,
      pageLazyLoadError,
      hideAlert,
      deviceNoTouch: !('ontouchstart' in document.documentElement),
      largeScreenFitHeight
    }
  }
}
</script>

<style>
  /* browser styling of light/dark form controls: relies on html.site-dark-mode being updated externally */
  :root {
    color-scheme: light;
  }
  .site-dark-mode {
    color-scheme: dark;
  }

  /* Use simpler box-sizing reset, because the inherit version causes performance issues with large svg */
  *, *:before, *:after {
    box-sizing: border-box;
  }

  html, body, #app {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  :root {
    --purple: #FA34F3;
    --gotchi-pink: #f696c6;

    --rarity-color--common: rgb(128, 100, 255);
    --rarity-color--uncommon: rgb(51, 186, 204);
    --rarity-color--rare: rgb(89, 188, 255);
    --rarity-color--legendary: rgb(255, 195, 107);
    --rarity-color--mythical: rgb(255, 150, 255);
    --rarity-color--godlike: rgb(81, 255, 168);

    --site-border-color--transparent: rgba(0, 0, 0, 0.25);
    --site-background-color: white;
    --site-background-color--transparent: rgba(255, 255, 255, 0.9);
    --site-background-color--alternate: #eee;
    --site-text-color: black;
    --site-text-color--subtle: #767676;
    --site-scrollbar-color: rgba(0,0,0,0.4);
    --site-scrollbar-shadow-color: rgba(255,255,255,0.4);
    --site-form-accent-color: var(--purple);
    --site-selection-background-color: rgba(250, 113, 244, 0.55);
    --site-selection-text-color: black;
  }
  .site-dark-mode {
    --site-border-color--transparent: rgba(255, 255, 255, 0.25);
    --site-background-color: rgb(20, 20, 20);
    --site-background-color--transparent: rgba(20, 20, 20, 0.9);
    --site-background-color--alternate: #333;
    --site-text-color: white;
    --site-text-color--subtle: #888;
    --site-scrollbar-color: rgba(255,255,255,0.4);
    --site-scrollbar-shadow-color: rgba(0,0,0,0.4);
    --site-form-accent-color: #d588d2;
    --site-selection-background-color: rgba(239, 173, 237, 0.8);
    --site-selection-text-color: black;
  }

  body {
    margin: 0;
    padding: 0;
    text-size-adjust: none;
    font-size: 16px;

    background: var(--site-background-color);
    color: var(--site-text-color);

    font-family: 'Liberation Sans', 'Helvetica Neue', 'Arial Nova', sans-serif;
  }

  ::selection {
    background: var(--site-selection-background-color);
    color: var(--site-selection-text-color);
  }

  h1 {
    margin: 0 0 10px 0;
    font-size: 1.4em;
  }

  h2 {
    margin: 20px 0;
    font-size: 1.2em;
  }

  h3 {
    margin: 10px 0;
    font-size: 1em;
    font-weight: bold;
  }

  h4 {
    margin: 10px 0 5px 0;
    font-size: 0.9em;
    font-weight: normal;
    font-style: italic;
  }

  a {
    --site-link-color: rgb(84, 23, 82);
    --site-link-underline-color: rgba(221, 131, 221, 0.5);
    --site-link-underline-color--hover: rgba(255, 150, 255, 1);
  }

  .site-dark-mode a {
    --site-link-color: rgb(252 213 251);
    --site-link-underline-color: rgba(221, 131, 221, 0.5);
    --site-link-underline-color--hover: rgba(255, 150, 255, 0.8);
  }

  a,
  a:visited {
    line-height: 1.5em;
    color: var(--site-link-color);
    text-decoration: underline;
    text-decoration-skip-ink: none;
    text-underline-offset: 2px;
    text-decoration-thickness: 2px;
    text-decoration-color: var(--site-link-underline-color);
  }
  a:hover,
  a:focus,
  a:active {
    text-decoration-color: var(--site-link-underline-color--hover);
    outline: 1px solid transparent;
  }
  a:focus-visible {
    outline: 1px solid var(--site-link-underline-color--hover);
    outline-offset: 7px;
  }

  main {
    padding: 10px;
  }

  input[type="checkbox"],
  input[type="radio"] {
    accent-color: var(--site-form-accent-color);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .word-break {
    word-break: break-word;
  }
  .visible-scrollbar::-webkit-scrollbar {
    -webkit-appearance: none;
    width: 7px;
    height: 7px;
  }
  .visible-scrollbar::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: var(--site-scrollbar-color);
    -webkit-box-shadow: 0 0 1px var(--site-scrollbar-shadow-color);
  }

  .button-reset {
    border: none;
    background-color: transparent;
    font-family: inherit;
    padding: 0;
    cursor: pointer;

    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .button-reset::-moz-focus-inner {
    border: 0;
    padding: 0;
  }

  .site-banner {
    --site-banner-background-color: rgba(84, 23, 82, 0.9);
    --site-banner-background-color--secondary: rgba(84, 23, 82, 0.7);
    --site-banner-text-color: #f9e6f8;
    background: var(--site-banner-background-color);
    color: var(--site-banner-text-color);
  }
  .site-dark-mode .site-banner {
    --site-banner-background-color: rgba(209, 164, 209, 0.5);
    --site-banner-background-color--secondary: rgba(209, 164, 209, 0.35);
    --site-banner-text-color: #f7e0f6;
  }
  .site-banner--secondary {
    background: var(--site-banner-background-color--secondary);
  }

  .site-banner__link {
    --site-banner-link-color: white;
    --site-banner-link-underline-color: var(--site-banner-link-color);
    --site-banner-link-underline-color--hover: var(--rarity-color--mythical);
    --site-banner-link-underline-color--current: rgba(255, 255, 255, 0.8);
    display: inline-block;
    text-decoration: underline;
    text-decoration-color: var(--site-banner-link-color);
    text-underline-offset: 3px;
    white-space: nowrap;
  }
  .site-banner__link,
  .site-banner__link:visited {
    color: var(--site-banner-link-color);
    text-decoration-color: var(--site-banner-link-underline-color);
  }

  .site-banner__link:hover,
  .site-banner__link:focus,
  .site-banner__link[aria-current=page],
  .site-banner__link.router-link-active {
    text-decoration-color: var(--site-banner-link-underline-color--hover);
    text-decoration-thickness: 4px;
    text-underline-offset: 1px;
  }
  .site-banner__link:focus-visible {
    outline: 1px solid var(--site-banner-link-color);
    outline-offset: 7px;
  }
  .site-banner__link[aria-current=page],
  .site-banner__link.router-link-active {
    --site-banner-link-underline-color--hover: var(--site-banner-link-underline-color--current);
    font-weight: bold;
  }
  .site-banner__link[aria-current=page]::before,
  .site-banner__link[aria-current=page]::after,
  .site-banner__link.router-link-active::before,
  .site-banner__link.router-link-active::after {
    content: '';
    display: inline-block;
    position: relative;
    top: -3px;
    width: 4px;
    height: 4px;
    background-color: var(--gotchi-pink);
  }
  .site-banner__link[aria-current=page]::before,
  .site-banner__link.router-link-active::before {
    left: -4px;
  }
  .site-banner__link[aria-current=page]::after,
  .site-banner__link.router-link-active::after {
    right: -4px;
  }

  .site-card {
    --site-card-border-color: #ccc;
    --site-card-background-color: rgba(0, 0, 0, 0.01);
    max-width: 100%;
    border: 1px solid var(--site-card-border-color);
    border-radius: 8px;
    background: var(--site-card-background-color);
  }

  .site-dark-mode .site-card {
    --site-card-border-color: #444;
    --site-card-background-color: rgba(209, 164, 209, 0.05);
  }

  .site-alertbox {
    --site-alertbox-border-color: var(--site-border-color--transparent);
    --site-alertbox-background-color: var(--site-background-color--transparent);
    display: inline-flex;
    align-items: flex-start;
    column-gap: 5px;
    border: 1px solid var(--site-alertbox-border-color);
    border-radius: 5px;
    padding: 15px;
    background-color: var(--site-alertbox-background-color);
  }
  .site-alertbox > svg {
    flex: none;
  }
  .site-alertbox > div {
    flex: 1 1 auto;
  }
  .site-alertbox--compact {
    padding: 8px;
    font-size: 0.9em;
  }
  .site-alertbox--info {
    --site-alertbox-border-color: rgba(50, 100, 205, 0.5);
    --site-alertbox-background-color: rgba(50, 100, 205, 0.15);
  }
  .site-alertbox--warning {
    --site-alertbox-border-color: rgba(255, 150, 0, 0.5);
    --site-alertbox-background-color: rgba(255, 150, 0, 0.15);
  }
  .site-global-alert {
    z-index: 1;
    position: absolute;
    top: 22px;
    left: 50px;
    border: 4px solid var(--site-form-accent-color);
    padding: 35px 20px 20px 20px;
    background: var(--site-background-color);
    color: var(--site-text-color);
  }
</style>

<style scoped>
  .app-layout {
    height: 100%;
    display: grid;
    grid-template-columns: minmax(10px, 1fr);
    grid-template-rows: auto 1fr auto;
  }
  @media (min-height: 600px) and (min-width: 1100px) {
    .app-layout--large-screen-fit-height {
      grid-template-rows: auto minmax(10px, 1fr) auto;
    }
  }
</style>
