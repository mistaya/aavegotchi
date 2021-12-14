import { interpolateViridis, interpolateBlues, interpolateInferno, interpolateCividis, interpolateSpectral, interpolateTurbo, interpolateRainbow } from 'd3-scale-chromatic'
import { scaleSequential } from 'd3-scale'

const scalesByName = {
  grey: () => '#eee',
  viridis: interpolateViridis,
  blues: interpolateBlues,
  inferno: interpolateInferno,
  cividis: interpolateCividis,
  spectral: interpolateSpectral,
  turbo: interpolateTurbo,
  rainbow: interpolateRainbow
}

const SCALE_NAMES = Object.keys(scalesByName)

const steps = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
const generateGradient = function (scale) {
  const colors = steps.map(value => scale(value))
  return `linear-gradient(90deg, ${colors.join(', ')})`
}
const SCALE_GRADIENTS = Object.fromEntries(
  SCALE_NAMES.map(name => [name, generateGradient(scalesByName[name])])
)

const getSequentialScale = function ({ scaleName, min, max }) {
  return scaleSequential(scalesByName[scaleName]).domain([min, max])
}

export {
  SCALE_NAMES,
  SCALE_GRADIENTS,
  getSequentialScale
}
