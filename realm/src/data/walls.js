const WALL_INNER = {
  id: 'inner',
  innerBounds: null,
  outerBounds: {
    minX: 3875,
    maxX: 5650,
    minY: 2400,
    maxY: 3900
  }
}
const WALL_MIDDLE = {
  id: 'middle',
  innerBounds: WALL_INNER.outerBounds,
  outerBounds: {
    minX: 2430,
    maxX: 7100,
    minY: 1500,
    maxY: 4800
  }
}
const WALL_OUTER = {
  id: 'outer',
  innerBounds: WALL_MIDDLE.outerBounds,
  outerBounds: {
    minX: 0,
    maxX: 9000,
    minY: 0,
    maxY: 6000
  }
}

export const WALLS = [
  WALL_INNER,
  WALL_MIDDLE,
  WALL_OUTER
]
