import { WALLS } from './walls'

const SIZE_LABELS_BY_ID = ['humble', 'reasonable', 'spacious', 'spacious', 'partner']
const SIZE_WIDTHS_BY_ID = [8, 16, 32, 64, 64]
const SIZE_HEIGHTS_BY_ID = [8, 16, 64, 32, 64]

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

const annotateParcelDetails = function (parcel) {
  return {
    ...parcel,
    sizeLabel: SIZE_LABELS_BY_ID[parcel.size],
    width: SIZE_WIDTHS_BY_ID[parcel.size],
    height: SIZE_HEIGHTS_BY_ID[parcel.size],
    wall: getParcelWall(parcel),
    hasBoost: parcel.fudBoost !== '0' || parcel.fomoBoost !== '0' || parcel.alphaBoost !== '0' || parcel.kekBoost !== '0'
  }
}

export {
  annotateParcelDetails
}
