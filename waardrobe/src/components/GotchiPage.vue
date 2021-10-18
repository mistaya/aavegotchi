<template>
  <div class="gotchi-page">
    <h1>Find your gotchi</h1>

    <form @submit.prevent="setGotchiId">
      <label>
        Gotchi ID:
        <input
          v-model="formGotchiId"
          type="text"
        />
      </label>

      <button type="submit">
        Find Gotchi
      </button>
    </form>

    <div
      v-if="gotchiId"
      style="margin-top: 30px;"
    >
      <div v-if="gotchiStatus.loading">
        Fetching gotchi details...
      </div>
      <div v-if="gotchiStatus.error">
        Error fetching gotchi details ({{ gotchiStatus.errorMessage }})
      </div>
      <div v-if="gotchiStatus.loaded">
        <h2>{{ gotchiDetails.name }}</h2>
        <div
          class="selected-gotchi"
          v-html="gotchiSvg"
        />
        <div class="enter">
          <router-link :to="{ name: 'WaardrobePage' }">
            Enter the Waardrobe
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import useGotchi from "@/data/useGotchi";

export default {
  setup () {
    const formGotchiId = ref(null);
    const { gotchiId, gotchiStatus, gotchiDetails, getNamespacedGotchiSvg } = useGotchi();

    const setGotchiId = () => {
      gotchiId.value = formGotchiId.value;
    };

    const gotchiSvg = computed(() => {
      if (!gotchiStatus.value.loaded) { return null; }
      return getNamespacedGotchiSvg("selected-gotchi")[0];
    });

    return {
      formGotchiId,
      gotchiId,
      setGotchiId,
      gotchiStatus,
      gotchiDetails,
      gotchiSvg
    };
  }
};
</script>

<style scoped>
  form {
    margin-top: 20px;
  }
  .selected-gotchi {
    width: 200px;
    height: 200px;
  }
  .enter {
    margin-top: 30px;
    font-size: 1.5em;
  }
</style>
