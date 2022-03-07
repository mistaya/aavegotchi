import { ref, computed } from 'vue'
import useStatus from '@/data/useStatus'
import useVaultContract from '@/data/useVaultContract'
import initialOwnersUrl from './pockets/assetVaultOwners.json'

const vaultContract = useVaultContract()

const ownersByGotchi = ref({})

const { status: fetchStatus, setLoading } = useStatus()

const canSubmitFetch = computed(() => !fetchStatus.value.loading)
const lastFetchDate = ref(null)

const clearOwnersByGotchi = function () {
  ownersByGotchi.value = {}
  lastFetchDate.value = null
}
const setOwnersByGotchi = function (ownersByGotchiMap) {
  Object.assign(ownersByGotchi.value, ownersByGotchiMap)
  lastFetchDate.value = new Date()
}

// N.B. the same data can be fetched from the subgraph, see useVaultOwners.js
const fetchOwners = function () {
  clearOwnersByGotchi()
  // 1. Get the list of all owners from the vault contract
  const [isStale, setLoaded, setError] = setLoading()

  // Give the UI a chance to display the loading state before we start fetching
  setTimeout(() => {
    if (isStale()) { return }

    vaultContract.getDepositors().then(
      result => {
        if (isStale()) { return }
        const owners = result
        // console.log('Fetched owners from vault', owners)
        console.log(`Fetched ${owners.length} owners from vault`)

        // 2. For each owner, ask the contract for their list of gotchi ids
        let nextOwnerIndex = 0
        const BATCH_SIZE = 500
        const requests = []

        while (nextOwnerIndex < owners.length) {
          const ownersToRequest = owners.slice(nextOwnerIndex, nextOwnerIndex + BATCH_SIZE)
          console.log('fetch gotchis for owner', ownersToRequest[0], 'to', ownersToRequest[ownersToRequest.length - 1])

          const request = vaultContract.getGotchiOwners(ownersToRequest)
          requests.push(request)
          request.then(
            result => {
              if (isStale()) { return }
              // console.log('batch vault gotchi owners result', { result }, Object.keys(result).length, 'gotchis')
              setOwnersByGotchi(result)
            },
            error => {
              if (isStale()) { return }
              console.error(error)
              setError('Error fetching batch of vault gotchi owners')
            }
          )

          nextOwnerIndex += BATCH_SIZE
        }

        Promise.allSettled(requests).then(results => {
          if (isStale()) { return }
          // console.log('Finished fetching vault owners', ownersByGotchi.value)
          lastFetchDate.value = new Date()
          setLoaded()
        })
      },
      error => {
        if (isStale()) { return }
        console.error(error)
        setError('Error fetching depositors from vault')
      }
    )
  }, 100)
}

// Use cached initial results
const [isStale, setLoaded, setError] = setLoading()
fetch(initialOwnersUrl)
  .then(response => response.json())
  .then(json => {
    if (isStale()) { return }
    setOwnersByGotchi(json, new Date(1646688386601))
    setLoaded()
  }).catch(error => {
    console.error(error)
    setError('Error loading initial vault gotchi owners')
  })

export default function () {
  return {
    ownersByGotchi,
    canSubmitFetch,
    fetchStatus,
    fetchOwners,
    lastFetchDate
  }
}
