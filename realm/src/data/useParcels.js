import { ref } from 'vue'
import initialParcels from './parcels.json'

const SIZE_LABELS_BY_ID = ['humble', 'reasonable', 'spacious', 'spacious']
const SIZE_WIDTHS_BY_ID = [8, 16, 32, 64]
const SIZE_HEIGHTS_BY_ID = [8, 16, 64, 32]

const WALL_INNER = {
  id: 'inner',
  innerBounds: null,
  outerBounds: {
    minX: 3875,
    maxX: 5650,
    minY: 2400,
    maxY: 3900
  }
}
const WALL_MIDDLE = {
  id: 'middle',
  innerBounds: WALL_INNER.outerBounds,
  outerBounds: {
    minX: 2430,
    maxX: 7100,
    minY: 1500,
    maxY: 4800
  }
}
const WALL_OUTER = {
  id: 'outer',
  innerBounds: WALL_MIDDLE.outerBounds,
  outerBounds: {
    minX: 0,
    maxX: 9000,
    minY: 0,
    maxY: 6000
  }
}
const WALLS = [
  WALL_INNER,
  WALL_MIDDLE,
  WALL_OUTER
]

const ALCHEMICA_TYPES = ['fud', 'fomo', 'alpha', 'kek']

const parcelsById = ref(initialParcels)

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
    parcelsById,
    setParcels,
    WALLS,
    ALCHEMICA_TYPES
  }
}
