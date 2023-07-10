<template>
  <a
    ref="exportLinkRef"
    href="#"
    download="parcels.csv"
    @click="onExportLinkClicked"
  >
    Export data
  </a>
</template>

<script>
import { formatISO9075 } from 'date-fns'
import { ref, onUnmounted } from 'vue'
import useBaazaarListings from '@/data/useBaazaarListings'
import useParcelGBMListings from '@/data/useParcelGBMListings'
import useParcelLists from '@/data/useParcelLists'
import useParcelPrices from '@/data/useParcelPrices'
import useParcelOwners from '@/data/useParcelOwners'

export default {
  props: {
    parcels: { type: Array, required: true }
  },
  setup (props) {
    const { parcelListsById } = useParcelLists()
    const { pricesByParcelId } = useParcelPrices()
    const {
      ownersByParcelId,
      fetchStatus: ownersFetchStatus
    } = useParcelOwners()
    const {
      listingsByParcelId,
      salesByParcelId,
      fetchStatus: baazaarListingsFetchStatus
    } = useBaazaarListings()
    const {
      listingsByParcelId: gbmListingsByParcelId,
      salesByParcelId: gbmSalesByParcelId,
      fetchStatus: gbmListingsFetchStatus
    } = useParcelGBMListings()

    const exportLinkRef = ref(null)

    let textFile = null
    const cleanupTextFile = function () {
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile)
      }
    }
    const makeCSVFileUrl = function (rows) {
      // ASSUME cells don't contain commas
      const csvString = rows.map(row => row.join(',')).join('\n')
      const data = new Blob([csvString], { type: 'text/csv' })
      // If we are replacing a previously generated file we need to
      // manually revoke the object URL to avoid memory leaks.
      cleanupTextFile()
      textFile = window.URL.createObjectURL(data)
      // returns a URL you can use as a href
      return textFile
    }
    onUnmounted(cleanupTextFile)

    const parcelHeaders = [
      'id', 'parcelHash', 'district', 'size', 'sizeLabel',
      'hasBoost', 'fudBoost', 'fomoBoost', 'alphaBoost', 'kekBoost',
      'coordinateX', 'coordinateY', 'wall',
      ...Object.values(parcelListsById.value).map(list => list.label),
      'owner',
      'originalAuctionPrice', 'lastPrice',
      'latestBaazaarSaleId', 'latestBaazaarSalePrice', 'latestBaazaarSaleDate',
      'currentBaazaarListingId', 'currentBaazaarListingPrice', 'currentBaazaarListingDate',
      'latestGBMSaleId', 'latestGBMSalePrice', 'latestGBMSaleDate',
      'currentGBMListingId', 'currentGBMListingPrice', 'currentGBMListingDate'
    ]
    const getParcelRows = function () {
      const lastPrices = pricesByParcelId.value
      const ownersFetched = ownersFetchStatus.value.loaded
      const owners = ownersByParcelId.value
      const baazaarFetched = baazaarListingsFetchStatus.value.loaded
      const sales = salesByParcelId.value
      const listings = listingsByParcelId.value
      const gbmFetched = gbmListingsFetchStatus.value.loaded
      const gbmSales = gbmSalesByParcelId.value
      const gbmListings = gbmListingsByParcelId.value
      const lists = Object.values(parcelListsById.value)
      const listParcelsMap = {} // { listLabel : { parcelId : boolean }}
      for (const list of lists) {
        listParcelsMap[list.label] = Object.fromEntries(list.parcels.map(id => [id, true]))
      }
      return props.parcels.map(parcel => [
        parcel.id,
        parcel.parcelHash,
        parcel.district,
        parcel.size,
        parcel.sizeLabel,
        parcel.hasBoost,
        parcel.fudBoost,
        parcel.fomoBoost,
        parcel.alphaBoost,
        parcel.kekBoost,
        parcel.coordinateX,
        parcel.coordinateY,
        parcel.wall,
        ...lists.map(list => listParcelsMap[list.label][parcel.id]),
        (ownersFetched && owners[parcel.id]) || '',
        lastPrices[parcel.id]?.auctionPrice || '',
        lastPrices[parcel.id]?.lastPrice || '',
        (baazaarFetched && sales[parcel.id]?.id) || '',
        (baazaarFetched && sales[parcel.id]?.priceInGhst.toString()) || '',
        (baazaarFetched && sales[parcel.id]?.datePurchased && formatISO9075(sales[parcel.id].datePurchased)) || '',
        (baazaarFetched && listings[parcel.id]?.id) || '',
        (baazaarFetched && listings[parcel.id]?.priceInGhst.toString()) || '',
        (baazaarFetched && listings[parcel.id]?.dateCreated && formatISO9075(listings[parcel.id].dateCreated)) || '',
        (gbmFetched && gbmSales[parcel.id]?.id) || '',
        (gbmFetched && gbmSales[parcel.id]?.highestBidGhst.toString()) || '',
        (gbmFetched && gbmSales[parcel.id]?.datePurchased && formatISO9075(gbmSales[parcel.id].datePurchased)) || '',
        (gbmFetched && gbmListings[parcel.id]?.id) || '',
        (gbmFetched && gbmListings[parcel.id]?.highestBidGhst.toString()) || '',
        (gbmFetched && gbmListings[parcel.id]?.dateCreated && formatISO9075(gbmListings[parcel.id].dateCreated)) || ''
      ])
    }

    const onExportLinkClicked = () => {
      // Run this just-in-time when the link is clicked
      exportLinkRef.value.href = makeCSVFileUrl([parcelHeaders].concat(getParcelRows()))
    }

    return {
      exportLinkRef,
      onExportLinkClicked
    }
  }
}
</script>

<style scoped>
</style>
