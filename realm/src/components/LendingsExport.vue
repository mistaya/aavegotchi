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
import { ref, onUnmounted } from 'vue'
import tokens from '@/data/pockets/tokens.json'

export default {
  props: {
    lendings: { type: Array, required: true },
    earningsById: { type: Object, required: true }
  },
  setup (props) {
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

    const tokensList = Object.values(tokens)
    const TOKEN_ADDRESSES = {
      FUD: tokensList.find(({ label }) => label === 'FUD').id,
      FOMO: tokensList.find(({ label }) => label === 'FOMO').id,
      ALPHA: tokensList.find(({ label }) => label === 'ALPHA').id,
      KEK: tokensList.find(({ label }) => label === 'KEK').id,
      GHST: tokensList.find(({ label }) => label === 'GHST').id
    }

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
      'originalOwner'
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
          (item.lastClaimed && formatISO9075(item.lastClaimed)) || '',
          item.completed,
          (earnings?.timeEnded && formatISO9075(earnings.timeEnded)) || '',
          earnings?.actualPeriod || '',
          earnings?.actualPeriodHours || '',
          earnings?.claimedFUD || '',
          earnings?.claimedFOMO || '',
          earnings?.claimedALPHA || '',
          earnings?.claimedKEK || '',
          tokensToShare.includes(TOKEN_ADDRESSES.FUD) ? 'Y' : '',
          tokensToShare.includes(TOKEN_ADDRESSES.FOMO) ? 'Y' : '',
          tokensToShare.includes(TOKEN_ADDRESSES.ALPHA) ? 'Y' : '',
          tokensToShare.includes(TOKEN_ADDRESSES.KEK) ? 'Y' : '',
          tokensToShare.includes(TOKEN_ADDRESSES.GHST) ? 'Y' : '',
          item.originalOwner
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
