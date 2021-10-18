<template>
  <div
    v-if="gotchiDetails"
    class="gotchi-page"
  >
    <h1>The Waardrobe</h1>

    <div>
      <b>
        {{ gotchiDetails.name }}
        <span v-if="gotchiDetails.id">
          ({{ gotchiDetails.id }})
        </span>
      </b>
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

      <GotchiImage
        previewWearables
        withControls
      />
    </div>

    <br><br>
    <router-link :to="{ name: 'GotchiPage' }">
      Select another gotchi
    </router-link>
  </div>
</template>

<script>
import { ref, watchEffect } from 'vue';
import { useRouter } from 'vue-router'
import useGotchi from "@/data/useGotchi";

import wearableSlots from "@/data/wearableSlots";
import wearablesBySlot from "@/data/wearablesBySlot";

import GotchiImage from "./GotchiImage.vue";

export default {
  components: {
    GotchiImage
  },
  setup () {
    const { gotchiDetails, setPreviewWearables} = useGotchi();
    if (!gotchiDetails.value) {
      const router = useRouter();
      router.push({ name: "GotchiPage" });
    }

    // There are more wearable slots (16) than are currently used
    const formWearables = ref(gotchiDetails.value ? [...gotchiDetails.value.equippedWearables] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    watchEffect(() => {
      setPreviewWearables(formWearables.value);
    });

    return {
      gotchiDetails,
      wearableSlots,
      wearablesBySlot,
      formWearables
    };
  }
};
</script>


<style scoped>
  .wearables-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 50px;

    margin-top: 20px;
  }

  .wearable-selection {
    margin-bottom: 15px;
  }
</style>