const getBaazaarParcelUrl = function ({ listingId, network }) {
  return `https://${network === 'polygon' ? 'polygon' : 'dapp'}.aavegotchi.com/baazaar/parcels?id=${encodeURIComponent(listingId)}`
}
const getGBMParcelUrl = function ({ listingId, network, isFinished }) {
  const isPolygon = network === 'polygon'
  const subdomain = isPolygon ? 'polygon' : 'dapp'
  const chainId = isPolygon ? '137' : '8453'
  if (isFinished) {
    return `https://${subdomain}.aavegotchi.com/activity?p=auction&itemType=parcels&id=${encodeURIComponent(listingId)}&chainId=${chainId}`
  }
  return `https://${subdomain}.aavegotchi.com/auction?status=live&itemType=parcels&id=${encodeURIComponent(listingId)}&chainId=${chainId}`
}

const getGotchiUrl = function({ network, gotchiId, ownerAddress }) {
  const isPolygon = network === 'polygon'
  if (isPolygon) {
    return `https://app.aavegotchi.com/gotchi/${encodeURIComponent(gotchiId)}`
  }
  return `https://dapp.aavegotchi.com/u/${encodeURIComponent(ownerAddress)}/inventory?itemType=aavegotchis&chainId=8453&id=${encodeURIComponent(gotchiId)}`
}

const getOwnersGotchisUrl = function({ network, ownerAddress }) {
  const isPolygon = network === 'polygon'
  const subdomain = isPolygon ? 'polygon' : 'dapp'
  return `https://${subdomain}.aavegotchi.com/u/${encodeURIComponent(ownerAddress)}/inventory?itemType=aavegotchis`
}

const getLendingsUrl = function({ network }) {
  const isPolygon = network === 'polygon'
  const subdomain = isPolygon ? 'polygon' : 'dapp'
  return `https://${subdomain}.aavegotchi.com/lending/aavegotchis`
}

const getLendingListingUrl = function({ network, listingId }) {
  const isPolygon = network === 'polygon'
  if (isPolygon) {
    return `https://app.aavegotchi.com/lending/${encodeURIComponent(listingId)}`
  }
  return `https://dapp.aavegotchi.com/lending/aavegotchis?id=${encodeURIComponent(listingId)}`
}

export {
  getBaazaarParcelUrl,
  getGBMParcelUrl,
  getGotchiUrl,
  getOwnersGotchisUrl,
  getLendingsUrl,
  getLendingListingUrl
}
