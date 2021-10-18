<template>
  <div
    v-if="gotchiId"
    class="gotchi-page"
  >
    <h1>The Waardrobe</h1>

    <div>
      <b>{{ gotchiDetails.name }} ({{ gotchiId }})</b>
      <!--
      <div
        class="onchain-gotchi"
        v-html="onchainGotchiSvg"
      />
      -->
    </div>

    <div class="wearables-preview">
      <div class="wearables-form">
        <div
          v-for="slot in wearableSlots"
          :key="slot.index"
          class="wearable-selection"
        >
          <label>
            {{ slot.label }}
            <select v-model="formWearables[slot.index]">
              <option value="0">
                -- Empty --
              </option>
              <option
                v-for="wearable in wearablesBySlot[slot.index]"
                :key="wearable.id"
                :value="wearable.id"
              >
                {{ wearable.name }}
              </option>
            </select>
          </label>
        </div>
      </div>

      <div class="preview-image">
        <div v-if="previewSvgStatus.loading">
          <div
            v-if="previousPreviewSvgs"
            class="preview-gotchi preview-gotchi--loading"
            v-html="previousPreviewSvgs[0]"
          />
          <template v-else>
            Loading...
          </template>
        </div>
        <div v-if="previewSvgStatus.error">
          Error getting preview image ({{ previewSvgStatus.errorMessage }})
        </div>
        <div
          v-if="previewSvgStatus.loaded"
          class="preview-gotchi-sides"
          :class="{
            'preview-gotchi-sides--spinning': spinPreview,
            'preview-gotchi-sides--happy': happyPreview
          }"
        >
          <div
            v-for="(svg, svgIndex) in previewSvgs"
            :key="svgIndex"
            class="preview-gotchi"
            v-html="svg"
          />
        </div>
        <label>
          <input
            type="checkbox"
            v-model="spinPreview"
          />
          Spin
        </label>
        <label>
          <input
            type="checkbox"
            v-model="happyPreview"
          />
          Happy
        </label>
      </div>
    </div>

    <br><br>
    <router-link :to="{ name: 'GotchiPage' }">
      Select another gotchi
    </router-link>
  </div>
</template>

<script>
import { ref, computed, watch, watchEffect } from 'vue';
import { useRouter } from 'vue-router'
import useGotchi from "@/data/useGotchi";

import wearableSlots from "@/data/wearableSlots";
import wearablesBySlot from "@/data/wearablesBySlot";

export default {
  setup () {
    const { gotchiId, gotchiStatus, gotchiDetails, getNamespacedGotchiSvg, setPreviewWearables, previewSvgStatus, getNamespacedPreviewSvg } = useGotchi();
    if (!gotchiId.value) {
      const router = useRouter();
      router.push({ name: "GotchiPage" });
    }

    const onchainGotchiSvg = computed(() => {
      if (!gotchiStatus.value.loaded) { return null; }
      return getNamespacedGotchiSvg("onchain-gotchi")[0];
    });

    // There are more wearable slots (16) than are currently used
    const formWearables = ref(gotchiDetails.value ? [...gotchiDetails.value.equippedWearables] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    watchEffect(() => {
      setPreviewWearables(formWearables.value);
    });

    const previewSvgs = computed(() => {
      if (!previewSvgStatus.value.loaded) { return null; }
      return getNamespacedPreviewSvg("preview-gotchi");
    });

    const previousPreviewSvgs = ref(null);

    watch(
      () => previewSvgs.value,
      () => {
        if (previewSvgs.value) {
          previousPreviewSvgs.value = previewSvgs.value;
        }
      }
    );

    const spinPreview = ref(false);
    const happyPreview = ref(false);

    return {
      gotchiId,
      gotchiDetails,
      onchainGotchiSvg,
      wearableSlots,
      wearablesBySlot,
      formWearables,
      previewSvgStatus,
      previewSvgs,
      previousPreviewSvgs,
      spinPreview,
      happyPreview
    };
  }
};
</script>


<style scoped>
  .onchain-gotchi {
    width: 200px;
    height: 200px;
  }

  .wearables-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 50px;

    margin-top: 20px;
  }

  .wearable-selection {
    margin-bottom: 15px;
  }

  .preview-gotchi {
    width: 200px;
    height: 200px;
  }

  .preview-gotchi--loading {
    filter: grayscale();
    animation-name: loading-pulse;
    animation-delay: 1s;
    animation-duration: 1.5s;
    animation-timing-function: ease-in-out;
    animation-iteration-count: infinite;
  }

  .preview-gotchi-sides {
    position: relative;
  }
  .preview-gotchi-sides .preview-gotchi:not(:first-child) {
    position: absolute;
    left: 0;
    top: 0;
  }
  .preview-gotchi-sides:not(.preview-gotchi-sides--spinning) .preview-gotchi:not(:first-child) {
    display: none;
  }
  .preview-gotchi-sides--spinning .preview-gotchi {
    animation-name: spin;
    animation-duration: 4s;
    animation-timing-function: step-end;
    animation-iteration-count: infinite;
  }
  .preview-gotchi-sides--spinning .preview-gotchi:nth-child(1) {
    animation-delay: -3s;
  }
  .preview-gotchi-sides--spinning .preview-gotchi:nth-child(2) {
    animation-delay: -2s;
  }
  .preview-gotchi-sides--spinning .preview-gotchi:nth-child(3) {
    animation-delay: -1s;
  }
  .preview-gotchi-sides--spinning .preview-gotchi:nth-child(4) {
    animation-delay: 0s;
  }

  @keyframes spin {
    0% { opacity: 0; }
    75% { opacity: 1; }
  }

  @keyframes loading-pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }

  .preview-gotchi-sides--happy :deep .gotchi-handsUp,
  .preview-gotchi-sides--happy :deep .gotchi-sleeves-up,
  .preview-gotchi-sides--happy :deep .preview-gotchi:first-child .gotchi-eyeColor--CUSTOM-petting {
    display:  block;
  }
  .preview-gotchi-sides--happy :deep .gotchi-handsDownClosed,
  .preview-gotchi-sides--happy :deep .gotchi-handsDownOpen,
  .preview-gotchi-sides--happy :deep .gotchi-sleeves-down,
  .preview-gotchi-sides--happy :deep .preview-gotchi:first-child .gotchi-eyeColor:not(.gotchi-eyeColor--CUSTOM-petting) {
    display:  none;
  }
  /* raise wearables higher - different amount on side views */
  .preview-gotchi-sides--happy :deep .gotchi-wearable.wearable-hand {
    transform: translate(0, -6px);
  }
  .preview-gotchi-sides--happy .preview-gotchi:nth-child(2n) :deep .gotchi-wearable.wearable-hand {
    transform: translate(0, -10px);
  }
</style>