const getWearableSets = require('./getWearableSets.js')
const findBestWearableSet = require('./findBestWearableSet.js')

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

const calculateTraitsWithWearables = function (originalTraits, equippedWearables, wearablesById) {
  const newTraits = [...originalTraits].map(value => value - 0)
  let additionalBrs = 0
  for (const wearableId of equippedWearables) {
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

// Code from https://github.com/aavegotchi/aavegotchi-contracts/blob/master/scripts/raritySortHelpers.ts
const getRFWearableSets = function (originalWearableSets, equippedWearables) {
  const foundSets = []

  const getEquipmentIds = (acc, value) => {
    if (Number(value) > 0) {
      acc.push(Number(value))
    }
    return acc
  }

  const equippedIds = equippedWearables?.reduce(getEquipmentIds, [])

  for (const wearableSet of originalWearableSets) {
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

const findWearableSetUsingRFApproach = async function (wearableSetsDate, equippedWearables) {
  const { wearableSets } = await getWearableSets(wearableSetsDate)
  const originalWearableSets = wearableSets.map(set => set.original)
  let bestWearableSet = null
  const rfSetsSorted = getRFWearableSets(originalWearableSets, equippedWearables)
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

const calculateBestTraitsWithSet = async function (wearableSetsDate, originalTraits, equippedWearables, approach) {
  let bestWearableSet = null
  if (approach === 'best') {
    bestWearableSet = await findBestWearableSet(wearableSetsDate, equippedWearables)
  } else if (approach === 'js1') {
    bestWearableSet = await findWearableSetUsingRFApproach(wearableSetsDate, equippedWearables)
  } else {
    console.error('calculateBestTraitsWithSet needs an approach')
    return
  }

  const { wearablesById } = await getWearableSets(wearableSetsDate)
  let { newTraits, additionalBrs } = calculateTraitsWithWearables(originalTraits, equippedWearables, wearablesById)

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
  calculateBest: async function (wearableSetsDate, gotchi) {
    return calculateBestTraitsWithSet(wearableSetsDate, gotchi.numericTraits, gotchi.equippedWearables, 'best')
  },
  calculateJS1: async function (wearableSetsDate, gotchi) {
    return calculateBestTraitsWithSet(wearableSetsDate, gotchi.numericTraits, gotchi.equippedWearables, 'js1')
  }
}
