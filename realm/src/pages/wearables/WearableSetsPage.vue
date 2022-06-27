<template>
  <div class="wearable-sets-page">
    <div class="wearable-sets-nav site-banner site-banner--secondary">
      <router-link
        :to="{ name: 'wearable-sets', params: { mode: 'gotchi' } }"
        class="site-banner__link"
      >
        Group by Gotchi Type
      </router-link>
      <router-link
        :to="{ name: 'wearable-sets', params: { mode: 'all' } }"
        class="site-banner__link"
      >
        List All Sets
      </router-link>
    </div>
    <div class="wearable-sets-content">
      <template v-if="mode === 'all'">
        <h2>All Wearable Sets</h2>

        <table class="sets-table">
          <thead>
            <tr>
              <th class="sets-table__header"></th>
              <th class="sets-table__header">Set Bonus</th>
              <th class="sets-table__header sets-table__header--image"></th>
              <th class="sets-table__header sets-table__header--wearables">Items</th>
              <th class="sets-table__header">Total Modifiers</th>
              <th class="sets-table__header">Total BRS bonus</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="set in wearableSets"
              :key="set.id"
            >
              <td class="sets-table__cell sets-table__cell--name">{{ set.name }}</td>
              <td class="sets-table__cell sets-table__cell--set-bonus">{{ set.traitBonusesText }}</td>
              <td class="sets-table__cell sets-table__cell--image">
                <img
                  :src="`/wearablesets/${set.key}.png`"
                  width="100"
                  height="100"
                  :alt="`gotchi equipped with set '${set.name}'`"
                />
              </td>
              <td class="sets-table__cell sets-table__cell--wearables">
                <ul class="sets-table__wearables">
                  <li
                    v-for="wearable in set.wearables"
                    :key="wearable.name"
                  >
                    {{ wearable.name }}
                    ({{ wearable.rarity}}; {{ wearable.traitModifiersText }})
                  </li>
                </ul>
              </td>
              <td class="sets-table__cell sets-table__cell--total-bonuses">{{ set.totalTraitBonusesText }} </td>
              <td class="sets-table__cell sets-table__cell--total">{{ set.totalBRSBonus }}</td>
            </tr>
          </tbody>
        </table>
      </template>
      <template v-if="mode === 'gotchi'">
        <h2>Matching sets for different types of gotchi</h2>

        <table class="matching-sets-table">
          <tbody>
            <tr
              class="trait-profile"
              v-for="profile in traitProfiles"
              :key="profile.id"
            >
              <td
                v-for="trait in profile.traits"
                :key="trait.id"
                class="matching-sets-table__cell trait"
                :class="{
                  'trait--positive': trait.direction,
                  'trait--negative': !trait.direction
                }"
              >
                {{ trait.direction ? '+' : '-' }}
                {{ trait.id }}
              </td>
              <td class="matching-sets-table__cell matching-sets-table__cell--sets">
                <div class="matching-sets">
                  <details
                    v-for="set in profile.sets"
                    :key="set.id"
                    :class="`matching-set-with-types--${set.totalTraitBonusTypesCount}`"
                  >
                    <summary>
                      <span class="set-summary">
                        <span class="set-summary__rarity-markers rarity-markers">
                          <span
                             v-for="wearable in set.wearables"
                             :key="wearable.id"
                             class="rarity-marker"
                             :class="`rarity-marker--${wearable.rarity.toLowerCase()}`"
                             :title="`${wearable.name} (${wearable.rarity})`"
                          ></span>
                        </span>
                        <span class="set-summary__total">
                          [{{ set.totalBRSBonus }}]
                        </span>
                        <span class="set-summary__text">
                          {{ set.name }}
                          <span class="trait-bonus-types">({{ set.totalTraitBonusTypesText }})</span>
                        </span>
                      </span>
                    </summary>
                    <ul class="set-details">
                      <li
                        v-for="wearable in set.wearables"
                        :key="wearable.id"
                        class="set-details__wearable"
                      >
                        <div
                          class="set-details__wearable-rarity-marker rarity-marker"
                          :class="`rarity-marker--${wearable.rarity.toLowerCase()}`"
                        ></div>
                        <div class="set-details__wearable-desc">
                          {{ wearable.name }}
                          ({{ wearable.rarity }}; {{ wearable.traitModifiersText }})
                        </div>
                      </li>
                    </ul>
                  </details>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </template>
    </div>
  </div>
</template>

<script>
import orderBy from 'lodash.orderby'
import wearablesJson from '@/data/wearables/wearables.json'
import wearableSetsJson from '@/data/wearables/wearableSets.json'

const TRAITS_BY_INDEX = ['BRS', 'NRG', 'AGG', 'SPK', 'BRN']
const BASE_TRAITS_BY_INDEX = TRAITS_BY_INDEX.slice(1)

const TRAIT_PROFILES = [
  [0, 0, 0, 0],
  [0, 0, 0, 1],
  [0, 0, 1, 0],
  [0, 0, 1, 1],
  [0, 1, 0, 0],
  [0, 1, 0, 1],
  [0, 1, 1, 0],
  [0, 1, 1, 1],
  [1, 0, 0, 0],
  [1, 0, 0, 1],
  [1, 0, 1, 0],
  [1, 0, 1, 1],
  [1, 1, 0, 0],
  [1, 1, 0, 1],
  [1, 1, 1, 0],
  [1, 1, 1, 1]
]

const RARITIES_BY_SCORE = {
  '1': 'Common',
  '2': 'Uncommon',
  '5': 'Rare',
  '10': 'Legendary',
  '20': 'Mythical',
  '50': 'Godlike'
}

const ANNOTATED_WEARABLES = wearablesJson.map(wearable => {
  // prepend BRS into the traitModifiers list
  const traitModifiers = [wearable.rarityScoreModifier, ...wearable.traitModifiers]
  return {
    ...wearable,
    rarity: RARITIES_BY_SCORE[wearable.rarityScoreModifier],
    traitModifiers,
    traitModifiersText: traitModifiers.map((modifier, index) => {
      if (modifier === 0) { return '' }
      return `${TRAITS_BY_INDEX[index]} ${modifier > 0 ? '+' : ''}${modifier}`
    }).filter(text => !!text).join(', ')
  }
})

const WEARABLES_BY_ID = Object.fromEntries(ANNOTATED_WEARABLES.map(wearable => [wearable.id, wearable]))

export default {
  props: {
    mode: { type: String, default: 'all' }
  },
  computed: {
    wearableSets () {
      const sets = wearableSetsJson.map(set => {
        const setTraitBonusesMap = { BRS: 0, NRG: 0, AGG: 0, SPK: 0, BRN: 0 }
        set.traitsBonuses.forEach((bonus, index) => {
          setTraitBonusesMap[TRAITS_BY_INDEX[index]] = bonus
        })
        const key = orderBy(set.wearableIds).join('-')
        const wearables = set.wearableIds.map(id => WEARABLES_BY_ID[id])
        const totalTraitBonuses = wearables.reduce(
          (memo, wearable) => {
            wearable.traitModifiers.forEach((bonus, index) => {
              if (TRAITS_BY_INDEX[index]) {
                memo[TRAITS_BY_INDEX[index]] += bonus
              }
            })
            return memo
          },
          { ...setTraitBonusesMap }
        )
        const totalTraitBonusTypesText = Object.keys(totalTraitBonuses).map(trait => {
          if (trait === 'BRS') { return '' }
          const bonus = totalTraitBonuses[trait]
          if (bonus === 0) { return '' }
          return `${bonus > 0 ? '+' : '-'}${trait}`
        }).filter(text => !!text).join(', ')
        return {
          ...set,
          key,
          wearables,
          traitBonusesText: set.traitsBonuses.map((bonus, index) => {
            if (bonus === 0) { return '' }
            return `${TRAITS_BY_INDEX[index]} ${bonus > 0 ? '+' : ''}${bonus}`
          }).filter(text => !!text).join(', '),
          totalTraitBonuses,
          totalTraitBonusesText: Object.keys(totalTraitBonuses).map(trait => {
            const bonus = totalTraitBonuses[trait]
            if (bonus === 0) { return '' }
            return `${trait} ${bonus > 0 ? '+' : ''}${bonus}`
          }).filter(text => !!text).join(', '),
          totalBRSBonus: Object.values(totalTraitBonuses).reduce((memo, bonus) => {
            return memo + Math.abs(bonus)
          }, 0),
          totalTraitBonusTypesText,
          totalTraitBonusTypesCount: totalTraitBonusTypesText.split(',').length
        }
      })

      sets.sort((setA, setB) => {
        if (setA.totalBRSBonus === setB.totalBRSBonus) {
          if (setA.name === setB.name) { return 0 }
          return setA.name < setB.name ? -1 : 1
        }
        return setA.totalBRSBonus < setB.totalBRSBonus ? -1 : 1
      })

      return sets
    },
    baseTraitLabels () {
      return BASE_TRAITS_BY_INDEX
    },
    traitProfiles () {
      return TRAIT_PROFILES.map(profile => {
        const traits = profile.map((direction, index) => ({
          id: BASE_TRAITS_BY_INDEX[index],
          direction
        }))
        const sets = this.wearableSets.filter(set => {
          return BASE_TRAITS_BY_INDEX.every((trait, index) => {
            // if set doesn't affect a trait, that's fine
            if (set.totalTraitBonuses[trait] === 0) {
              return true
            }
            // when set affects a trait, that must match the direction of that trait in this profile
            return profile[index] ? set.totalTraitBonuses[trait] > 0 : set.totalTraitBonuses[trait] < 0
          })
        })
        return {
          id: profile.join(),
          traits,
          sets
        }
      })
    }
  }
}
</script>

<style>
  /* global styles for color scheme */
  .wearable-sets-page {
    --text-color-subtle: #777;
    --text-color-match-1: #555;
    --text-color-match-2: #333;
    --background-color-match-4: yellow;
    --border-color: #ccc;
  }

  .site-dark-mode .wearable-sets-page {
    --text-color-subtle: #888;
    --text-color-match-1: #aaa;
    --text-color-match-2: #dedede;
    --background-color-match-4: rgba(255, 255, 0, 0.25);
    --border-color: #555;
  }

  .site-dark-mode .sets-table__cell--image img {
    filter: drop-shadow(0px 5px 12px rgba(253, 178, 250, 0.35));
  }
</style>
<style scoped>
  .wearable-sets-content {
    padding: 10px;
  }

  .wearable-sets-nav {
    /* TODO this is a workaround to cover the padding from the <main> element */
    margin: -9px -10px -10px -10px;
    padding: 5px 5px 3px 5px;
  }
  .wearable-sets-nav a {
    padding: 0 15px;
    margin-bottom: 5px;
  }

  .sets-table {
      margin-bottom: 50px;
  }

  .sets-table__header {
      position: sticky;
      top: 0;
      /* need this so the sticky header is above the gotchi image in dark mode,
        where it has a filter that creates a positioning context
       */
      z-index: 1;
      background-color: var(--site-background-color--transparent);
      color: var(--site-text-color--subtle);
  }
  .sets-table__cell {
      border-bottom: 10px solid var(--site-background-color);
  }
  th {
      text-align: left;
  }
  td {
      vertical-align: top;
  }

  @media (max-width: 1000px) {
      table.sets-table {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-flow: row dense;
      }
      table.sets-table tbody,
      table.sets-table thead,
      table.sets-table tr {
          display: contents;
      }
      /* make the items cell full width. With dense flow, this effectively pushes it below the main row. */
      .sets-table__header--wearables {
          display: none;
      }
      .sets-table__cell--wearables {
          grid-column: 2 / 5;
      }
      /* also move the image */
      .sets-table__header--image {
          display: none;
      }
      .sets-table__cell--image {
          grid-column: 1 / 2;
      }
      .sets-table__cell {
          margin-top: 10px;
          border-bottom: none;
      }
      .sets-table__cell--image,
      .sets-table__cell--wearables {
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9em;
      }
      .sets-table__cell--name,
      .sets-table__cell--image {
          text-align: center;
      }
      .sets-table__cell--name {
        font-size: 1.2em;
        font-weight: bold;
      }
      .sets-table__cell--total {
        text-align: center;
      }
  }

  .trait {
      white-space: nowrap;
      border-bottom: 20px solid var(--site-background-color);
  }
  .trait--positive {
      background-color: rgba(106, 170, 150, 0.55);
  }
  .trait--negative {
      background-color: rgba(230, 127, 121, 0.35);
  }
  ul.sets-table__wearables,
  ul.sets-table__wearables > li {
      margin: 0;
      padding: 0;
      list-style-type: none;
  }
  .matching-sets {
      padding-bottom: 20px;
  }
  @media (min-width: 1000px) {
      .matching-sets {
          columns: 2;
      }
  }
  .trait-bonus-types {
      font-size: smaller;
      color: var(--text-color-subtle);
  }
  .matching-set-with-types--1 {
      color: var(--text-color-match-1);
  }
  .matching-set-with-types--2 {
      color: var(--text-color-match-2);
  }
  .matching-set-with-types--3 {
      font-weight: bold;
  }
  .matching-set-with-types--4 {
      font-weight: bold;
      background-color: var(--background-color-match-4);
  }

  .rarity-markers {
      --rarity-marker-width: 10px;
      --rarity-marker-gap: 1px;
      display: inline-flex;
      gap: var(--rarity-marker-gap);
      min-width: calc((4 * var(--rarity-marker-width)) + (3 * var(--rarity-marker-gap)));
  }
  .rarity-marker {
    --rarity-marker-color: transparent;
    flex: none;
    width: var(--rarity-marker-width);
    height: 15px;
    background-color: var(--rarity-marker-color);
  }
  .rarity-marker--common {
    --rarity-marker-color: var(--rarity-color--common);
  }
  .rarity-marker--uncommon {
    --rarity-marker-color: var(--rarity-color--uncommon);
  }
  .rarity-marker--rare {
    --rarity-marker-color: var(--rarity-color--rare);
  }
  .rarity-marker--legendary {
    --rarity-marker-color: var(--rarity-color--legendary);
  }
  .rarity-marker--mythical {
    --rarity-marker-color: var(--rarity-color--mythical);
  }
  .rarity-marker--godlike {
    --rarity-marker-color: var(--rarity-color--godlike);
  }

  .matching-sets-table__cell--sets {
      padding-left: 5px;
  }
  .matching-sets summary::marker {
      color: #bbb;
  }
  .matching-sets details {
      break-inside: avoid;
  }
  .set-summary__rarity-markers {
      position: relative;
      top: 3px;
  }
  .set-details {
      margin: 2px 0 6px 17px;
      padding: 0;
      font-size:  0.9em;
  }
  .set-details__wearable {
      margin: 0;
      padding: 0;
      display: flex;
      font-weight: normal;
  }
  .set-details__wearable-rarity-marker {
      flex: none;
      margin-right: 3px;
  }
  .set-details__wearable-desc {
      flex: 1 1 auto;
  }

  @media (max-width: 1000px) {
      table.matching-sets-table {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-flow: row dense;
      }
      table.matching-sets-table tbody,
      table.matching-sets-table tr {
          display: contents;
      }
      .matching-sets-table thead {
          display: none;
      }
      /* make the matching sets cell full width. With dense flow, this effectively pushes it below the main row. */
      .matching-sets-table__cell--sets {
          grid-column: 1 / 5;
      }
      .matching-sets-table__cell {
          padding: 10px;
          border-bottom: none;
      }
      .matching-sets-table__cell--sets {
          padding-bottom: 10px;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9em;
      }

      .matching-sets {
          padding-bottom: 0;
      }
      .matching-sets-table__cell {
          border-top: 1px solid var(--border-color);
      }
      .matching-sets-table__cell:first-child {
          border-left: 1px solid var(--border-color);
      }
      .matching-sets-table__cell:nth-child(4) {
          border-right: 1px solid var(--border-color);
      }
      .matching-sets-table__cell--sets {
          border: 1px solid var(--border-color);
          border-top: none;
          margin-bottom: 20px;
      }
  }
</style>
