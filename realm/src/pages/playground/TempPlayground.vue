<template>
  <div>
    <h1>Gotchi channeling activity (temporary page)</h1>
    <div style="margin-bottom: 20px;">
      You can now see all gotchi last-channeled dates on these pages:
      <ul>
        <li>
          <router-link :to="{ name: 'lending-available' }">
            Available Lendings
          </router-link>
        </li>
        <li>
          <router-link :to="{ name: 'lending-manager' }">
            Lending Manager
          </router-link>
          (your own gotchis, whether you're lending them out or not)
        </li>
        <li>
          <router-link :to="{ name: 'lending-borrower' }">
            Borrower
          </router-link>
          (gotchis you have borrowed)
        </li>
        <li>
          <router-link :to="{ name: 'lending-activity' }">
            Lending Activity
          </router-link>
        </li>
      </ul>

      For lands, use these pages:
      <ul>
        <li>
          <router-link :to="{ name: 'parcel' }">
            Citaadel - Parcel
          </router-link>:
          see the altar-channeling status and last-emptied-reservoirs time for a specific parcel by ID.
        </li>
        <li>
          <router-link :to="{ name: 'lending-lands' }">
            Lending - Land Owner
          </router-link>: see altar-channeling status for all lands owned by an address.
        </li>
      </ul>
    </div>

    <hr>

    <details>
      <summary>Old channeling lookups</summary>

      <div style="margin-top: 10px;">
        <div class="site-alertbox site-alertbox--warning">
        I'm about to remove these, so if you need them for some reason that can't be solved by the links above, you can contact me on Discord (eitri).
        </div>
      </div>

      <div style="margin-top: 20px;">
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
            <a href="https://app.aavegotchi.com/aavegotchis/">https://app.aavegotchi.com/aavegotchis/</a>.
          </div>
          <div>
            Note: I will be removing this lookup soon, because the main lending pages on this site now support it.
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
          <div>
            Note: I will be removing this lookup soon, because this information is included on the
            <router-link :to="{ name: 'parcel' }">
              Citaadel - Parcel
            </router-link>
            and
            <router-link :to="{ name: 'lending-lands' }">
              Lending - Land Owner
            </router-link>
            pages.
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
    </details>
  </div>
</template>

<script>
import { ref } from 'vue'
import useRealmContract from '@/data/useRealmContract'
import useStatus from '@/data/useStatus'
import DatePrecise from '@/common/DatePrecise.vue'
import DateFriendly from '@/common/DateFriendly.vue'

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
      window.trackEvent('lookup-gotchi-last-channeled')
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
      window.trackEvent('lookup-parcel-last-channeled')
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
