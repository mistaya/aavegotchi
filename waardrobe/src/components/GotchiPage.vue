<template>
  <div class="gotchi-page">
    <h1>Choose your gotchi</h1>

    <div class="gotchi-choice-methods">
      <label>
        <input 
          v-model="choiceMethod"
          type="radio"
          name="choiceMethod"
          value="gotchiId"
        />
        Provide Gotchi ID
      </label>
      <label>
        <input
          v-model="choiceMethod"
          type="radio"
          name="choiceMethod"
          value="customGotchi"
        />
        Build a Gotchi
      </label>
    </div>

    <form
      v-if="choiceMethod === 'gotchiId'"
      class="gotchi-id-form"
      @submit.prevent="setGotchiId"
    >
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

      <div
        v-if="chosenGotchi"
        style="margin-top: 30px;"
      >
        <h2 v-if="gotchiStatus.loaded">
          {{ gotchiDetails.name }}
        </h2>
        <GotchiImage />
      </div>

    </form>


    <form
      v-if="choiceMethod === 'customGotchi'"
      class="custom-gotchi-form"
      @submit.prevent
    >

      <div class="custom-gotchi__details">
        <div class="custom-gotchi__haunt">
          <label>
            <input
              v-model="formCustomGotchi.hauntId"
              type="radio"
              value="1"
            />
              Haunt 1
          </label>
          <label>
            <input
              v-model="formCustomGotchi.hauntId"
              type="radio"
              value="2"
            />
              Haunt 2
          </label>
        </div>

        <div class="custom-gotchi__collateral">
          <label>
            Collateral
            <select
              v-model="formCustomGotchi.collateral"
            >
              <option
                v-for="collateral in collateralsByHaunt[formCustomGotchi.hauntId]"
                :key="collateral.id"
                :value="collateral.id"
              >
                {{ collateral.symbol }}
              </option>
            </select>
          </label>
        </div>

        <div class="custom-gotchi__traits">
          <template
            v-for="(trait, index) in traits"
            :key="trait"
          >
            <label :for="`custom-gotchi-trait__${trait}`">
              {{ trait }}
            </label>
            <div>
              <input
                :id="`custom-gotchi-trait__${trait}`"
                v-model="formCustomGotchi.numericTraits[index]"
                type="number"
                min="-1"
                max="100"
              />
            </div>
          </template>
        </div>
      </div>

      <div
        v-if="chosenGotchi"
        class="custom-gotchi__preview"
      >
        <h2>
          {{ gotchiDetails.name }}
        </h2>
        <GotchiImage />
      </div>

    </form>

    <div
      v-if="gotchiStatus.loaded"
      style="margin-top: 30px;"
    >
      <div class="enter">
        <router-link :to="{ name: prefersReducedMotion ? 'WaardrobePage' : 'WaardrobeEntrance' }">
          Enter the Waardrobe
        </router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import useGotchi from "@/data/useGotchi";
import collateralsByHaunt from "@/data/collateralsByHaunt.json";
import traits from "@/data/traits.json";
import GotchiImage from "./GotchiImage.vue";

const defaultCustomGotchi = {
  name: "Imaginary Friend",
  hauntId: "1",
  collateral: "0x20D3922b4a1A8560E1aC99FBA4faDe0c849e2142",
  numericTraits: [99, 99, 99, 99, 35, 50],
  equippedWearables: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
};

export default {
  components: {
    GotchiImage
  },
  setup () {
    const { gotchiId, customGotchi, gotchiStatus, gotchiDetails } = useGotchi();

    const choiceMethod = ref(customGotchi.value ? "customGotchi" : "gotchiId");
    const formGotchiId = ref(gotchiId.value || null);
    const formCustomGotchi = ref(customGotchi.value || { ...defaultCustomGotchi });

    const setGotchiId = () => {
      customGotchi.value = null;
      gotchiId.value = formGotchiId.value;
    };

    watch(
      () => choiceMethod.value,
      () => {
        if (choiceMethod.value === "gotchiId") {
          customGotchi.value = null;
          gotchiId.value = formGotchiId.value;
        } else if (choiceMethod.value === "customGotchi") {
          gotchiId.value = null;
          customGotchi.value = formCustomGotchi.value;
        }
      }
    );

    watch(
      () => formCustomGotchi.value?.hauntId,
      (hauntId, prevHauntId) => {
        if (hauntId !== prevHauntId) {
          formCustomGotchi.value.collateral = collateralsByHaunt[hauntId]?.[0].id || null;
        }
      }
    );

    const chosenGotchi = computed(() => {
      return gotchiId.value || customGotchi.value;
    });

    const motionMediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const prefersReducedMotion = motionMediaQuery.matches;

    return {
      prefersReducedMotion,
      choiceMethod,
      formGotchiId,
      setGotchiId,
      formCustomGotchi,
      collateralsByHaunt,
      traits,
      chosenGotchi,
      gotchiStatus,
      gotchiDetails
    };
  }
};
</script>

<style scoped>
  form {
    margin-top: 20px;
  }
  .enter {
    margin-top: 30px;
    font-size: 1.5em;
  }

  .gotchi-id-form input {
    width: 7em;
  }

  .custom-gotchi-form {
    display: flex;
    flex-wrap: wrap;
    gap: 50px;

    margin-top: 20px;
  }

  .custom-gotchi__details,
  .custom-gotchi__image {
    flex:  none;
  }

  .custom-gotchi__details {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .custom-gotchi__traits {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-gap: 10px;
  }
  .custom-gotchi__traits input {
    width: 5em;
  }

</style>
