import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import { WALLS } from './walls'
import parcelsUrl from './parcels/assetParcels.json'

const SIZE_LABELS_BY_ID = ['humble', 'reasonable', 'spacious', 'spacious']
const SIZE_WIDTHS_BY_ID = [8, 16, 32, 64]
const SIZE_HEIGHTS_BY_ID = [8, 16, 64, 32]

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
  fetch(parcelsUrl)
    .then(response => response.json())
    .then(json => {
      if (isStale()) { return }
      parcelsById.value = json
      setLoaded()
    }).catch(error => {
      console.error(error)
      setError('Error loading parcels')
    })
}

const getParcelWall = function (parcel) {
  const parcelX = parcel.coordinateX - 0
  const parcelY = parcel.coordinateY - 0
  for (const wallEntry of WALLS) {
    if (
      // parcel is inside this wall's outerBounds
      (
        (parcelX > wallEntry.outerBounds.minX && parcelX < wallEntry.outerBounds.maxX) &&
        (parcelY > wallEntry.outerBounds.minY && parcelY < wallEntry.outerBounds.maxY)
      ) &&
      // parcel is not inside this wall's innerBounds, if specified
      (
        !wallEntry.innerBounds ||
        !(
          (parcelX > wallEntry.innerBounds.minX && parcelX < wallEntry.innerBounds.maxX) &&
          (parcelY > wallEntry.innerBounds.minY && parcelY < wallEntry.innerBounds.maxY)
        )
      )
    ) {
      return wallEntry.id
    }
  }
  return null
}

const setParcels = function (parcels) {
  for (const parcel of parcels) {
    parcelsById.value[parcel.id] = {
      ...parcel,
      sizeLabel: SIZE_LABELS_BY_ID[parcel.size],
      width: SIZE_WIDTHS_BY_ID[parcel.size],
      height: SIZE_HEIGHTS_BY_ID[parcel.size],
      wall: getParcelWall(parcel),
      hasBoost: parcel.fudBoost !== '0' || parcel.fomoBoost !== '0' || parcel.alphaBoost !== '0' || parcel.kekBoost !== '0'
    }
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
