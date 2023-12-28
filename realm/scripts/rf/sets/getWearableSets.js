const { readJsonFile } = require('../../fileUtils.js')

// eslint-disable-next-line camelcase
const wearableSets2021_01_03 = require('./wearableSets2021-01-03-extended.js')
// eslint-disable-next-line camelcase
const wearableSets2021_05_15 = require('./wearableSets2021-05-15.js')
// eslint-disable-next-line camelcase
const wearableSets2021_11_06 = require('./wearableSets2021-11-06.js')
// eslint-disable-next-line camelcase
const wearableSets2022_03_11 = require('./wearableSets2022-03-11.js')
// eslint-disable-next-line camelcase
const wearableSets2022_08_03 = require('./wearableSets2022-08-03.js')
// eslint-disable-next-line camelcase
const wearableSets2023_03_01 = require('./wearableSets2023-03-01.js')
// eslint-disable-next-line camelcase
const wearableSets2023_12_27 = require('./wearableSets2023-12-27.js')

const wearableSetsByDate = {
  '2021-01-03': wearableSets2021_01_03,
  '2021-05-15': wearableSets2021_05_15,
  '2021-11-06': wearableSets2021_11_06,
  '2022-03-11': wearableSets2022_03_11,
  '2022-08-03': wearableSets2022_08_03,
  '2023-03-01': wearableSets2023_03_01,
  '2023-12-27': wearableSets2023_12_27
}

module.exports = async function (wearableSetsDate) {
  const wearableSets = wearableSetsByDate[wearableSetsDate]
  if (!wearableSets) {
    console.error('Please specify a valid date for wearable sets', Object.keys(wearableSetsByDate))
    return
  }
  // This assumes the wearables data hasn't changed over time. Might not be true.
  const wearables = await readJsonFile('../../src/data/wearables/wearables.json')
  const annotatedWearableSets = wearableSets.map(item => {
    const rarityScoreModifier = item.traitsBonuses[0] - 0
    const traitModifiers = item.traitsBonuses.slice(1).map(value => value - 0)
    let totalSetBonus = rarityScoreModifier
    for (const modifier of traitModifiers) {
      totalSetBonus += Math.abs(modifier)
    }
    return {
      id: item.id,
      name: item.name.trim(),
      wearableIds: item.wearableIds,
      rarityScoreModifier,
      traitModifiers,
      totalSetBonus,
      original: item
    }
  })

  const wearablesById = Object.fromEntries(wearables.map(w => [w.id, { ...w, wearableSets: [] }]))

  for (let i = 0; i < annotatedWearableSets.length; i++) {
    const wearableSet = annotatedWearableSets[i]
    for (const wearableId of wearableSet.wearableIds) {
      const wearable = wearablesById[wearableId]
      if (wearable) {
        wearable.wearableSets.push(i)
      }
    }
  }

  return {
    wearables,
    wearablesById,
    wearableSets: annotatedWearableSets
  }
}
