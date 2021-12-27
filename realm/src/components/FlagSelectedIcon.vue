<template>
  <div
    class="icon"
    :class="{
      'icon--animated': animated
    }"
  >
    <div class="circle">
      <div class="circle2">
        <div class="circle3"/>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  props: {
    animated: { type: Boolean, default: false }
  }
}
</script>
<style scoped>
  .icon {
    display: flex;
    justify-content: center;
    align-items: center;
    flex: 0 0 auto;
    width: 16px;
    height: 16px;
  }
  .circle,
  .circle2,
  .circle3 {
    display: flex;
    align-items: center;
    justify-content: center;
    flex: 0 0 auto;
  }
  .circle {
    width: 100%;
    height: 100%;
    border: 1px solid #ccc;
    border-radius: 10px;
  }
  .icon--animated .circle {
    border-color: black;
    animation: pulse 2s normal infinite cubic-bezier(0.165, 0.84, 0.44, 1);
  }
  .icon--animated .circle2,
  .icon--animated .circle3 {
    display: none;
  }
  .circle2 {
    width: 10px;
    height: 10px;
    border: 1px solid #888;
    border-radius: 5px;
  }
  .circle3 {
    width: 4px;
    height: 4px;
    border: 1px solid black;
    border-radius: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .icon--animated .circle {
      animation:  none;
      transform: scale(0.75);
      border-width: 2px;
    }
  }

  @keyframes pulse {
    0%   {
      transform: scale(0);
      opacity: 1;
    }
    80% {
      transform: scale(1);
      opacity: 0;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
</style>
