import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import { annotateParcelDetails } from './parcelUtils'

const { status: fetchStatus, setLoading } = useStatus()

const parcelsById = ref({})

const canSubmitFetch = computed(() => !(fetchStatus.value.loaded || fetchStatus.value.loading || fetchStatus.value.error))

const initParcels = function () {
  // initial fetch is of our cached parcels json
  // this only needs to be done once,
  // but it's safe to call this function many times.
  if (!canSubmitFetch.value) {
    return
  }
  const [isStale, setLoaded, setError] = setLoading()
  import(/* webpackChunkName: "assetParcels" */ '@/data/parcels/assetParcels.json')
    .then(({ default: json }) => {
      if (isStale()) { return }
      parcelsById.value = json
      setLoaded()
    })
    .catch((error) => {
      console.error(error)
      setError('Error loading parcels')
    })
}

const setParcels = function (parcels) {
  for (const parcel of parcels) {
    parcelsById.value[parcel.id] = annotateParcelDetails(parcel)
  }
}

export default function useParcels () {
  return {
    initParcels,
    canSubmitFetch,
    fetchStatus,
    parcelsById,
    setParcels
  }
}
