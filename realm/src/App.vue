<template>
  <main>
    <router-view />
  </main>
</template>

<script>

export default {
  name: 'App'
}
</script>

<style>
  body {
    --purple: #FA34F3;
  }

  h1 {
    margin: 0 0 10px 0;
    font-size: 1.4em;
  }

  h2 {
    margin: 10px 0 0;
    font-size: 1.2em;
  }

  h3 {
    margin: 10px 0;
    font-size: 1em;
    font-weight: bold;
  }

  h4 {
    margin: 10px 0 5px 0;
    font-size: 1em;
    font-weight: normal;
    font-style: italic;
  }

  main {
    padding: 10px;
  }

  input[type="checkbox"] {
    accent-color: var(--purple);
  }
</style>
