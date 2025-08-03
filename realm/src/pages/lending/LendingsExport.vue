<template>
  <a
    ref="exportLinkRef"
    href="#"
    download="lendings.csv"
    @click="onExportLinkClicked"
  >
    Export data
  </a>
</template>

<script>
import { formatISO9075 } from 'date-fns'
import { ref, computed, onUnmounted } from 'vue'
import useNetwork from '@/environment/useNetwork'
import tokens from '@/data/pockets/tokens'

export default {
  props: {
    lendings: { type: Array, required: true },
    earningsById: { type: Object, required: true }
  },
  setup (props) {
    const { isPolygonNetwork } = useNetwork()

    // TODO extract common code to share with ParcelsExport
    const exportLinkRef = ref(null)

    let textFile = null
    const cleanupTextFile = function () {
      if (textFile !== null) {
        window.URL.revokeObjectURL(textFile)
      }
    }
    const makeCSVFileUrl = function (rows) {
      // ASSUME cells don't contain commas, or have already been prepared as a string with "" for CSV
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

    const tokenAddresses = computed(() => {
      const tokensByLabel = isPolygonNetwork.value ? tokens.polygon.tokensByLabel : tokens.base.tokensByLabel
      return {
        FUD: tokensByLabel.FUD?.id,
        FOMO: tokensByLabel.FOMO?.id,
        ALPHA: tokensByLabel.ALPHA?.id,
        KEK: tokensByLabel.KEK?.id,
        GHST: tokensByLabel.GHST?.id
      }
    })

    const headers = [
      'id',
      'gotchiId',
      'gotchiName',
      'lender',
      'borrower',
      'thirdPartyAddress',
      'splitOwner',
      'splitBorrower',
      'splitOther',
      'periodSeconds',
      'periodHours',
      'upfrontCost',
      'whitelistId',
      'timeCreated',
      'timeAgreed',
      'lastClaimed',
      'completed',
      'timeEnded',
      'actualPeriodSeconds',
      'actualPeriodHours',
      'claimedFUD',
      'claimedFOMO',
      'claimedALPHA',
      'claimedKEK',
      'shareFUD',
      'shareFOMO',
      'shareALPHA',
      'shareKEK',
      'shareGHST',
      'originalOwner',
      'gotchiKinship',
      'channellingAllowed'
    ]
    const getRows = function () {
      return props.lendings.map(item => {
        const earnings = props.earningsById[item.id]
        const tokensToShare = item.tokensToShare
        return [
          item.id,
          item.gotchiTokenId,
          `"${item.gotchiName.replaceAll('"', '""')}"`,
          item.lender,
          item.borrower,
          item.thirdPartyAddress !== '0x0000000000000000000000000000000000000000' ? item.thirdPartyAddress : '',
          item.splitOwner,
          item.splitBorrower,
          item.splitOther,
          item.period,
          item.periodHours,
          item.upfrontCost,
          item.whitelistId,
          (item.timeCreated && formatISO9075(item.timeCreated)) || '',
          (item.timeAgreed && formatISO9075(item.timeAgreed)) || '',
          ((item.lastClaimed - 0) && formatISO9075(item.lastClaimed)) || '',
          item.completed,
          (item.timeEnded && formatISO9075(item.timeEnded)) || '',
          item.actualPeriod || '',
          item.actualPeriodHours || '',
          earnings?.claimedFUD || '',
          earnings?.claimedFOMO || '',
          earnings?.claimedALPHA || '',
          earnings?.claimedKEK || '',
          tokensToShare.includes(tokenAddresses.value.FUD) ? 'Y' : '',
          tokensToShare.includes(tokenAddresses.value.FOMO) ? 'Y' : '',
          tokensToShare.includes(tokenAddresses.value.ALPHA) ? 'Y' : '',
          tokensToShare.includes(tokenAddresses.value.KEK) ? 'Y' : '',
          tokensToShare.includes(tokenAddresses.value.GHST) ? 'Y' : '',
          item.originalOwner,
          item.gotchiKinship,
          item.channellingAllowed ? 'Y' : ''
        ]
      })
    }

    const onExportLinkClicked = () => {
      // Run this just-in-time when the link is clicked
      exportLinkRef.value.href = makeCSVFileUrl([headers].concat(getRows()))
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
