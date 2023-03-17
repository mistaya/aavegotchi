const { readJsonFile, writeTextFile, getDirectoryListing } = require('../../fileUtils.js')
const diamond = require('../diamond/diamond.js')

const gotchiHideDefaultBgSvg = `
    <style>
        .gotchi-bg { display: none }
    </style>
`
const hideDefaultBg = function (svgText) {
  // simple hack, assumes there is a <g class="gotchi-eyeColor" in the SVG
  // This might break in future
  const insertionPoint = '<g class="gotchi-eyeColor'
  return svgText.replace(insertionPoint, `${gotchiHideDefaultBgSvg}${insertionPoint}`)
}
const tweakSvg = function (svgText) {
  return hideDefaultBg(svgText)
}

const fetchGotchiImages = async function ({ fileName, folderName }) {
  const allGotchis = await readJsonFile(`${fileName}.json`)
  const existingFiles = await getDirectoryListing(folderName)

  // Don't want re-fetch images we already have
  const fetchedIds = []
  for (const file of existingFiles) {
    if (file.includes('.svg')) {
      fetchedIds.push(file.substring(0, file.indexOf('.svg')))
    }
  }
  const gotchisToFetch = allGotchis.filter(({ id }) => !fetchedIds.includes(id))
  console.log(`There are total ${allGotchis.length} to fetch.`)
  console.log(`There are ${fetchedIds.length} SVGs already downloaded, fetching remaining ${gotchisToFetch.length} gotchi images`)

  const writingFiles = []
  const BATCH_SIZE = 10

  for (let i = 0; i < gotchisToFetch.length; i += BATCH_SIZE) {
    const batchGotchis = gotchisToFetch.slice(i, i + BATCH_SIZE)
    console.log(`Fetching images for gotchis #${i} to ${i + BATCH_SIZE - 1}`)
    const batchGotchiParams = batchGotchis.map(gotchi => [
      gotchi.id,
      gotchi.hauntId,
      gotchi.collateral,
      gotchi.numericTraits,
      gotchi.equippedWearables
    ])
    const svgsByGotchiId = await diamond.getPreviewAavegotchisSideSvgs(batchGotchiParams)
    for (const gotchiId in svgsByGotchiId) {
      const svgs = svgsByGotchiId[gotchiId]
      const svgText = tweakSvg(svgs[0])
      const svgFilename = `${folderName}/${gotchiId}.svg`
      // console.log(`Writing svg to ${svgFilename}`)
      writingFiles.push(writeTextFile(svgFilename, svgText))
    }
  }
  await Promise.all(writingFiles)
  console.log(`Written svgs to ${folderName}`)
}

module.exports = fetchGotchiImages
