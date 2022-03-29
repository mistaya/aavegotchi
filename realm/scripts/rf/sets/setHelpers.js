const { readJsonFile } = require('../../fileUtils.js')
const wearableSetsRf = require('./wearableSetsRf.js')

let wearables = null
let wearableSets = null
let ANNOTATED_WEARABLE_SETS = null
let wearablesById = null

const initData = async function () {
  wearables = await readJsonFile('../../src/data/wearables/wearables.json')
  wearableSets = await readJsonFile('../../src/data/wearables/wearableSets.json')
  ANNOTATED_WEARABLE_SETS = wearableSets.map(item => {
    const rarityScoreModifier = item.traitsBonuses[0] - 0
    const traitModifiers = item.traitsBonuses.slice(1).map(value => value - 0)
    let totalSetBonus = rarityScoreModifier
    for (const modifier of traitModifiers) {
      totalSetBonus += Math.abs(modifier)
    }
    return {
      id: item.id,
      name: item.name,
      wearableIds: item.wearableIds,
      rarityScoreModifier,
      traitModifiers,
      totalSetBonus
    }
  })

  wearablesById = Object.fromEntries(wearables.map(w => [w.id, { ...w, wearableSets: [] }]))

  for (let i = 0; i < ANNOTATED_WEARABLE_SETS.length; i++) {
    const wearableSet = ANNOTATED_WEARABLE_SETS[i]
    for (const wearableId of wearableSet.wearableIds) {
      const wearable = wearablesById[wearableId]
      if (wearable) {
        wearable.wearableSets.push(i)
      }
    }
  }
}

const calculateBaseRarityScore = function (traits) {
  let rarityScore = 0
  for (let trait of traits) {
    trait = trait - 0
    if (trait >= 50) {
      rarityScore += trait + 1
    } else {
      rarityScore += 100 - trait
    }
  }
  return rarityScore
}

const calculateTraitsWithWearables = function (originalTraits, wearables) {
  const newTraits = [...originalTraits].map(value => value - 0)
  let additionalBrs = 0
  for (const wearableId of wearables) {
    const wearable = wearablesById[wearableId]
    if (wearable && wearableId !== '0') {
      additionalBrs += wearable.rarityScoreModifier - 0
      for (let i = 0; i < wearable.traitModifiers.length; i++) {
        newTraits[i] += wearable.traitModifiers[i] - 0
      }
    }
  }
  return {
    newTraits,
    additionalBrs
  }
}

const chooseBestWearableSet = function (wearableSetIndices) {
  if (!wearableSetIndices?.length) { return null }
  const sortedSetIndices = [].concat(wearableSetIndices).sort((a, b) => {
    const setA = ANNOTATED_WEARABLE_SETS[a]
    const setB = ANNOTATED_WEARABLE_SETS[b]
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
  return ANNOTATED_WEARABLE_SETS[sortedSetIndices[0]]
}

const findWearableSetUsingBestApproach = function (wearables) {
  let possibleWearableSets = []
  for (const wearableId of wearables) {
    const wearable = wearablesById[wearableId]
    if (wearable && wearableId !== '0') {
      possibleWearableSets.push(...wearable.wearableSets)
    }
  }
  // reduce to unique set indexes
  possibleWearableSets = [...new Set(possibleWearableSets)]

  let bestWearableSet = null

  // check each set to see if it's satisfied
  const previewHasWearable = id => wearables.includes(id)
  const matchingWearableSets = possibleWearableSets.filter(
    setIndex => {
      const wearableIds = ANNOTATED_WEARABLE_SETS[setIndex].wearableIds
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
      return true
    }
  )
  // only one set can be applied
  bestWearableSet = chooseBestWearableSet(matchingWearableSets)
  return bestWearableSet
}

// Code from https://github.com/aavegotchi/aavegotchi-contracts/blob/master/scripts/raritySortHelpers.ts
const getRFWearableSets = function (equipped) {
  const setData = wearableSetsRf
  const foundSets = []

  const getEquipmentIds = (acc, value) => {
    if (Number(value) > 0) {
      acc.push(Number(value))
    }
    return acc
  }

  const equippedIds = equipped?.reduce(getEquipmentIds, [])

  for (const wearableSet of setData) {
    const setWearableIds = wearableSet.wearableIds.reduce(getEquipmentIds, [])
    if (
      setWearableIds.every((wearableId) =>
        equippedIds?.includes(wearableId)
      )
    ) {
      const setFound = {
        name: wearableSet.name,
        wearableIds: setWearableIds,
        traitsBonuses: wearableSet.traitsBonuses.map((v) => Number(v)),
        allowedCollaterals: wearableSet.allowedCollaterals.map((v) =>
          Number(v)
        )
      }

      foundSets.push(setFound)
    }
  }

  foundSets.sort(function (a, b) {
    return b.traitsBonuses[0] - a.traitsBonuses[0]
  })

  return foundSets
}

const findWearableSetUsingRFApproach = function (wearables) {
  let bestWearableSet = null
  const rfSetsSorted = getRFWearableSets(wearables)
  if (rfSetsSorted.length) {
    const bestOfficialSet = rfSetsSorted[0]
    bestWearableSet = {
      name: bestOfficialSet.name,
      rarityScoreModifier: bestOfficialSet.traitsBonuses[0],
      traitModifiers: bestOfficialSet.traitsBonuses.slice(1)
    }
    if (rfSetsSorted.find(set => ['Master Sushi Chef', 'Aagent ', 'Godlike Stani', 'Apex Stani', 'Godlike Sergey', 'Apex Sergey', 'OKex Jaay', 'OKex Jaay Hao'].includes(set.name))) {
      // console.log(rfSetsSorted)
    }
  }

  return bestWearableSet
}

const calculateBestTraitsWithSet = function (originalTraits, wearables, approach) {
  let bestWearableSet = null
  if (approach === 'best') {
    bestWearableSet = findWearableSetUsingBestApproach(wearables)
  } else if (approach === 'rf') {
    bestWearableSet = findWearableSetUsingRFApproach(wearables)
  } else {
    console.error('calculateBestTraitsWithSet needs an approach')
    return
  }

  let { newTraits, additionalBrs } = calculateTraitsWithWearables(originalTraits, wearables)

  if (bestWearableSet) {
    additionalBrs += bestWearableSet.rarityScoreModifier
    for (let i = 0; i < bestWearableSet.traitModifiers.length; i++) {
      newTraits[i] += bestWearableSet.traitModifiers[i]
    }
  }

  const newBrs = calculateBaseRarityScore(newTraits) + additionalBrs
  return {
    rarityScore: `${newBrs}`, // for consistency with the subgraph result, use a string
    numericTraits: newTraits,
    wearableSetName: bestWearableSet?.name || null
  }
}

module.exports = {
  init: initData,
  calculateBest: function (gotchi) {
    return calculateBestTraitsWithSet(gotchi.numericTraits, gotchi.equippedWearables, 'best')
  },
  calculateRF: function (gotchi) {
    return calculateBestTraitsWithSet(gotchi.numericTraits, gotchi.equippedWearables, 'rf')
  }
}
