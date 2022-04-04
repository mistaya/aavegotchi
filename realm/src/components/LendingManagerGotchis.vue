<template>
  <div>
    <template v-if="status.loading">
      Loading, please wait...
    </template>
    <template v-if="status.error">
      Error fetching data
    </template>
    <template v-if="status.loaded">
      <SiteButton
        type="button"
        @click="fetchData"
      >
        Refresh data
      </SiteButton>

      <SiteTable
        v-model:page="tablePaging.page"
        v-model:pageSize="tablePaging.pageSize"
        :numResults="tableGotchis.length"
      >
        <template #headers>
          <tr>
            <th>Gotchi</th>
            <th>Listed?</th>
            <th>Lended?</th>
            <th>Listing ID</th>
            <th>Listing Posted</th>
            <th>Lending Started</th>
            <th>Lending Expires</th>
            <th>Last Claimed</th>
            <th>Gotchi Pocket</th>
            <th>Lending Duration</th>
            <th>Upfront GHST</th>
            <th>Owner %</th>
            <th>Borrower %</th>
            <th>Third-Party %</th>
            <th>Whitelist ID</th>
            <th>Third-Party Address</th>
            <th v-if="!address">
              Owner
            </th>
            <th>Borrower</th>
          </tr>
        </template>
        <template #rows>
          <tr
            v-for="row in rowsToDisplay"
            :key="row.gotchi.id"
          >
            <td>
              <a
                :href="`https://app.aavegotchi.com/gotchi/${row.gotchi.id}`"
                rel="noopener"
                target="_blank"
              >
                {{ row.gotchi.name }}
                #{{ row.gotchi.id }}
              </a>
            </td>
            <td>
              <template v-if="row.isListed">
                Yes
              </template>
            </td>
            <td>
              <template v-if="row.isLended">
                Yes
              </template>
            </td>
            <td>
              <a
                v-if="row.listing"
                :href="`https://app.aavegotchi.com/lending/${row.listing.id}`"
                rel="noopener"
                target="_blank"
              >
                {{ row.listing.id }}
              </a>
            </td>
            <td>
              <DateFriendly
                v-if="row.createdDate"
                :date="row.createdDate"
              />
            </td>
            <td>
              <DateFriendly
                v-if="row.agreedDate"
                :date="row.agreedDate"
              />
            </td>
            <td>
              <DateFriendly
                v-if="row.finishDate"
                :date="row.finishDate"
              />
            </td>
            <td>
              <DateFriendly
                v-if="row.lastClaimedDate"
                :date="row.lastClaimedDate"
              />
            </td>
            <td>
              <EthAddress
                :address="row.gotchi.escrow"
                polygonscan="erc20"
                shortest
              />
            </td>
            <td>
              <template v-if="row.listing">
                {{ friendlyDuration(row.listing.period) }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ friendlyGhst(row.listing.upfrontCost) }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ row.listing.splitOwner }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ row.listing.splitBorrower }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ row.listing.splitOther }}
              </template>
            </td>
            <td>
              <template v-if="row.listing">
                {{ row.listing.whitelistId }}
              </template>
            </td>
            <td>
              <EthAddress
                v-if="row.listing && row.listing.thirdPartyAddress !== '0x0000000000000000000000000000000000000000'"
                :address="row.listing.thirdPartyAddress"
                icon
                polygonscan="erc20"
                shortest
              />
            </td>
            <td v-if="!address">
              <EthAddress
                v-if="row.listing"
                :address="row.listing.lender"
                icon
                polygonscan="erc20"
                shortest
              />
            </td>
            <td>
              <EthAddress
                v-if="row.isLended"
                :address="row.listing.borrower"
                icon
                polygonscan="erc20"
                shortest
              />
            </td>
          </tr>
        </template>
      </SiteTable>
    </template>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import orderBy from 'lodash.orderby'
import { ref, computed, watch } from 'vue'

import useStatus from '@/data/useStatus'
import DateFriendly from '@/components/DateFriendly.vue'
import EthAddress from './EthAddress.vue'
import SiteTable from './SiteTable.vue'

const SUBGRAPH_URL = 'https://static.138.182.90.157.clients.your-server.de/subgraphs/name/aavegotchi/aavegotchi-core-matic-lending-four'
const FETCH_PAGE_SIZE = 1000

export default {
  components: {
    EthAddress,
    DateFriendly,
    SiteTable
  },
  props: {
    address: { type: String, default: null },
    thirdPartyAddress: { type: String, default: null }
  },
  setup (props) {
    const addressLc = computed(() => props.address?.toLowerCase())
    const thirdPartyAddressLc = computed(() => props.thirdPartyAddress?.toLowerCase())

    const { status: ownedGotchisStatus, setLoading: setOwnedGotchisLoading } = useStatus()
    const ownedGotchis = ref(null)

    const { status: listingsStatus, setLoading: setListingsLoading } = useStatus()
    const listedGotchis = ref({})

    const status = computed(() => ({
      loading: ownedGotchisStatus.value.loading || listingsStatus.value.loading,
      error: ownedGotchisStatus.value.error || listingsStatus.value.error,
      loaded: ownedGotchisStatus.value.loaded && listingsStatus.value.loaded
    }))

    const tablePaging = ref({
      page: 0,
      pageSize: 25
    })

    const fetchOwnedGotchis = function () {
      const [isStale, setLoaded, setError] = setOwnedGotchisLoading()

      if (!props.address) {
        // Don't need to fetch owned gotchis if we're searching by the third party address
        ownedGotchis.value = []
        setLoaded()
        return
      }

      fetch(SUBGRAPH_URL, {
        method: 'POST',
        body: JSON.stringify({
          query: `{
            user(id: "${addressLc.value}") {
              gotchisOwned {
                id
                name
                escrow
              }
            }
          }`
        })
      })
        .then(async response => {
          if (isStale()) { console.log('Stale request, ignoring'); return }
          if (!response.ok) {
            setError('There was an error fetching non-lended gotchis')
            return
          }
          const responseJson = await response.json()
          // console.log({ responseJson })
          if (responseJson.data?.user?.gotchisOwned) {
            ownedGotchis.value = responseJson.data.user.gotchisOwned.map(item => ({ gotchi: item }))
            // console.log('ownedGotchis', ownedGotchis.value)
            setLoaded()
          } else {
            console.error('Unexpected response', responseJson)
            setError('Unexpected response')
          }
        })
        .catch(error => {
          console.error(error)
          setError('There was an error fetching non-lended gotchis')
        })
    }

    const fetchListings = function () {
      const [isStale, setLoaded, setError] = setListingsLoading()
      let lastIdNum = 0
      let fetchedListings = []

      const lenderQuery = props.address ? `, lender: "${addressLc.value}"` : ''
      const thirdPartyQuery = props.thirdPartyAddress ? `, thirdPartyAddress: "${thirdPartyAddressLc.value}"` : ''

      const fetchFromSubgraph = function () {
        const query = `{
          gotchiLendings(first: ${FETCH_PAGE_SIZE}, orderBy: id, where: { id_gt: ${lastIdNum}, cancelled: false, completed: false ${lenderQuery} ${thirdPartyQuery} }) {
            id
            gotchi {
              id
              name
              escrow
            }

            lender
            upfrontCost
            period
            tokensToShare
            splitOwner
            splitBorrower
            splitOther

            thirdPartyAddress
            whitelistId
            whitelistMembers

            timeCreated
            timeAgreed
            borrower
            lastClaimed
          }
        }`

        fetch(SUBGRAPH_URL, {
          method: 'POST',
          body: JSON.stringify({
            query
          })
        })
          .then(async response => {
            if (isStale()) { console.log('Stale request, ignoring'); return }
            if (!response.ok) {
              setError('There was an error fetching non-lended gotchis')
              return
            }
            const responseJson = await response.json()
            // console.log({ responseJson })
            if (responseJson.data?.gotchiLendings) {
              fetchedListings = fetchedListings.concat(responseJson.data.gotchiLendings)
              if (responseJson.data.gotchiLendings.length < FETCH_PAGE_SIZE) {
                // finished fetching all pages
                listedGotchis.value = fetchedListings.map(item => {
                  const { gotchi, ...listing } = item
                  return { gotchi, listing }
                })
                // console.log('listedGotchis', listedGotchis.value)
                setLoaded()
                return
              }
              // fetch the next page of results
              lastIdNum = responseJson.data.gotchiLendings[responseJson.data.gotchiLendings.length - 1].id - 0
              fetchFromSubgraph()
            } else {
              console.error('Unexpected response', responseJson)
              setError('Unexpected response')
            }
          })
          .catch(error => {
            console.error(error)
            setError('There was an error fetching non-lended gotchis')
          })
      }

      fetchFromSubgraph()
    }

    const fetchData = function () {
      fetchOwnedGotchis()
      fetchListings()
    }

    fetchData()

    const tableGotchis = computed(() => {
      if (!status.value.loaded) { return [] }
      const listedGotchiIds = listedGotchis.value.map(item => item.gotchi.id)
      const ownedUnlistedGotchis = ownedGotchis.value.filter(item => !listedGotchiIds.includes(item.gotchi.id))
      const rows = ownedUnlistedGotchis.concat(listedGotchis.value).map(item => {
        const isListed = item.listing && item.listing.timeAgreed === '0'
        const isLended = item.listing && item.listing.timeAgreed !== '0'
        const createdDate = item.listing ? new Date(item.listing.timeCreated * 1000) : null
        const agreedDate = isLended ? new Date(item.listing.timeAgreed * 1000) : null
        const finishDate = isLended ? new Date(((item.listing.timeAgreed - 0) + (item.listing.period - 0)) * 1000) : null
        const finishTimestamp = isLended
          ? ((item.listing.timeAgreed - 0) + (item.listing.period - 0)) * 1000
          // if not lended, make up a 'far future' timestamp to help with sorting listed and unlisted gotchis
          : (isListed ? Number.MAX_SAFE_INTEGER - 1 : Number.MAX_SAFE_INTEGER)
        const lastClaimedDate = item.listing && item.listing.lastClaimed !== '0' ? new Date(item.listing.lastClaimed * 1000) : null
        return {
          gotchi: item.gotchi,
          listing: item.listing,
          isListed,
          isLended,
          agreedDate,
          createdDate,
          finishDate,
          finishTimestamp,
          lastClaimedDate
        }
      })

      return orderBy(rows, ['finishTimestamp'], ['asc'])
    })

    watch(
      () => ({
        pageSize: tablePaging.value.pageSize,
        tableGotchis: tableGotchis.value
      }),
      () => { tablePaging.value.page = 0 }
    )

    const rowsToDisplay = computed(() => {
      const start = tablePaging.value.page * tablePaging.value.pageSize
      const end = start + tablePaging.value.pageSize
      return tableGotchis.value.slice(start, end)
    })

    const friendlyDuration = function (periodString) {
      const hours = (periodString - 0) / (60 * 60)
      return `${hours} hr${hours !== 1 ? 's' : ''}`
    }

    const friendlyGhst = function (upfrontCost) {
      const cost = new BigNumber(upfrontCost).div(10e17)
      return cost.toString()
    }

    return {
      status,
      ownedGotchis,
      tableGotchis,
      tablePaging,
      rowsToDisplay,
      friendlyDuration,
      friendlyGhst,
      fetchData
    }
  }
}
</script>

<style scoped>
</style>
