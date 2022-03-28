<template>
  <div>
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
      </div>

      <GotchisTable
        v-model:page="tablePaging.page"
        v-model:pageSize="tablePaging.pageSize"
        :numResults="numFilteredGotchis"
      >
        <template #headers>
          <th>Rank</th>
          <th>ID</th>
          <th>Name</th>
          <!-- TODO add gotchi image -->

          <!-- TODO temp for debugging BRS/Set issues -->
          <th>
            BRS (RF Ranking)
          </th>
          <th>
            Set (RF Ranking)
          </th>
          <th>
            BRS (Graph)
          </th>
          <th>
            Set (Graph)
          </th>
          <th>
            BRS (Best)
          </th>
          <th>
            Set (Best)
          </th>
          <th>
            Collateral, Traits, Equipment
          </th>

          <th
            v-for="board in seasonInfo.leaderboards"
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
          <th>
            Set
          </th>
          <th>Reward (GHST)</th>
          <th>Owner</th>
          <th>Haunt</th>
          <th
            v-for="(trait, index) in ['NRG', 'AGG', 'SPK', 'BRN', 'EYS', 'EYC']"
            :key="trait"
          >
            {{ trait }}
            <span
              v-if="currentLeaderboard.tiebreaker === 'trait' && index === roundInfo.tiebreakerTraitIndex"
              title="tiebreaker"
              aria-label="tiebreaker"
            >
              ⭐
            </span>
          </th>
          <th>Pocket Address</th>
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
              <a
                :href="`https://app.aavegotchi.com/gotchi/${row.gotchi.id}`"
                target="_blank"
              >
                {{ row.gotchi.id }}
              </a>
            </td>
            <td>
              {{ row.gotchi.name }}
            </td>

            <!-- TODO temp for debugging BRS/Set issues -->
            <td
              :class="{
                'brs--low': (row.gotchi.withSetsRarityScoreRF - 0) < (row.gotchi.withSetsRarityScoreBest - 0)
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
                'brs--low': (row.gotchi.withSetsRarityScore - 0) < (row.gotchi.withSetsRarityScoreBest - 0)
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
            <td class="brs--best">
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

            <td>
              {{ row.gotchi.withSetsRarityScore }}
            </td>
            <td>
              {{ row.gotchi.kinship }}
            </td>
            <td>
              {{ row.gotchi.experience }}
            </td>
            <td>
              {{ row.gotchi.equippedSetName }}
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
              <br>
              <EthAddress
                v-if="row.gotchi.realOwner"
                :address="row.gotchi.realOwner"
                icon
              />
            </td>
            <td>
              {{ row.gotchi.hauntId}}
            </td>
            <td
              v-for="(trait, index) in row.gotchi.withSetsNumericTraits"
              :key="index"
            >
              {{ trait }}
            </td>
            <td>
              <EthAddress :address="row.gotchi.escrow" shortest polygonscan />
            </td>
          </tr>
        </template>
      </GotchisTable>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import useRarityFarming from '@/data/useRarityFarming'
import EthAddress from './EthAddress.vue'
import GotchisTable from './GotchisTable.vue'
import NumberDisplay from './NumberDisplay.vue'
import SiteButton from './SiteButton.vue'

export default {
  components: {
    EthAddress,
    NumberDisplay,
    SiteButton,
    GotchisTable
  },
  props: {
    season: { type: String, required: true },
    round: { type: String, required: true }
  },
  setup (props) {
    const { seasonInfo, roundInfo, fetchStatus, winners } = useRarityFarming(props.season, props.round)

    const numUniqueWinners = computed(() => winners.value.length)

    const currentLeaderboardId = ref(seasonInfo.leaderboards[0].id)
    const currentLeaderboard = computed(() => seasonInfo.leaderboards.find(board => board.id === currentLeaderboardId.value))

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
      let lastScore = 100000
      for (const { gotchi, ranking } of mapByLeaderboard.rarity) {
        if (gotchi.withSetsRarityScoreBest > lastScore) {
          console.error(`Gotchi at rank ${ranking} out of order (${gotchi.withSetsRarityScoreBest} is more than ${lastScore}). ${gotchi.equippedSetNameBest}`, gotchi)
        }
        // log the score used by ranking as the 'last score'
        lastScore = gotchi.withSetsRarityScoreRF
      }
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

    return {
      seasonInfo,
      roundInfo,
      fetchStatus,
      numUniqueWinners,
      currentLeaderboardId,
      currentLeaderboard,
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
    text-align: center;
  }

  /* TODO temp debugging */
  .brs--low {
    background: #fcc !important;
  }
  .set--different {
    background: #fda !important;
  }
  .brs--low ~ .brs--best {
    background: #dfd !important;
  }
  .set--different ~ .set--best {
    background: #dfd !important;
  }
</style>
