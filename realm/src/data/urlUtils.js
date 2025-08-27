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

export {
  getBaazaarParcelUrl,
  getGBMParcelUrl
}
