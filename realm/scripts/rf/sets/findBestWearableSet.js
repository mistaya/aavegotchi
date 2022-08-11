const getWearableSets = require('./getWearableSets.js')

const chooseBestWearableSet = function (wearableSetIndices, wearableSets) {
  if (!wearableSetIndices?.length) { return null }
  const sortedSetIndices = [].concat(wearableSetIndices).sort((a, b) => {
    const setA = wearableSets[a]
    const setB = wearableSets[b]
    if (setA.totalSetBonus === setB.totalSetBonus) {
      if (setA.name === setB.name) {
        return 0
      }
      // same total set bonus, different name.
      // pick the one with more wearables (Archer vs Elven Archer)
      if (setA.wearableIds.length === setB.wearableIds.length) {
        // same number of wearables: fall back to alphabetical name
        return setA.name < setB.name ? -1 : 1
      }
      return setA.wearableIds.length > setB.wearableIds.length ? -1 : 1
    }
    return setA.totalSetBonus > setB.totalSetBonus ? -1 : 1
  })
  return wearableSets[sortedSetIndices[0]]
}

const findWearableSetUsingBestApproach = function (equippedWearables, wearablesById, wearableSets) {
  let possibleWearableSets = []
  for (const wearableId of equippedWearables) {
    const wearable = wearablesById[wearableId]
    if (wearable && wearableId !== '0') {
      possibleWearableSets.push(...wearable.wearableSets)
    }
  }
  // reduce to unique set indexes
  possibleWearableSets = [...new Set(possibleWearableSets)]

  let bestWearableSet = null

  // check each set to see if it's satisfied
  const previewHasWearable = id => equippedWearables.includes(id)
  const matchingWearableSets = possibleWearableSets.filter(
    setIndex => {
      const wearableIds = wearableSets[setIndex].wearableIds
      const hasAllWearables = wearableIds.every(previewHasWearable)
      if (!hasAllWearables) {
        return false
      }
      // edge case: wearable set might require two of the same hand wearable (Gunslinger)
      /* // For now, ignore this edge case because none of the official code checks for it
      if (wearableIds.length > (new Set(wearableIds)).size) {
        const seenWearable = {}
        for (var wearableId of wearableIds) {
          if (seenWearable[wearableId]) {
            // check we have two of this wearable equipped
            const firstMatch = wearables.indexOf(wearableId) // we know there is at least one
            const secondMatch = wearables.slice(firstMatch + 1).indexOf(wearableId)
            if (secondMatch === -1) { return false }
          }
          seenWearable[wearableId] = true
        }
      }
      */
      // Apex sets have allowedCollaterals, but this is not currently checked for anywhere.
      // TODO In future if it's enabled, update this logic
      return true
    }
  )
  // only one set can be applied
  bestWearableSet = chooseBestWearableSet(matchingWearableSets, wearableSets)
  return bestWearableSet
}

module.exports = async function (wearableSetsDate, equippedWearables) {
  const { wearablesById, wearableSets } = await getWearableSets(wearableSetsDate)
  return findWearableSetUsingBestApproach(equippedWearables, wearablesById, wearableSets)
}
