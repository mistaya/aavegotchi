<template>
  <section
    class="site-card"
    style="margin: 15px; padding: 0px 15px 10px 15px"
  >
    <h2 style="margin-bottom: 10px">Parcel data</h2>

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
        <SiteButton
          type="submit"
          :disabled="!canSubmit"
        >
          Fetch
        </SiteButton>
        <span v-if="status.loading">
          loading...
        </span>
        <span v-if="status.error">
          Error: {{ status.errorMessage }}
        </span>
      </div>
    </form>

    <h3>All Parcel Data</h3>

    <div style="margin-bottom: 10px;">
      <SiteButton
        type="button"
        :aria-pressed="`${showParcelsJson}`"
        @click="showParcelsJson = !showParcelsJson"
      >
        {{ showParcelsJson ? 'Hide' : 'Show' }}
        JSON
      </SiteButton>
    </div>
    <textarea
      v-if="showParcelsJson"
      :value="parcelsJson"
      style="width: 100%; min-height: 100px;"
    />

    <div style="margin-top: 10px">
      Fetched:
      <div style="columns: 4">
        <div
          v-for="num in 43"
          :key="num"
        >
          D{{ num }}: {{ parcelsByDistrict[num]?.length }}
        </div>
      </div>
    </div>
  </section>
</template>

<script>
import { ref, computed } from 'vue'
import apis from '@/data/apis'
import useStatus from '@/data/useStatus'
import useParcels from '@/data/useParcels'
import groupBy from 'lodash.groupby'

const SUBGRAPH_URL = apis.CORE_MATIC_SUBGRAPH
const FETCH_PAGE_SIZE = 1000

export default {
  setup () {
    const district = ref(1)
    const requestSkip = ref(0)
    const { status, setLoading } = useStatus()
    const { parcelsById, setParcels } = useParcels()
    const showParcelsJson = ref(false)
    const parcelsJson = computed(() => JSON.stringify(parcelsById.value, null, 4))
    const parcelsByDistrict = computed(() => groupBy(Object.values(parcelsById.value), parcel => parcel.district))

    const canSubmit = computed(() => district.value && !status.value.loading)
    const fetchParcels = function (evt) {
      evt.preventDefault()
      const [isStale, setLoaded, setError] = setLoading()
      requestSkip.value = 0

      const fetchParcelsFromSubgraph = function () {
        fetch(SUBGRAPH_URL, {
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
                size
                fudBoost
                fomoBoost
                alphaBoost
                kekBoost
              }
            }`
          })
        })
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
      showParcelsJson,
      parcelsJson,
      parcelsByDistrict
    }
  }
}
</script>

<style scoped>
</style>
