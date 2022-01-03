<template>
  <div
    class="entrance"
    :class="{
      'entrance--entered': entered,
      'entrance--leaving': leaving
    }"
    :style="{
      '--num-shelves': numShelves,
      '--shelves-delay': `${shelvesDuration}s`
    }"
  >
    <div class="stockroom">
      <button
        v-if="!entered"
        type="button"
        style="margin: auto; padding: 10px 30px;"
        @click="entered = true"
      >
        Enter
      </button>

      <div
        ref="shelvesRef"
        class="shelves"
        :style="{
          '--per-shelf-duration': `${perShelfDuration}s`,
        }"
      >
        <div
          v-for="i in numShelves"
          :key="i"
          class="shelf"
          :class="{
            'shelf--left': isLeftShelf(i),
            'shelf--target': isTargetShelf(i)
          }"
          :style="{
            '--shelf-num': i-1,
            'z-index': `${numShelves - Math.abs((numShelves)/2 - i)}`,
            '--wearable-svg-1': isTargetShelf(i) ? `url('data:image/svg+xml;utf8,${wearableSvgs[0]}')` : false,
            '--wearable-svg-2': isTargetShelf(i) ? `url('data:image/svg+xml;utf8,${wearableSvgs[1]}')` : false,
            '--wearable-svg-3': isTargetShelf(i) ? `url('data:image/svg+xml;utf8,${wearableSvgs[2]}')` : false,
            '--wearable-svg-4': isTargetShelf(i) ? `url('data:image/svg+xml;utf8,${wearableSvgs[3]}')` : false
          }"
          :data-svg="isTargetShelf(i) ? `url('data:image/svg+xml;utf8,${wearableSvgs[0]}')` : ''"
        >
          <div class="shelf-extension" />
          <template v-if="isTargetShelf(i)">
            <div class="shelf-gotchi-bg" />
          </template>
        </div>
      </div>
      <div class="creation-point">
        <div class="creation-point-inner" />
      </div>
    </div>
    <div class="shelf-gotchi">
      <GotchiImage
        hideBackground
        :floating="floating"
        :happy="happy"
      />
    </div>
  </div>
</template>

<script>
import GotchiImage from "./GotchiImage.vue";
import wearableSvgs from "./waardrobeWearableSvgs"

export default {
  components: {
    GotchiImage
  },
  data () {
    return {
      entered: true,
      happy: false,
      floating: true,
      leaving: false,
      numShelves: 16,
      /* browser performance degrades for very short duration/rapid shelf entry */
      perShelfDuration: 0.05
      //perShelfDuration: 1
    }
  },
  computed: {
    shelvesDuration () {
      // duration is calculated by the travel time of the creation point across all shelves
      // plus its own length (4 shelves) for the initial delay
      return (4 + this.numShelves) * this.perShelfDuration;
    },
    wearableSvgs () {
      const randoms = []
      while (randoms.length < 4) {
        const randomIndex = Math.floor(Math.random() * wearableSvgs.length);
        if (!randoms.includes(randomIndex)) {
          randoms.push(randomIndex)
        }
      }
      return randoms.map(index => escape(wearableSvgs[index]));
    }
  },
  watch: {
    entered: {
      immediate: true,
      handler () {
        if (this.entered) {
          this.$nextTick(() => {
            if (this.$refs.shelvesRef) {
              const animation = this.$refs.shelvesRef.getAnimations().find(anim => anim.animationName.includes("faceSide"))
              if (animation) {
                animation.onfinish = () => {
                  setTimeout(() => this.makeGotchiHappy(), 1000)
                }
                return;
              }
            }
          })
          // if we got here, then we didn't manage to set up an end-animation handler
          // so set up one manually for after the zoom finishes
          setTimeout(() => this.makeGotchiHappy(), 1000 * (this.shelvesDuration + 2 + 1) )
        }
      }
    }
  },
  unmounted () {
    this.isDestroyed = true
  },
  methods: {
    isLeftShelf (i) {
      return i <= this.numShelves/2;
    },
    isTargetShelf (i) {
      return i == this.numShelves/2;
    },
    makeGotchiHappy () {
      // The 'happy' animation gets out of sync with the 'floating' animation
      // so only enable one at a time
      this.happy = true
      this.floating = false
      setTimeout(() => {
        this.happy = false
      }, 500);
      setTimeout(() => {
        this.happy = true
      }, 1200);
      setTimeout(() => {
        this.happy = false
        this.floating = true
      }, 1700);
      setTimeout(() => {
        this.leave()
      }, 3200);
    },
    leave () {
      this.leaving = true;
      setTimeout(() => {
        if (this.isDestroyed) { return; }
        this.$router.push({ name: "WaardrobePage" });
      }, 700);
    }
  }
}
</script>

<style scoped>

  .entrance {
    position: absolute;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    --creation-point-glow: rgba(223, 0, 169, 0.5);
    --shelf-depth: 40px;
    --shelf-height: 200px;
    --shelf-length: 6000px;
    --shelf-gap: calc(100vw / var(--num-shelves));
    --gotchi-size: min(70vw, 80vh, 500px);
    --gotchi-bg-width: 2000px;
    --shelves-target-position: 200px;
    --initial-stockroom-scale: 0.1;
    --target-stockroom-scale: 12;
    --zoom-duration: 2s;
  }

  .entrance--leaving {
    opacity: 0;
    transition: opacity 0.7s;
  }

  .stockroom {
    transform-style: preserve-3d;

    z-index: -1;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    display: grid;
    align-items: center;
  }
  .entrance--entered .stockroom {
    animation:
      zoomPerspective var(--zoom-duration) cubic-bezier(0.180, 0.770, 0.765, 1.015) var(--shelves-delay) forwards,
      zoomIn var(--zoom-duration) cubic-bezier(0.870, 0.110, 1.000, 0.715) var(--shelves-delay) forwards;
  }

  /* Need to adjust scale so that the gotchi/shelf takes up most of the screen
     at different screen sizes.
     But we can't use CSS to find the ratio of shelf px/100vh,
     as CSS calc '/' requires a unitless divisor,
     so workaround by using hardcoded scales at different sizes.
   */
  @media (min-width: 400px) and (min-height: 250px) {
    .stockroom {
      --target-stockroom-scale: 12;
    }
  }
  @media (min-width: 450px) and (min-height: 250px) {
    .stockroom {
      --target-stockroom-scale: 20;
    }
  }
  @media (min-width: 450px) and (min-height: 350px) {
    .stockroom {
      --target-stockroom-scale: 28;
    }
  }
  @media (min-width: 650px) and (min-height: 500px) {
    .stockroom {
      --target-stockroom-scale: 40;
    }
  }
  @media (min-width: 850px) and (min-height: 700px) {
    .stockroom {
      --target-stockroom-scale: 55;
    }
  }
  @media (min-width: 1050px) and (min-height: 700px) {
    .stockroom {
      --target-stockroom-scale: 65;
    }
  }
  @media (min-width: 1250px) and (min-height: 800px) {
    .stockroom {
      --target-stockroom-scale: 75;
    }
  }
  @media (min-width: 1450px) and (min-height: 800px) {
    .stockroom {
      --target-stockroom-scale: 83;
    }
  }

  @keyframes zoomPerspective {
    0% {
      perspective: 10000px;
    }
    1% {
      perspective: 6000px;
    }
    100% {
      perspective: 10px;
    }
  }
  @keyframes zoomIn {
    0% {
      transform: scale(1);
    }
    100% {
      transform: scale(var(--target-stockroom-scale));
    }
  }

  .entrance--entered .shelves {
    --translate-z: var(--shelves-target-position);
    --translate-x-amount: 0.6;
    --translate-x: calc(var(--translate-x-amount) * var(--shelf-gap));
    animation:
      moveForwards 0.5s linear var(--shelves-delay) forwards,
      faceSide 0.1s linear calc(var(--zoom-duration) + var(--shelves-delay)) forwards;
  }

  @media (min-width: 450px) {
    .entrance--entered .shelves {
      --translate-x-amount: 0.2;
    }
  }

  @keyframes moveForwards {
    0% {
      transform: translateZ(0px);
    }
    100% {
      transform: translateZ(var(--translate-z));
    }
  }

  @keyframes faceSide {
    0% {
      transform: rotateY(0) translateX(0) translateZ(var(--translate-z));
    }
    100% {
      transform: rotateY(-90deg) translateX(var(--translate-x)) translateZ(var(--translate-z));
    }
  }

  .shelves {
    transform-style: preserve-3d;

    width: 100vw;
    height: 100vh;

    grid-row: 1;
    grid-column: 1 /2;

    display: grid;
    grid-template-columns: repeat(var(--num-shelves), minmax(0, 1fr));
    align-items: center;
    justify-items: center;
  }
  .shelf,
  .shelf-extension {
    transform: translateX(150vw) scale(var(--initial-stockroom-scale));
  }

  .shelf {
    transform-style: preserve-3d;

    grid-row: 1;
    grid-column: calc(var(--shelf-num) + 1) / calc(var(--shelf-num) + 2);

    height: var(--shelf-height);
    width: var(--shelf-depth);
    background-color: #333;
  }
  .entrance--entered .shelf {
    animation: enterShelf calc(var(--per-shelf-duration) * (0.5 + var(--num-shelves) - var(--shelf-num))) step-end 0s forwards;
  }
  /* use translateX to make the shelf 'appear' instantly (initially hidden offscreen).
    Can't use opacity because that disables transform-style: preserve-3d
   */
  @keyframes enterShelf {
    0% {
      transform: translateX(150vw) scale(var(--initial-stockroom-scale));
    }
    100% {
      transform: translateX(0vw) scale(var(--initial-stockroom-scale));
    }
  }

  .shelf-extension {
    border: calc(0.25 * var(--shelf-depth)) solid #333;
    background-color: #555;
    /* image gradient: vertical lines */
    background-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(153,153,153,1) 7%, rgba(68,68,68,1) 12%, rgba(51,51,51,1) 16%, rgba(204,204,204,1) 21%, rgba(82,82,82,1) 24%, rgba(51,51,51,1) 32%, rgba(62,62,62,1) 36%, rgba(67,67,67,1) 56%, rgba(170,170,170,1) 63%, rgba(31,31,31,1) 71%, rgba(0,0,0,1) 83%, rgba(0,0,0,1) 100%);
    background-size: calc(var(--shelf-length) / 50);
    width: var(--shelf-length);
    height: var(--shelf-height);
    transform-style: preserve-3d;
    transform-origin: left;
    transform: translateX(calc(0.05 * var(--shelf-depth))) rotateY(90deg);
  }

  .shelf--left .shelf-extension {
    transform: translateX(calc(0.95 * var(--shelf-depth))) rotateY(90deg);
  }

  .shelf-gotchi-bg {
    position: absolute;
    top: 0;
    left: 100%;
    transform:
      /* move the bg to the final 'camera' perspective, centered by offsetting by half the background width */
      translateZ(calc(-1 * (var(--shelves-target-position) - 0.5 * var(--initial-stockroom-scale) * var(--gotchi-bg-width))))
      /* rotate the bg so it makes a layer in front of the shelves */
      rotateY(90deg)
      /* the bg width will be stretched with the perspective along the shelves: reverse this effect so it appears normal */
      scaleX(var(--initial-stockroom-scale));
    transform-origin: left;
    width: var(--gotchi-bg-width);
    height: var(--shelf-height);
    Xbackground-color: green;
    opacity: 0;

    background-image:
      var(--wearable-svg-1),
      var(--wearable-svg-2),
      var(--wearable-svg-3),
      var(--wearable-svg-4),
      /* image gradient: horizontal shelves */
      linear-gradient(
        180deg,
        rgba(51,51,51,1) 0%,
        rgba(51,51,51,1) 4%, rgba(85,85,85,1) 4%,
        rgba(85,85,85,1) 24%, rgba(51,51,51,1) 24%,
        rgba(51,51,51,1) 28%, rgba(85,85,85,1) 28%,
        rgba(85,85,85,1) 48%, rgba(51,51,51,1) 48%,
        rgba(51,51,51,1) 52%, rgba(85,85,85,1) 52%,
        rgba(85,85,85,1) 71%, rgba(51,51,51,1) 71%,
        rgba(51,51,51,1) 75%, rgba(85,85,85,1) 75%,
        rgba(85,85,85,1) 96%, rgba(51,51,51,1) 96%,
        rgba(51,51,51,1) 100%);
    background-repeat: repeat-x;
    background-position-y: 7%, 36%, 66%, 97%, 0%;
    background-size:
      auto calc(var(--shelf-height) / 5),
      auto calc(var(--shelf-height) / 5),
      auto calc(var(--shelf-height) / 5),
      auto calc(var(--shelf-height) / 5),
      auto;

    filter: saturate(0.7);
  }
  .entrance--entered .shelf-gotchi-bg {
    animation: appear 0s step-end calc(var(--zoom-duration) + var(--shelves-delay)) forwards;
  }

  .creation-point {
    --creation-point-spans-shelves: 4;
    --creation-point-width: calc(var(--creation-point-spans-shelves) * 100vw / var(--num-shelves));

    grid-row: 1;
    grid-column: 1 /2;

    mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(255,255,255,0) 85%, rgba(255,255,255,0) 100%);
    -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(255,255,255,0) 85%, rgba(255,255,255,0) 100%);

    width: var(--creation-point-width);
    padding: 40px 30px;

    transform: translateX(100vw);
  }
  .entrance--entered .creation-point {
    animation: creationPointMove var(--shelves-delay) linear 0s forwards;
  }
  @keyframes creationPointMove {
    /* start offscreen to the right */
    0% { transform: translateX(100vw); }
    /* end offscreen to the left */
    100% { transform: translateX(-100%); }
  }
  .creation-point-inner {
    height: 40px;
    width: var(--creation-point-width);
    border-radius: 20px;
    box-shadow: inset 0px 0px 25px var(--creation-point-glow), 0px 0px 40px 1px var(--creation-point-glow);
  }

  /* The gotchi is rendered outside/over the 3D context,
   * to avoid Chrome's bad rendering quality for the floating effect there.
   * This also lets it render at full resolution, instead of suffering scaling degradation in 3D.
   */
  .shelf-gotchi {
    position: absolute;
    top: calc(60% - var(--gotchi-size) / 2);
    left: calc(50% - var(--gotchi-size) / 2);
    width: var(--gotchi-size);
    height: var(--gotchi-size);
    Xbackground-color: pink;
    opacity: 0;
  }
  .entrance--entered .shelf-gotchi {
    animation: appear 0s step-end calc(var(--zoom-duration) + var(--shelves-delay)) forwards;
  }
  @keyframes appear {
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
</style>