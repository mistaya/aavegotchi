<template>
    <option
      :value="wearable.id"
    >
      <template v-if="wearable.rarity">
        ({{ wearable.rarity[0] }})
      </template>

      {{ wearable.name }}

      <template v-if="isSelected">
        [Selected]
      </template>
      <template v-else>
        ΔBRS
        {{ wearable.preview.baseRarityScoreChange > 0 ? '+' : '' }}{{ wearable.preview.baseRarityScoreChange }}
      </template>

      <template v-if="wearable.preview.wearableSetChange.type === 'gainSet'">
        +"{{ wearable.preview.wearableSet.name }}"
      </template>
      <template v-else-if="wearable.preview.wearableSetChange.type === 'loseSet'">
        -{{ wearable.preview.wearableSetChange.fromWearableSet.name }}
      </template>
      <template v-else-if="wearable.preview.wearableSetChange.type === 'replaceSet'">
        <template v-if="wearable.preview.wearableSetChange.fromWearableSet.name === wearable.preview.wearableSet.name">
          <template v-if="wearable.preview.baseRarityScoreChange >= 0">
            Upgrade
          </template>
          <template v-else>
            Downgrade
          </template>
          {{ wearable.preview.wearableSetChange.fromWearableSet.name }}
        </template>
        <template v-else>
          -{{ wearable.preview.wearableSetChange.fromWearableSet.name }}
          +{{ wearable.preview.wearableSet.name }}
        </template>
      </template>
    </option>
</template>

<script>

export default {
  props: {
    wearable: { type: Object, required: true },
    isSelected: { type: Boolean, default: false }
  }
}
</script>


<style scoped>
</style>