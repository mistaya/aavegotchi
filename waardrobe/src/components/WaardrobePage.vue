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

    <!-- TODO https://css-tricks.com/expandable-sections-within-a-css-grid/ -->
    <div class="wearables-preview">
      <div class="wearables-form">
        <label>
          Order wearables:
          <select v-model="order">
            <option value="rarityScoreChange">By Rarity, then BRS effectiveness</option>
            <option value="rarity">By Rarity, then alphabetical</option>
            <option value="scoreChange">By BRS effectiveness, then rarity</option>
          </select>
        </label>

        <div
          v-for="slot in wearableSlots"
          :key="slot.index"
          class="wearable-selection"
          style="margin-top: 20px;"
        >
          <label>
            {{ slot.label }}
            <select v-model.number="formWearables[slot.index]">
              <option value="0">
                -- Empty --
              </option>
              <template v-if="sortedWearablesBySlot[slot.index].groups">
                <optgroup
                  v-for="(wearables, groupLabel) in sortedWearablesBySlot[slot.index].groups"
                  :key="groupLabel"
                  :label="groupLabel"
                >
                  <WaardrobeWearableOption
                    v-for="wearable in wearables"
                    :key="wearable.id"
                    :wearable="wearable"
                    :isSelected="formWearables[slot.index] === wearable.id"
                  />
                </optgroup>
              </template>
              <template v-else>
                <WaardrobeWearableOption
                  v-for="wearable in sortedWearablesBySlot[slot.index]"
                  :key="wearable.id"
                  :wearable="wearable"
                  :isSelected="formWearables[slot.index] === wearable.id"
                />
              </template>
            </select>
          </label>
        </div>

        <hr style="margin-top: 20px; margin-bottom: 20px;" />

        <div>
          <label>
            Pick a whole set:
            <select
              :value="previewDetails.wearableSet ? previewDetails.wearableSet ?.id : -1"
              @input="onPickWearableSet($event.target.value - 0)"
            >
              <option value="-1">-- No Set --</option>
              <option
                v-for="set in wearableSets"
                :key="set.id"
                :value="set.id"
              >
                {{ set.name }}
                ({{ set.wearableRarities.map(rarity => rarity[0]).join('') }} +{{ set.bonus }})
                [{{ set.key }}]
              </option>
            </select>
          </label>
        </div>

        <div style="margin-top: 20px;">
          <button
            type="button"
            @click="formWearables = formWearables.map(() => 0)"
          >
            Remove all wearables
          </button>
        </div>
      </div>

      <div>
        <GotchiImage
          style="width: 200px; margin-bottom: 10px;"
          previewWearables
          :happy="previewHappy"
          :spinning="previewSpinning"
          downloadable
        />
        <label>
          <input
            type="checkbox"
            v-model="previewSpinning"
          />
          Spin
        </label>
        <label>
          <input
            type="checkbox"
            v-model="previewHappy"
          />
          Happy
        </label>
      </div>

      <div class="traits-preview">
        <div>
          <b>Base traits:</b>
          <div>
            BRS: {{ baseRarityScore }}
          </div>
          <div
            v-for="(trait, index) in traitsToDisplay"
            :key="index"
          >
            {{ trait }}: {{ gotchiDetails.numericTraits[index] }}
          </div>
        </div>
        <br>
        <div>
          <b>Preview traits:</b>
          <div>
            Set: {{ previewDetails.wearableSet ? previewDetails.wearableSet.name : "none" }}
          </div>
          <div>
            BRS: {{ previewDetails.baseRarityScore }}
          </div>
          <div
            v-for="(trait, index) in traitsToDisplay"
            :key="index"
          >
            {{ trait }}: {{ previewDetails.numericTraits[index] }}
          </div>
        </div>
      </div>
    </div>

    <br><br>
    <router-link :to="{ name: 'GotchiPage' }">
      Select another gotchi
    </router-link>
  </div>
</template>

<script>
import { ref, computed, watchEffect } from 'vue';
import { useRouter } from 'vue-router'
import orderBy from 'lodash.orderby'
import groupBy from 'lodash.groupby'
import useGotchi from "@/data/useGotchi";

import wearableSlots from "@/data/wearableSlots";
import wearablesBySlot from "@/data/wearablesBySlot";
import traits from "@/data/traits.json";
import WEARABLE_SETS from "@/data/wearableSets.json";

import GotchiImage from "./GotchiImage.vue";
import WaardrobeWearableOption from "./WaardrobeWearableOption.vue";

const RARITIES_BY_SCORE = {
  '1': 'Common',
  '2': 'Uncommon',
  '5': 'Rare',
  '10': 'Legendary',
  '20': 'Mythical',
  '50': 'Godlike'
}

const ANNOTATED_WEARABLES_BY_SLOT = {}
for (const slot in wearablesBySlot) {
  ANNOTATED_WEARABLES_BY_SLOT[slot] = wearablesBySlot[slot].map(wearable => ({
    ...wearable,
    rarity: RARITIES_BY_SCORE[wearable.rarityScoreModifier]
  }))
}

console.log({ ANNOTATED_WEARABLES_BY_SLOT })

export default {
  components: {
    GotchiImage,
    WaardrobeWearableOption
  },
  setup () {
    const {
      gotchiDetails,
      baseRarityScore,
      previewWearables,
      setPreviewWearables,
      previewDetails,
      calculateTraitsWithWearables
    } = useGotchi();
    if (!gotchiDetails.value) {
      const router = useRouter();
      router.push({ name: "GotchiPage" });
    }

    // There are more wearable slots (16) than are currently used
    const formWearables = ref(gotchiDetails.value ? [...gotchiDetails.value.equippedWearables] : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);

    watchEffect(() => {
      setPreviewWearables(formWearables.value);
    });

    const WEARABLES_BY_ID = Object.fromEntries(Object.values(ANNOTATED_WEARABLES_BY_SLOT).flat().map(w => [w.id, w]));

    const wearableSets = computed(() => {
      return orderBy(
        WEARABLE_SETS.map(set => {
          const wearableRarities = orderBy(
              set.wearableIds.map(wearableId => WEARABLES_BY_ID[wearableId]),
              'rarityScoreModifier'
            ).map(wearable => wearable.rarity || '');
          return {
            ...set,
            key: orderBy(set.wearableIds).join('-'),
            bonus: set.traitsBonuses.reduce((sum, bonus) => sum + Math.abs(bonus), 0),
            wearableRarities
          };
        }),
        ['name', 'bonus'],
        ['asc', 'asc']
      );
    });

    const onPickWearableSet = function(setId) {
      const set = wearableSets.value.find(set => set.id === setId);
      if (set) {
        const wearablesForSlots = [...formWearables.value]
        // prioritise equipping wearables that can only fit in one slot
        const wearableIds = orderBy(set.wearableIds, [id => {
          const wearable = WEARABLES_BY_ID[id];
          if (wearable) {
            return wearable.slotPositions.reduce((sum, position) => sum + (position === true ? 1 : 0), 0)
          }
          return 0;
        }], ['asc'])
        const equippedHandWearables = []
        for (const wearableId of wearableIds) {
          const wearable = WEARABLES_BY_ID[wearableId];
          if (wearable) {
            const slotIndex = wearable.slotPositions.indexOf(true);
            if (slotIndex !== -1) {
              // if a hand item from this set is already equipped, try the other slot if allowed
              if (slotIndex === 4 &&
                wearablesForSlots[slotIndex] &&
                wearablesForSlots[slotIndex] !== wearable.id &&
                wearableIds.includes(wearablesForSlots[slotIndex]) &&
                wearable.slotPositions[5]
              ) {
                wearablesForSlots[5] = wearable.id;
              } else {
                wearablesForSlots[slotIndex] = wearable.id;
              }
              if (slotIndex === 4 || slotIndex === 5) {
                equippedHandWearables.push(wearable.id)
              }
            }
          }
        }
        // edge case: check for 2 hand wearables that are the same (Gunslinger)
        // Above logic will have only equipped one slot, so force them here
        if (equippedHandWearables.length === 2 && equippedHandWearables[0] === equippedHandWearables[1]) {
          wearablesForSlots[4] = wearablesForSlots[5] = equippedHandWearables[0]
        }

        formWearables.value = wearablesForSlots;
      }
    }

    const previewSpinning = ref(false);
    const previewHappy = ref(false);

    const wearablesBySlotWithPreview = computed(() => {
      const currentPreviewBaseRarityScore = previewDetails.value.baseRarityScore
      const currentPreviewWearableSet = previewDetails.value.wearableSet
      const result = {}
      for (const slot in ANNOTATED_WEARABLES_BY_SLOT) {
        result[slot] = ANNOTATED_WEARABLES_BY_SLOT[slot].map(wearable => {
          const adjustedWearables = [].concat(previewWearables.value)
          adjustedWearables[slot] = wearable.id
          const previewWithWearable = calculateTraitsWithWearables(adjustedWearables)
          let setChangeType = 'none'
          let setChangeBonus = 0
          if (previewWithWearable.wearableSet) {
            if (!currentPreviewWearableSet) {
              setChangeType = 'gainSet'
              setChangeBonus = previewWithWearable.wearableSet.totalSetBonus
            } else if (currentPreviewWearableSet.id !== previewWithWearable.wearableSet.id) {
              setChangeType = 'replaceSet'
              setChangeBonus = previewWithWearable.wearableSet.totalSetBonus - currentPreviewWearableSet.totalSetBonus
            }
          } else {
            if (currentPreviewWearableSet) {
              setChangeType = 'loseSet'
              setChangeBonus = - currentPreviewWearableSet.totalSetBonus
            }
          }
          return {
            ...wearable,
            preview: {
              ...previewWithWearable,
              baseRarityScoreChange: previewWithWearable.baseRarityScore - currentPreviewBaseRarityScore,
              wearableSetChange: {
                type: setChangeType,
                setBonus: setChangeBonus,
                fromWearableSet: currentPreviewWearableSet
              }
            }
          }
        })
      }
      return result
    });

    const order = ref('rarityScoreChange'); // 'rarity' or 'scoreChange' or 'rarityScoreChange'

    const sortedWearablesBySlot = computed(() => {
      const result = {}
      for (const slot in wearablesBySlotWithPreview.value) {
        if (order.value === 'rarity' || order.value === 'rarityScoreChange') {
          // order by rarity (least rare first)
          result[slot] = orderBy(wearablesBySlotWithPreview.value[slot], ['rarityScoreModifier'], ['asc'])
          // group by rarity
          const groups = groupBy(result[slot], 'rarity')
          // order within each rarity group
          for (const groupKey in groups) {
            if (order.value === 'rarityScoreChange') {
              groups[groupKey] = orderBy(groups[groupKey], [wearable => wearable.preview.baseRarityScoreChange, 'name'], ['desc', 'asc'])
            } else {
              groups[groupKey] = orderBy(groups[groupKey], ['name'], ['asc'])
            }
          }
          // Edge case: background slot doesn't have rarities
          if (Object.keys(groups).length === 1 && Object.keys(groups)[0] === 'undefined') {
            result[slot] = groups['undefined']
          } else {
            result[slot] = { groups }
          }
        } else if (order.value === 'scoreChange') {
          // flat list ordered by score
          result[slot] = orderBy(wearablesBySlotWithPreview.value[slot], [wearable => wearable.preview.baseRarityScoreChange, 'rarityScoreModifier', 'name'], ['desc', 'asc', 'asc'])
        }
      }
      return result
    });

    return {
      gotchiDetails,
      baseRarityScore,
      wearableSlots,
      order,
      sortedWearablesBySlot,
      formWearables,
      wearableSets,
      onPickWearableSet,
      traitsToDisplay: traits.slice(0, 4),
      previewDetails,
      previewSpinning,
      previewHappy
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