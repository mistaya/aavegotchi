<template>
  <div>
    <h1>Gotchi channeling activity (temporary page)</h1>
    <div>
      <form
        style="margin-bottom: 10px;"
        @submit.prevent="submitGotchi"
      >
        <label style="font-weight: bold;">
          Gotchi ID:
          <input v-model="gotchiId" />
        </label>
        <SiteButton
          type="submit"
          style="margin-left: 10px;"
        >
          Find last channeled
        </SiteButton>
        <div style="margin-top: 10px">
          You can find your gotchi ID in its individual URL at
          <a href="https://app.aavegotchi.com/aavegotchis/">https://app.aavegotchi.com/aavegotchis/</a>
          , or through the
          <router-link :to="{ name: 'lending-manager' }">
            Lending Manager
          </router-link>
          on this site.
        </div>
      </form>
      <div v-if="gotchiStatus.loading">
        Loading...
      </div>
      <div v-if="gotchiStatus.error">
        Error fetching gotchi status
      </div>
      <div
        v-if="gotchiStatus.loaded"
        class="site-alertbox site-alertbox--info"
      >
        <div v-if="!lastChanneled">
          Couldn't find a last-channeled date for gotchi {{ gotchiIdFetched }}
        </div>
        <div v-else>
          Gotchi {{ gotchiIdFetched }} last channeled:
          <DatePrecise :date="lastChanneled" />
          (approx <DateFriendly :date="lastChanneled" />)
        </div>
      </div>
    </div>
    <div style="margin-top: 30px;">
      <form
        style="margin-bottom: 10px;"
        @submit.prevent="submitParcel"
      >
        <label style="font-weight: bold;">
          Parcel ID:
          <input v-model="parcelId" />
        </label>
        <SiteButton
          type="submit"
          style="margin-left: 10px;"
        >
          Find last channeled
        </SiteButton>
        <div style="margin-top: 10px">
          You can find your parcel IDs at
          <a href="https://app.aavegotchi.com/my-realm">
            https://app.aavegotchi.com/my-realm
          </a>
        </div>
      </form>
      <div v-if="parcelStatus.loading">
        Loading...
      </div>
      <div v-if="parcelStatus.error">
        Error fetching parcel status
      </div>
      <div
        v-if="parcelStatus.loaded"
        class="site-alertbox site-alertbox--info"
      >
        <div v-if="!parcelLastChanneled">
          Couldn't find a last-channeled date for parcel {{ parcelIdFetched }}
        </div>
        <div v-else>
          Parcel {{ parcelIdFetched }} last channeled:
          <DatePrecise :date="parcelLastChanneled" />
          (approx <DateFriendly :date="parcelLastChanneled" />)
        </div>
      </div>
    </div>
    <div
      class="site-alertbox site-alertbox--info"
      style="margin-top: 30px;"
    >
      <SiteIcon name="info" />
      <div>
        If you have a lot of gotchis or parcels to look up, Jarrod's WAGMI Warriors
        <a href="https://gotchilending.com/">
          https://gotchilending.com/
        </a>
        allows you to see all of them at once for an address.
        <br>See <a href="https://twitter.com/WagmiWarriors/status/1527490105627136000">what it looks like</a>.
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import useRealmContract from '@/data/useRealmContract'
import useStatus from '@/data/useStatus'
import DatePrecise from './DatePrecise.vue'
import DateFriendly from './DateFriendly.vue'

export default {
  components: {
    DatePrecise,
    DateFriendly
  },
  setup () {
    const { getLastChanneled, getParcelLastChanneled } = useRealmContract()
    const { status: gotchiStatus, setLoading: setGotchiLoading, reset: resetGotchi } = useStatus()
    const gotchiId = ref('')
    const gotchiIdFetched = ref('')
    const lastChanneled = ref(null)

    const submitGotchi = function () {
      if (!gotchiId.value) {
        resetGotchi()
        return
      }
      const [isStale, setLoaded, setError] = setGotchiLoading()
      gotchiIdFetched.value = gotchiId.value
      getLastChanneled(gotchiId.value).then(
        result => {
          if (isStale()) { return }
          lastChanneled.value = result ? new Date(result * 1000) : null
          setLoaded()
        },
        error => {
          if (isStale()) { return }
          console.error(error)
          setError(error.message)
        }
      )
    }

    const { status: parcelStatus, setLoading: setParcelLoading, reset: resetParcel } = useStatus()
    const parcelId = ref('')
    const parcelIdFetched = ref('')
    const parcelLastChanneled = ref(null)

    const submitParcel = function () {
      if (!parcelId.value) {
        resetParcel()
        return
      }
      const [isStale, setLoaded, setError] = setParcelLoading()
      parcelIdFetched.value = parcelId.value
      getParcelLastChanneled(parcelId.value).then(
        result => {
          if (isStale()) { return }
          parcelLastChanneled.value = result ? new Date(result * 1000) : null
          setLoaded()
        },
        error => {
          if (isStale()) { return }
          console.error(error)
          setError(error.message)
        }
      )
    }

    return {
      gotchiId,
      submitGotchi,
      gotchiIdFetched,
      gotchiStatus,
      lastChanneled,
      parcelId,
      submitParcel,
      parcelIdFetched,
      parcelStatus,
      parcelLastChanneled
    }
  }
}
</script>

<style scoped>
</style>
