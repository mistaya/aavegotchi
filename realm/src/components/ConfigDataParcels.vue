<template>
  <section>
    <h2>Fetch parcels</h2>

    <form @submit="fetchParcels">
      <label>
        District:
        <select
          v-model="district"
          :readonly="status.loading"
        >
          <option
            v-for="num in 43"
            :key="num"
            :value="num"
          >
            {{ num }}
          </option>
        </select>
      </label>

      <div style="margin-top: 10px">
        <button
          type="submit"
          :disabled="!canSubmit"
        >
          Fetch
        </button>
        <span v-if="status.loading">
          loading...
        </span>
        <span v-if="status.error">
          Error: {{ status.errorMessage }}
        </span>
      </div>
    </form>

    <h3>All Parcel Data</h3>

    <textarea
      :value="parcelsJson"
      style="width: 100%; min-height: 100px;"
    />
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import useParcels from '@/data/useParcels'

const REALM_SUBGRAPH_URL = 'https://api.thegraph.com/subgraphs/name/aavegotchi/aavegotchi-realm-matic'
const FETCH_PAGE_SIZE = 1000

export default {
  setup () {
    const district = ref(1)
    const requestSkip = ref(0)
    const { status, setLoading } = useStatus()
    const { parcelsById, setParcels } = useParcels()
    const parcelsJson = computed(() => JSON.stringify(parcelsById.value, null, 4))

    const canSubmit = computed(() => district.value && !status.value.loading)
    const fetchParcels = function (evt) {
      evt.preventDefault()
      const [isStale, setLoaded, setError] = setLoading()
      requestSkip.value = 0

      const fetchParcelsFromSubgraph = function () {
        fetch(REALM_SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query: `{
              parcels(first: ${FETCH_PAGE_SIZE}, skip: ${requestSkip.value}, where: { district: "${district.value}" }) {
                id
                tokenId
                parcelHash
                coordinateX
                coordinateY
                district
                size,
                fudBoost,
                fomoBoost,
                alphaBoost,
                kekBoost
              }
            }`
          })
        })
          // .then(response => response.json())
          .then(async response => {
            if (isStale()) { console.log('Stale request, ignoring'); return }
            if (!response.ok) {
              setError('There was an error fetching parcels')
              return
            }
            const responseJson = await response.json()
            if (responseJson.data?.parcels) {
              setParcels(responseJson.data.parcels)
              if (responseJson.data.parcels.length < FETCH_PAGE_SIZE) {
                // finished fetching all pages
                setLoaded()
                return
              }
              // fetch the next page of results
              requestSkip.value += FETCH_PAGE_SIZE
              fetchParcelsFromSubgraph()
            } else {
              setError('Unexpected response')
            }
          })
          .catch(error => {
            console.error(error)
            setError('There was an error fetching parcels')
          })
      }

      fetchParcelsFromSubgraph()
    }

    return {
      district,
      canSubmit,
      fetchParcels,
      status,
      parcelsJson
    }
  }
}
</script>

<style scoped>
</style>
