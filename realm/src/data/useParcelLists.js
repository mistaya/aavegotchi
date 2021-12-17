import { ref } from 'vue'
import useStatus from '@/data/useStatus'

const parcelListsById = ref({})

const { status: fetchStatus, setLoading } = useStatus()
const [isStale, setLoaded, setError] = setLoading()
import(
  /* webpackChunkName: "parcellistsjson" */
  './parcels/parcelLists.json'
).then(({ default: json }) => {
  if (isStale()) { return }
  parcelListsById.value = json
  setLoaded()
}).catch(error => {
  console.error(error)
  setError('Error loading parcel lists')
})

const addNewParcelList = function ({ id, label }) {
  parcelListsById.value[id] = {
    label,
    parcels: []
  }
}

export default function useParcelLists () {
  return {
    fetchStatus,
    parcelListsById,
    addNewParcelList
  }
}
