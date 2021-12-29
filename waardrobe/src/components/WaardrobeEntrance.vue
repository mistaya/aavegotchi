<template>
  <div class="entrance">
    <!-- TODO see if moving svgs out here makes any difference to performance - with use or url(#id)? -->
    <div
      class="stockroom"
      :style="{
        '--num-shelves': numShelves,
        '--shelves-delay': `${shelvesDuration}s`
      }"
      :class="{
        'stockroom--entered': entered
      }"
    >
      <button
        v-if="!entered"
        type="button"
        style="margin: auto; padding: 10px 30px;"
        @click="entered = true"
      >
        Enter
      </button>

      <template v-if="entered">
        <!-- The xyz animation library solves 2 problems:
          1) animating opacity and preserve-3d are incompatible https://css-tricks.com/things-watch-working-css-3d/
             but the xyz implementation works without awkward workarounds
          2) chrome has bad performance for the very fast shelf/glow appearance and skips a lot of frames,
             but the xyz implementation (involving adding/removing CSS classes to trigger appearances)
             has a better result than simple timed transitions/animations
         -->
        <XyzTransitionGroup
          appear
          class="shelves"
          xyz="fade appear-stagger-rev"
          :style="{
            '--xyz-appear-stagger-rev': `${perShelfDuration}s`,
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
              '--xyz-index-rev': numShelves - i + 1,
              '--xyz-transform': 'scale(var(--initial-stockroom-scale))',
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
              <div class="shelf-gotchi">
                <GotchiImage
                  hideBackground
                  floating
                />
              </div>
            </template>
          </div>
        </XyzTransitionGroup>
        <div class="creation-point">
          <div class="creation-point-inner" />
        </div>
      </template>
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
      entered: false,
      numShelves: 24,
      perShelfDuration: 0.02
      //perShelfDuration: 1
    }
  },
  computed: {
    shelvesDuration () {
      // start it just before the staggered shelves, by controlling their xyz-index-rev
      // then its duration is calculated by the travel time across all shelves
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
  methods: {
    isLeftShelf (i) {
      return i <= this.numShelves/2;
    },
    isTargetShelf (i) {
      return i == this.numShelves/2;
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
  }

  .stockroom {
    transform-style: preserve-3d;

    --creation-point-glow: rgba(223, 0, 169, 0.5);
    --shelf-depth: 40px;
    --shelf-height: 200px;
    --shelf-length: 6000px;
    --shelf-gap: calc(100vw / var(--num-shelves));
    --gotchi-size: 150px;
    --gotchi-bg-width: 2000px;
    --shelves-target-position: 200px;
    --initial-stockroom-scale: 0.1;
    --target-stockroom-scale: 12;
    --zoom-duration: 2s;

    z-index: -1;
    width: 100vw;
    height: 100vh;
    overflow: hidden;

    display: grid;
    align-items: center;
  }
  .stockroom--entered {
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

  .stockroom--entered .shelves {
    --translate-z: var(--shelves-target-position);
    --translate-x-amount: 0.6;
    --translate-x: calc(var(--translate-x-amount) * var(--shelf-gap));
    animation:
      moveForwards 0.5s linear var(--shelves-delay) forwards,
      faceSide 0.1s linear calc(var(--zoom-duration) + var(--shelves-delay)) forwards;
  }

  @media (min-width: 450px) {
    .stockroom--entered .shelves {
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
  .shelf-extension,
  .shelf-gotchi {
    transform: scale(var(--initial-stockroom-scale));
  }

  .shelf {
    transform-style: preserve-3d;

    grid-row: 1;
    grid-column: calc(var(--shelf-num) + 1) / calc(var(--shelf-num) + 2);

    height: var(--shelf-height);
    width: var(--shelf-depth);
    background-color: #333;
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

  .shelf-gotchi {
    position: absolute;
    bottom: 0;
    left: 100%;
    transform:
      /* move the gotchi down (y) to make it look like it's further in front of the shelves - this is easier than using translateX */
      translateY(calc(0.1 * var(--gotchi-size)))
      /* move the gotchi to the final 'camera' perspective, centered by offsetting by half the gotchi width */
      translateZ(calc(-1 * (var(--shelves-target-position) - 0.5 * var(--initial-stockroom-scale) * var(--gotchi-size))))
      /* rotate the gotchi so its back is to the shelves */
      rotateY(90deg)
      /* the gotchi width will be stretched with the perspective along the shelves: reverse this effect so it appears normal */
      scaleX(var(--initial-stockroom-scale));
    transform-origin: left;
    width: var(--gotchi-size);
    height: var(--gotchi-size);
    Xbackground-color: pink;
    opacity: 0;
  }
  .stockroom--entered .shelf-gotchi,
  .stockroom--entered .shelf-gotchi-bg {
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

  .creation-point {
    --creation-point-spans-shelves: 4;
    --creation-point-width: calc(var(--creation-point-spans-shelves) * 100vw / var(--num-shelves));

    grid-row: 1;
    grid-column: 1 /2;

    mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(255,255,255,0) 85%, rgba(255,255,255,0) 100%);
    -webkit-mask-image: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 60%, rgba(255,255,255,0) 85%, rgba(255,255,255,0) 100%);

    width: var(--creation-point-width);
    padding: 40px 30px;

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
</style>