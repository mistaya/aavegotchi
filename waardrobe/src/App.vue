<template>
  <router-view />
</template>

<script>
export default {
  name: 'App'
}
</script>

<style>
  html {
    box-sizing: border-box;
  }
  *, *:before, *:after {
    box-sizing: inherit;
  }

  body {
    margin: 0;
    padding: 0;
  }
</style>

<style scoped>
  .message {
    padding: 30px;
  }
</style>