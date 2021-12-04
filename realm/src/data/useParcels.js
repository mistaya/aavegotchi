import { ref } from 'vue'
import initialParcels from './parcels.json'

const parcelsById = ref(initialParcels)

const setParcels = function (parcels) {
  for (const parcel of parcels) {
    parcelsById.value[parcel.id] = parcel
  }
}

export default function useParcels () {
  return {
    parcelsById,
    setParcels
  }
}
