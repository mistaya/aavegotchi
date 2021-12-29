<template>
  <div
    class="gotchi-image-container"
    :class="instanceNamespace"
  >
    <div v-if="svgStatus.error">
      Error fetching gotchi image ({{ svgStatus.errorMessage }})
    </div>
    <div v-if="svgStatus.loading || svgStatus.loaded">
      <div v-if="svgStatus.loading && !previousSvgs">
        Fetching gotchi image...
      </div>
      <div
        v-else
        class="gotchi-images"
        :class="{
          'gotchi-images--loading': svgStatus.loading,
          'gotchi-images--spinning': spinning,
          'gotchi-images--happy': happy,
          'gotchi-images--floating': floating,
          'gotchi-images--hide-background': hideBackground
        }"
      >
        <div
          v-for="(svg, svgIndex) in (svgStatus.loading ? previousSvgs : svgs)"
          :key="svgIndex"
          class="gotchi-image"
          v-html="svg"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import uniqueId from 'lodash.uniqueid'
import useGotchi from "@/data/useGotchi";

export default {
  props: {
    previewWearables: { type: Boolean, default: false },
    floating: { type: Boolean, default: false },
    spinning: { type: Boolean, default: false },
    happy: { type: Boolean, default: false },
    hideBackground: { type: Boolean, default: false }
  },
  setup (props) {
    const { gotchiStatus, gotchiSvg, previewSvgStatus, previewSvg, namespaceSvgText } = useGotchi();

    const instanceNamespace = ref(uniqueId('gotchi-image__'));
    const previousSvgs = ref(null);

    const svgStatus = computed(() => {
      return props.previewWearables ? previewSvgStatus.value : gotchiStatus.value;
    });

    const svgs = computed(() => {
      if (!svgStatus.value.loaded) { return null; }
      const originalSvgs = props.previewWearables ? previewSvg : gotchiSvg;
      return originalSvgs?.value ? originalSvgs.value.map(svgText => namespaceSvgText(svgText, instanceNamespace.value)) : null;
    });

    watch(
      () => svgs.value,
      svgs => {
        if (svgs) {
          previousSvgs.value = svgs;
        }
      }
    );

    return {
      instanceNamespace,
      svgStatus,
      svgs,
      previousSvgs
    };
  }
};
</script>

<style scoped>
  .gotchi-images {
    position: relative;
  }

  .gotchi-image {
    width: 200px;
    height: 200px;
    max-width: 100%;
    max-height: 100%;
    image-rendering: crisp-edges;
  }

  .gotchi-images .gotchi-image:not(:first-child) {
    position: absolute;
    left: 0;
    top: 0;
  }


  @keyframes loading-pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }

  .gotchi-images--loading {
    filter: grayscale();
    animation-name: loading-pulse;
    animation-delay: 1s;
    animation-duration: 1.5s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }


  @keyframes spin {
    0% { opacity: 0; }
    75% { opacity: 1; }
  }

  .gotchi-images:not(.gotchi-images--spinning) .gotchi-image:not(:first-child) {
    display: none;
  }
  .gotchi-images--spinning .gotchi-image {
    animation-name: spin;
    animation-duration: 4s;
    animation-timing-function: step-end;
    animation-iteration-count: infinite;
  }
  .gotchi-images--spinning .gotchi-image:nth-child(1) {
    animation-delay: -3s;
  }
  .gotchi-images--spinning .gotchi-image:nth-child(2) {
    animation-delay: -2s;
  }
  .gotchi-images--spinning .gotchi-image:nth-child(3) {
    animation-delay: -1s;
  }
  .gotchi-images--spinning .gotchi-image:nth-child(4) {
    animation-delay: 0s;
  }

  .gotchi-images--floating .gotchi-image {
    animation-name: floating;
    animation-duration: 0.7s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
    animation-direction: alternate;
  }

  /* floating animation rules taken from aavegotchi site */
  .gotchi-images--floating :deep(svg) {
    animation-name:down;
    animation-duration:0.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-timing-function: steps(1);
  }

  .gotchi-images--floating :deep(.gotchi-shadow) {
    animation: up 0.5s infinite linear steps(2);
     animation-name:up;
     animation-duration:0.5s;
     animation-iteration-count: infinite;
     animation-timing-function: linear;
     animation-timing-function: steps(2);
  }

  .gotchi-images--floating :deep(.gotchi-wearable){
    animation-name:down;
    animation-duration:0.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-timing-function: steps(1);
  }

  .gotchi-images--floating :deep(.gotchi-handsDownClosed),
  .gotchi-images--floating :deep(.gotchi-handsUp),
  .gotchi-images--floating :deep(.gotchi-handsDownOpen),
  .gotchi-images--floating :deep(.gotchi-handsDownClosed),
  .gotchi-images--floating :deep(.gotchi-body),
  .gotchi-images--floating :deep(.gotchi-eyeColor),
  .gotchi-images--floating :deep(.gotchi-collateral),
  .gotchi-images--floating :deep(.gotchi-cheek),
  .gotchi-images--floating :deep(.gotchi-primary-mouth),
  .gotchi-images--floating :deep(.gotchi-wearable),
  .gotchi-images--floating :deep(.gotchi-sleeves)   {
     animation-name:down;
     animation-duration:0.5s;
     animation-iteration-count: infinite;
     animation-timing-function: linear;
     animation-timing-function: steps(2);
  }

  .gotchi-images--floating :deep(.wearable-hand) {
    animation-name:down !important;
    animation-duration:0.5s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
    animation-timing-function: steps(2);
  }

  .gotchi-images--floating :deep(.wearable-bg) {
    animation-name:none !important;
  }

  @keyframes up {
    from {
      transform: translate(0px, 0);
    }
   to {
      transform: translate(0px, -1px);
    }
  }

  @keyframes down {
   from {
     transform: translate(0px, 0);
      }
   to {
        transform: translate(0px, 1px);
      }
  }

  .gotchi-images--happy :deep(.gotchi-handsUp),
  .gotchi-images--happy :deep(.gotchi-sleeves-up),
  .gotchi-images--happy :deep(.gotchi-image:first-child .gotchi-eyeColor--CUSTOM-petting) {
    display: block;
  }
  .gotchi-images--happy :deep(.gotchi-handsDownClosed),
  .gotchi-images--happy :deep(.gotchi-handsDownOpen),
  .gotchi-images--happy :deep(.gotchi-sleeves-down),
  .gotchi-images--happy :deep(.gotchi-image:first-child .gotchi-eyeColor:not(.gotchi-eyeColor--CUSTOM-petting)) {
    display: none;
  }
  /* raise wearables higher - different amount on side views */
  .gotchi-images--happy :deep(.gotchi-wearable.wearable-hand) {
    transform: translate(0, -6px);
  }
  .gotchi-images--happy .gotchi-image:nth-child(2n) :deep(.gotchi-wearable.wearable-hand) {
    transform: translate(0, -10px);
  }

  .gotchi-images--hide-background :deep(.gotchi-bg),
  .gotchi-images--hide-background :deep(.wearable-bg) {
    display: none;
  }
</style>
