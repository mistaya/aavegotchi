<template>
  <div class="rf-winners">
    <div v-if="fetchStatus.loading">
      Loading...
    </div>
    <div v-else-if="fetchStatus.error">
      Unexpected error loading the winners data.
    </div>
    <div v-else-if="fetchStatus.loaded">
      <div>
        <NumberDisplay :number="numUniqueWinners" />
        gotchis won some GHST this round.
      </div>

      <div style="margin-top: 20px">
        Select a leaderboard:
        <SiteButton
          v-for="board in seasonInfo.leaderboards"
          :key="board.id"
          type="button"
          :aria-pressed="`${currentLeaderboardId === board.id}`"
          class="leaderboard-choice"
          @click="currentLeaderboardId = board.id"
        >
          {{ board.label }}
        </SiteButton>
      </div>

      <div style="margin-top: 20px">
        The tiebreaker for this leaderboard was
        <b>{{ tiebreakerLabel }}</b>
      </div>

      <div class="gotchis-table-filters">
        <form @submit.prevent="currentQuery = inputQuery">
          <label>
            Search by gotchi ID, name, or owner address:
            <input
              v-model="inputQuery"
              type="text"
            />
            <SiteButton type="submit">
              Search
            </SiteButton>
          </label>
        </form>
        <div style="margin-top: 20px;">
          <label>
            <input
              v-model="showImages"
              type="checkbox"
            />
            Display gotchi images
          </label>
        </div>
        <div style="margin-top: 10px;">
          <label>
            <input
              v-model="showExtended"
              type="checkbox"
            />
            Display more columns
          </label>
        </div>
        <div
          v-if="currentLeaderboardId === 'rarity'"
          style="margin-top: 10px;"
        >
          <label>
            <input
              v-model="debug"
              type="checkbox"
            />
            <span style="opacity: 0.5;">
              (devs) Display alternate Rarity Scores for debugging
            </span>
          </label>
        </div>
      </div>

      <SiteTable
        v-model:page="tablePaging.page"
        v-model:pageSize="tablePaging.pageSize"
        :numResults="numFilteredGotchis"
        class="rf-table"
      >
        <template #headers>
          <th>Rank</th>
          <th>Name, ID</th>
          <th v-if="showImages"></th>

          <!-- for debugging Rarity/Set issues -->
          <template v-if="showDebugTable">
            <th>
              Rarity (RF Ranking)
            </th>
            <th>
              Set (RF Ranking)
            </th>
            <th>
              Rarity (Graph)
            </th>
            <th>
              Set (Graph)
            </th>
            <th>
              Rarity (Best)
            </th>
            <th>
              Set (Best)
            </th>
            <th>
              Collateral, Traits, Equipment
            </th>
          </template>

          <th v-if="showExtended || currentLeaderboardId === 'rarity'">
            Wearable Set
          </th>

          <th
            v-for="board in leaderboardColumnsToShow"
            :key="board.id"
          >
            {{ board.label }}
            <span
              v-if="board.id === currentLeaderboardId"
              title="leaderboard"
              aria-label="leaderboard"
            >
              🌟
            </span>
            <span
              v-if="board.id === currentLeaderboard.tiebreaker"
              title="tiebreaker"
              aria-label="tiebreaker"
            >
              ⭐
            </span>
          </th>

          <th
            v-for="trait in traitColumnsToShow"
            :key="trait.label"
          >
            {{ trait.label }}
            <span
              v-if="currentLeaderboard.tiebreaker === 'trait' && trait.index === roundInfo.tiebreakerTraitIndex"
              title="tiebreaker"
              aria-label="tiebreaker"
            >
              ⭐
            </span>
          </th>

          <th>Reward (GHST)</th>
          <th>Owner</th>
          <th v-if="showExtended">
            Haunt
          </th>
          <th v-if="showExtended">
            Pocket Address
          </th>
        </template>
        <template #rows>
          <tr
            v-for="row in rowsToDisplay"
            :key="`${row.ranking}_${row.gotchi.id}`"
          >
            <td>
              {{ row.ranking }}
            </td>
            <td>
              {{ row.gotchi.name }}
              <br />
              <a
                :href="`https://app.aavegotchi.com/gotchi/${row.gotchi.id}`"
                target="_blank"
              >
                {{ row.gotchi.id }}
              </a>
            </td>
            <td v-if="showImages">
            <img
              :src="`/resources/rf/s${season}/r${round}/${row.gotchi.id}.svg`"
              alt=""
              style="width: 100px; height: 100px"
            />
            </td>

            <!-- For debugging Rarity/Set issues -->
            <template v-if="showDebugTable">
              <td
                :class="{
                  'rarity--different': (row.gotchi.withSetsRarityScoreRF - 0) !== (row.gotchi.withSetsRarityScoreBest - 0)
                }"
              >
                {{ row.gotchi.withSetsRarityScoreRF }}
              </td>
              <td
                :class="{
                  'set--different': (row.gotchi.equippedSetNameRF?.trim() || '') !== (row.gotchi.equippedSetNameBest || '')
                }"
              >
                {{ row.gotchi.equippedSetNameRF }}
              </td>
              <td
                :class="{
                  'rarity--different': (row.gotchi.withSetsRarityScore - 0) !== (row.gotchi.withSetsRarityScoreBest - 0)
                }"
              >
                {{ row.gotchi.withSetsRarityScore }}
              </td>
              <td
                :class="{
                  'set--different': (row.gotchi.equippedSetName?.trim() || '') !== (row.gotchi.equippedSetNameBest || '')
                }"
              >
                {{ row.gotchi.equippedSetName }}
              </td>
              <td class="rarity--best">
                {{ row.gotchi.withSetsRarityScoreBest }}
              </td>
              <td class="set--best">
                {{ row.gotchi.equippedSetNameBest }}
              </td>
              <td>
                {{ row.gotchi.collateral }}
                {{ row.gotchi.numericTraits }}
                {{ row.gotchi.equippedWearables }}
              </td>
            </template>

            <td v-if="showExtended || currentLeaderboardId === 'rarity'">
              {{ row.gotchi.equippedSetNameRF }}
            </td>

            <td
              v-for="board in leaderboardColumnsToShow"
              :key="board.id"
            >
              <template v-if="board.id === 'rarity'">
                {{ row.gotchi.withSetsRarityScoreRF }}
              </template>
              <template v-else-if="board.id === 'kinship'">
                {{ row.gotchi.kinship }}
              </template>
              <template v-else-if="board.id === 'xp'">
                {{ row.gotchi.experience }}
              </template>
            </td>

            <td
              v-for="trait in traitColumnsToShow"
              :key="trait.label"
            >
              {{ row.gotchi.withSetsNumericTraitsRF[trait.index] }}
            </td>

            <td>
              <NumberDisplay
                :number="row.reward.toNumber()"
                maxDecimals
              />
            </td>
            <td>
              <EthAddress
                :address="row.gotchi.owner"
                icon
              />
              <div v-if="row.gotchi.realOwner && row.gotchi.realOwner !== row.gotchi.owner">
                <EthAddress
                  :address="row.gotchi.realOwner"
                  icon
                />
              </div>
            </td>
            <td v-if="showExtended">
              {{ row.gotchi.hauntId}}
            </td>
            <td v-if="showExtended">
              <EthAddress :address="row.gotchi.escrow" shortest polygonscan />
            </td>
          </tr>
        </template>
      </SiteTable>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import useRarityFarming from '@/data/useRarityFarming'
import EthAddress from './EthAddress.vue'
import NumberDisplay from './NumberDisplay.vue'
import SiteButton from './SiteButton.vue'
import SiteTable from './SiteTable.vue'

const TRAITS = ['NRG', 'AGG', 'SPK', 'BRN', 'EYS', 'EYC']

export default {
  components: {
    EthAddress,
    NumberDisplay,
    SiteButton,
    SiteTable
  },
  props: {
    season: { type: String, required: true },
    round: { type: String, required: true }
  },
  setup (props) {
    const showImages = ref(true)
    const showExtended = ref(false)
    const debug = ref(false)

    const { seasonInfo, roundInfo, fetchStatus, winners } = useRarityFarming(props.season, props.round)

    const numUniqueWinners = computed(() => winners.value.length)

    const currentLeaderboardId = ref(seasonInfo.leaderboards[0].id)
    const currentLeaderboard = computed(() => seasonInfo.leaderboards.find(board => board.id === currentLeaderboardId.value))

    const tiebreakerLabel = computed(() => {
      if (currentLeaderboard.value.tiebreaker === 'trait') {
        return TRAITS[roundInfo.tiebreakerTraitIndex]
      }
      if (currentLeaderboard.value.tiebreaker === 'kinship') {
        return 'Kinship'
      }
      if (currentLeaderboard.value.tiebreaker === 'xp') {
        return 'XP'
      }
      return ''
    })

    const leaderboardColumnsToShow = computed(() => {
      if (showExtended.value) {
        return seasonInfo.leaderboards
      }
      return seasonInfo.leaderboards.filter(
        board => board.id === currentLeaderboardId.value || board.id === currentLeaderboard.value.tiebreaker
      )
    })

    const traitColumnsToShow = computed(() => {
      const traits = TRAITS.map((label, index) => ({ index, label }))
      if (showExtended.value) {
        return traits
      }
      if (currentLeaderboard.value.tiebreaker !== 'trait') {
        return []
      }
      return [traits[roundInfo.tiebreakerTraitIndex]]
    })

    const inputQuery = ref('')
    const currentQuery = ref('')
    const currentQueryCleaned = computed(() => currentQuery.value?.trim().toLowerCase())

    const tablePaging = ref({
      page: 0,
      pageSize: 25
    })

    watch(
      () => ({
        pageSize: tablePaging.value.pageSize,
        query: currentQueryCleaned.value
      }),
      () => { tablePaging.value.page = 0 }
    )

    const winnersByLeaderboard = computed(() => {
      if (!fetchStatus.value.loaded) { return {} }
      const mapByLeaderboard = {}
      for (const board of seasonInfo.leaderboards) {
        mapByLeaderboard[board.id] = []
      }
      for (const gotchi of winners.value) {
        for (const boardId in gotchi.leaderboards) {
          const board = gotchi.leaderboards[boardId]
          mapByLeaderboard[boardId].push({
            gotchi,
            gotchiNameLowercase: gotchi.name.toLowerCase(),
            ranking: board.ranking,
            reward: board.reward
          })
        }
      }
      // Sort by ranking
      for (const board of seasonInfo.leaderboards) {
        mapByLeaderboard[board.id].sort((a, b) => a.ranking - b.ranking)
      }
      // TODO Debug/Sanity check: check that rarity farming leaderboard is ordered by withSetsRarityScore
      /*
      let lastScore = 100000
      for (const { gotchi, ranking } of mapByLeaderboard.rarity) {
        if (gotchi.withSetsRarityScoreBest > lastScore) {
          console.error(`Gotchi at rank ${ranking} out of order (${gotchi.withSetsRarityScoreBest} is more than ${lastScore}). ${gotchi.equippedSetNameBest}`, gotchi)
        }
        if (gotchi.withSetsRarityScoreRF > gotchi.withSetsRarityScoreBest) {
          console.warn(`Gotchi at rank ${ranking} has HIGHER RF Rarity than expected`, gotchi)
        }
        // log the score used by ranking as the 'last score'
        lastScore = gotchi.withSetsRarityScoreRF
      }
      */
      return mapByLeaderboard
    })

    const currentLeaderboardIdWinners = computed(() => winnersByLeaderboard.value[currentLeaderboardId.value] || [])

    const winnersFiltered = computed(() => {
      const query = currentQueryCleaned.value
      if (!query) { return currentLeaderboardIdWinners.value }
      // // TODO Debugging: look for discrepancies
      // if (!query) {
      //   return currentLeaderboardIdWinners.value.filter(row =>
      //     (row.gotchi.modifiedRarityScore - 0) > (row.gotchi.withSetsRarityScore - 0)
      //   )
      // }
      return currentLeaderboardIdWinners.value.filter(row =>
        row.gotchi.id === query ||
        row.gotchi.owner === query ||
        row.gotchi.realOwner === query ||
        row.gotchiNameLowercase.includes(query)
      )
    })

    const rowsToDisplay = computed(() => {
      const start = tablePaging.value.page * tablePaging.value.pageSize
      const end = start + tablePaging.value.pageSize
      return winnersFiltered.value.slice(start, end)
    })

    const numFilteredGotchis = computed(() => winnersFiltered.value.length)

    const showDebugTable = computed(() => debug.value && currentLeaderboardId.value === 'rarity')

    return {
      debug,
      showImages,
      showExtended,
      showDebugTable,
      seasonInfo,
      roundInfo,
      tiebreakerLabel,
      fetchStatus,
      numUniqueWinners,
      currentLeaderboardId,
      currentLeaderboard,
      leaderboardColumnsToShow,
      traitColumnsToShow,
      inputQuery,
      currentQuery,
      tablePaging,
      numFilteredGotchis,
      rowsToDisplay
    }
  }
}
</script>

<style scoped>
  .leaderboard-choice {
    margin: 0 8px 5px 0;
    padding: 5px 10px;
  }

  .gotchis-table-filters {
    margin: 50px 0 30px;
  }

  .rf-table td {
    vertical-align: top;
  }

  /* debugging */
  .rarity--different {
    background: #fcc !important;
  }
  .set--different {
    background: #fda !important;
  }
  .rarity--different ~ .rarity--best {
    background: #dfd !important;
  }
  .set--different ~ .set--best {
    background: #dfd !important;
  }
</style>
<style>
  /* Global styles to use dark mode marker */
  .site-dark-mode .rf-winners .set--different,
  .site-dark-mode .rf-winners .rarity--different,
  .site-dark-mode .rf-winners .set--different ~ .set--best,
  .site-dark-mode .rf-winners .rarity--different ~ .rarity--best {
    color: black;
  }
</style>
