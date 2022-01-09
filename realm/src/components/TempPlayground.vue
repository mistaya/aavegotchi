<template>
  <div>
    <h1>Temporary Playground</h1>
    <div>
      <p>How many addresses own land vs gotchis?</p>

      <div>
        Data needed:
        <div style="margin-left: 20px;">
          <DataFetcherGotchis />
          <DataFetcherParcelOwners />
        </div>
      </div>

      <div style="margin-top: 20px">
        Parcel owners: {{ parcelOwners.length }}
        <br>
        <textarea :value="parcelOwners.join('\n')" />
        <br>
        <br>
        Gotchi owners: {{ gotchiOwners.length }}
        <br>
        <textarea :value="gotchiOwners.join('\n')" />
        <br>
        <br>
        Owners that have both Parcel + Gotchi:  {{ bothOwners.length }}
        <br>
        <textarea :value="bothOwners.join('\n')" />
        <br>
        <br>
        All owners:  {{ allOwners.length }}
        <br>
        <textarea :value="allOwners.join('\n')" />
        <br>
        <br>
        Only-parcel owners:  {{ parcelOwners.length - bothOwners.length }}
        <br>
        Only-gotchi owners:  {{ gotchiOwners.length - bothOwners.length }}
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import useGotchis from '@/data/useGotchis'
import useParcelOwners from '@/data/useParcelOwners'
import DataFetcherGotchis from './DataFetcherGotchis.vue'
import DataFetcherParcelOwners from './DataFetcherParcelOwners.vue'

export default {
  components: {
    DataFetcherGotchis,
    DataFetcherParcelOwners
  },
  setup () {
    const {
      ownersByParcelId,
      fetchStatus: ownersFetchStatus,
      fetchOwners
    } = useParcelOwners()
    if (!ownersFetchStatus.value.loaded && !ownersFetchStatus.value.loading) {
      fetchOwners()
    }

    const {
      gotchis,
      fetchStatus: gotchisFetchStatus
    } = useGotchis()

    const parcelOwners = computed(() => {
      if (!ownersFetchStatus.value.loaded) { return [] }
      return [...new Set(Object.values(ownersByParcelId.value).map(o => o.toLowerCase()))]
    })

    const gotchiOwners = computed(() => {
      if (!gotchisFetchStatus.value.loaded) { return [] }
      return [...new Set(gotchis.value.map(g => g.owner.id.toLowerCase()))]
    })

    const bothOwners = computed(() => {
      if (!ownersFetchStatus.value.loaded || !gotchisFetchStatus.value.loaded) { return [] }
      return parcelOwners.value.filter(owner => gotchiOwners.value.includes(owner))
    })

    const allOwners = computed(() => {
      if (!ownersFetchStatus.value.loaded || !gotchisFetchStatus.value.loaded) { return [] }
      return [...new Set(parcelOwners.value.concat(gotchiOwners.value))]
    })

    return {
      parcelOwners,
      gotchiOwners,
      bothOwners,
      allOwners
    }
  }
}
</script>

<style scoped>
  textarea {
    width: 48ex;
    height: 50px;
  }
</style>
