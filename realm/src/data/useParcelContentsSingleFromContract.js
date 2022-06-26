import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import useRealmContract from '@/data/useRealmContract'
import INSTALLATIONS from './parcels/installations.json'
import TILES from './parcels/tiles.json'

const realm = useRealmContract()

export default function () {
  const aaltar = ref(null)
  const installations = ref([])
  const tiles = ref([])

  const { status: fetchStatus, setLoading } = useStatus()

  const canSubmitFetch = computed(() => !fetchStatus.value.loading)
  const lastFetchDate = ref(null)

  const resetContents = function () {
    aaltar.value = null
    installations.value = []
    tiles.value = []
    lastFetchDate.value = null
  }

  const readItemsFromGrid = function (grid, itemTypes) {
    // copy the grid so we can modify it later
    // also convert from the ethers BigNumber to a number
    const myGrid = grid.map(row => row.map(cell => cell.toString() - 0))
    const items = []
    for (let y = 0; y < myGrid.length; y++) {
      const row = myGrid[y]
      for (let x = 0; x < row.length; x++) {
        const cell = row[x]
        const equippedId = cell.toString() - 0
        if (equippedId !== 0) {
          const type = itemTypes[`${equippedId}`]
          if (!type) {
            console.error('Unknown grid item ID', equippedId)
          } else {
            items.push({
              type,
              grid: { x, y }
            })
            // Clear grid cells covered by this installation
            // (this mutates the grid)
            // console.log('Found installation', equippedId, ' at', x, y)
            for (let i = 0; i < type.width; i++) {
              for (let j = 0; j < type.height; j++) {
                // console.log('clear grid', x + i, y + j, myGrid[y + j][x + i])
                myGrid[y + j][x + i] = 0
              }
            }
          }
        }
      }
    }
    return items
  }

  const fetchContents = function (parcelId, parcelSizeNum) {
    resetContents()
    const [isStale, setLoaded, setError] = setLoading()
    realm.getParcelGrid(parcelId, parcelSizeNum).then(async result => {
      if (isStale()) { console.log('Stale request, ignoring'); return }
      if (result && result.installationsGrid && result.tilesGrid) {
        const allInstallations = readItemsFromGrid(result.installationsGrid, INSTALLATIONS)
        // Assume there is only one aaltar
        aaltar.value = allInstallations.find(item => item.type.installationType === 'aaltar')
        installations.value = allInstallations.filter(item => item.type.installationType !== 'aaltar')
        tiles.value = readItemsFromGrid(result.tilesGrid, TILES)
        lastFetchDate.value = new Date()
        setLoaded()
      } else {
        setError('Unexpected response')
      }
    }).catch(error => {
      console.error(error)
      setError('There was an error fetching the parcel grid')
    })
  }

  return {
    aaltar,
    installations,
    tiles,
    canSubmitFetch,
    fetchStatus,
    fetchContents,
    lastFetchDate
  }
}
