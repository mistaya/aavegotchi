<template>
  <div v-if="!parcelId">
    <form
      style="margin-top: 15px; margin-left: 15px; display: flex; flex-wrap: wrap; column-gap: 10px;"
      @submit.prevent="enterId"
    >
      <label>
        Parcel ID:
        <input
          v-model="inputId"
          type="text"
          style="width: 12ex"
        />
      </label>
      <SiteButton
        type="submit"
        :disabled="!inputId"
      >
        View Parcel
      </SiteButton>
    </form>
  </div>
  <ParcelDetailsFull
    v-else
    :key="parcelId"
    :parcelId="parcelId"
  />
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import ParcelDetailsFull from './ParcelDetailsFull.vue'

export default {
  components: {
    ParcelDetailsFull
  },
  props: {
    parcelId: { type: String, default: null }
  },
  setup (props) {
    const router = useRouter()

    const inputId = ref('')

    const enterId = () => {
      router.push({
        name: 'parcel',
        params: {
          parcelId: inputId.value
        }
      })
    }

    return {
      inputId,
      enterId
    }
  }
}
</script>

<style scoped>
</style>
