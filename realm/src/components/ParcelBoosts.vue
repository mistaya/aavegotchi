<template>
  <ul
    v-if="hasBoost"
    class="parcel-boosts"
  >
    <template
      v-for="([num, label])  in [[fudNum, 'FUD'], [fomoNum, 'FOMO'], [alphaNum, 'ALPHA'], [kekNum, 'KEK']]"
      :key="label"
    >
      <li
        v-if="num"
        class="parcel-boost"
        :class="`parcel-boost--${label.toLowerCase()}`"
      >{{ num }} {{ label }}</li>
    </template>
  </ul>
</template>

<script>
export default {
  props: {
    fud: { type: [String, Number], default: null },
    fomo: { type: [String, Number], default: null },
    alpha: { type: [String, Number], default: null },
    kek: { type: [String, Number], default: null }
  },
  computed: {
    hasBoost () {
      return this.fomoNum || this.fudNum || this.alphaNum || this.kekNum
    },
    fudNum () {
      return this.fud - 0
    },
    fomoNum () {
      return this.fomo - 0
    },
    alphaNum () {
      return this.alpha - 0
    },
    kekNum () {
      return this.kek - 0
    }
  }
}
</script>

<style>
  /* global styles for color scheme */
  .parcel-boosts {
    --boost-color--a: 1.0;
    --boost-color-bg--a: 0.15;
    --fud-color--r: 0;
    --fud-color--g: 255;
    --fud-color--b: 0;
    --fud-color: rgb(var(--fud-color--r), var(--fud-color--g), var(--fud-color--b), var(--boost-color--a));
    --fud-color-bg: rgb(var(--fud-color--r), var(--fud-color--g), var(--fud-color--b), var(--boost-color-bg--a));
    --fomo-color--r: 255;
    --fomo-color--g: 30;
    --fomo-color--b: 0;
    --fomo-color--a: 1;
    --fomo-color: rgb(var(--fomo-color--r), var(--fomo-color--g), var(--fomo-color--b), var(--boost-color--a));
    --fomo-color-bg: rgb(var(--fomo-color--r), var(--fomo-color--g), var(--fomo-color--b), var(--boost-color-bg--a));
    --alpha-color--r: 0;
    --alpha-color--g: 255;
    --alpha-color--b: 255;
    --alpha-color--a: 1;
    --alpha-color: rgb(var(--alpha-color--r), var(--alpha-color--g), var(--alpha-color--b), var(--boost-color--a));
    --alpha-color-bg: rgb(var(--alpha-color--r), var(--alpha-color--g), var(--alpha-color--b), var(--boost-color-bg--a));
    --kek-color--r: 240;
    --kek-color--g: 30;
    --kek-color--b: 255;
    --kek-color--a: 1;
    --kek-color: rgb(var(--kek-color--r), var(--kek-color--g), var(--kek-color--b), var(--boost-color--a));
    --kek-color-bg: rgb(var(--kek-color--r), var(--kek-color--g), var(--kek-color--b), var(--boost-color-bg--a));
  }

  .site-dark-mode .parcel-boosts {
    --boost-color--a: 0.5;
  }
</style>
<style scoped>
  .parcel-boosts {
    display: inline-block;
    list-style-type: none;
    margin: 0 0 -5px 0;
    padding: 0;
    font-variant: all-small-caps;
  }

  .parcel-boost {
    --boost-color: black;
    --boost-color-bg: rgba(0,0,0,0.15);
    display: inline-block;
    margin: 0 0 5px 0;
    vertical-align: middle;

    border: 1px solid var(--boost-color);
    padding: 0 7px 2px 7px;
    background: var(--boost-color-bg);
  }
  .parcel-boost:first-child {
    border-top-left-radius: 0.75em;
    border-bottom-left-radius: 0.75em;
  }
  .parcel-boost:last-child {
    border-top-right-radius: 0.75em;
    border-bottom-right-radius: 0.75em;
  }
  .parcel-boost--fud {
    --boost-color: var(--fud-color);
    --boost-color-bg: var(--fud-color-bg);
  }
  .parcel-boost--fomo {
    --boost-color: var(--fomo-color);
    --boost-color-bg: var(--fomo-color-bg);
  }
  .parcel-boost--alpha {
    --boost-color: var(--alpha-color);
    --boost-color-bg: var(--alpha-color-bg);
  }
  .parcel-boost--kek {
    --boost-color: var(--kek-color);
    --boost-color-bg: var(--kek-color-bg);
  }

</style>
