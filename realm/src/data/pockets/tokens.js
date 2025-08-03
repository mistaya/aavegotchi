import tokensList from './tokensList.json'
import collateralsList from './collateralsList.json'

const polygonTokens = []
const baseTokens = []

for (const token of tokensList) {
  if (token.polygonAddress) {
    polygonTokens.push({
      ...token,
      id: token.polygonAddress
    })
  }
  if (token.baseAddress) {
    baseTokens.push({
      ...token,
      id: token.baseAddress
    })
  }
}

export default {
  polygon: {
    tokens: polygonTokens,
    tokensByAddress: Object.fromEntries(polygonTokens.map(token => [token.id, token])),
    tokensByLabel: Object.fromEntries(polygonTokens.map(token => [token.label, token])),
    collaterals: collateralsList,
    collateralsByAddress: Object.fromEntries(collateralsList.map(token => [token.id, token])),
    collateralsByLabel: Object.fromEntries(collateralsList.map(token => [token.label, token]))
  },
  base: {
    tokens: baseTokens,
    tokensByAddress: Object.fromEntries(baseTokens.map(token => [token.id, token])),
    tokensByLabel: Object.fromEntries(baseTokens.map(token => [token.label, token]))
  }
}
