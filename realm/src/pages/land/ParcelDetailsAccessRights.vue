<template>
  <div style="margin-top: 10px;">
    <div style="margin-bottom: 5px;">
      <span class="parcel-details__label">
        Channeling:
      </span>
      {{ parcel.accessRights.channeling.accessRightName }}
      <template v-if="parcel.accessRights.channeling.accessRightByName.whitelist">
        ({{ parcel.accessRights.channeling.whitelistId }})
      </template>
    </div>
    <div style="margin-bottom: 5px;">
      <span class="parcel-details__label">
        Reservoir Emptying:
      </span>
      {{ parcel.accessRights.reservoir.accessRightName }}
      <template v-if="parcel.accessRights.reservoir.accessRightByName.whitelist">
        ({{ parcel.accessRights.reservoir.whitelistId }})
      </template>
    </div>
  </div>
</template>

<script>

export default {
  props: {
    parcel: { type: Object, required: true }
  }
}
</script>

<style scoped>
  .parcel-details__label {
    margin-right: 5px;
    font-size: 0.9em;
    color: var(--site-text-color--subtle);
  }
</style>
