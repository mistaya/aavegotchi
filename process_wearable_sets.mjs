import sets from "./wearable_sets.mjs";
import items from "./items.mjs";
import fs from "fs";


console.log("Found ", items.data.itemTypes.length, "items");
console.log("Found ", sets.length, "sets");

const itemTypes = items.data.itemTypes;
const wearableSets = sets.map(([name, _ignore, wearableIds, traitBonuses]) => ({
    name,
    wearableIds,
    traitBonuses
}))

const traitProfiles = [
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
];

const raritiesByScore = {
    1: "Common",
    2: "Uncommon",   
    5: "Rare",
    10: "Legendary",
    20: "Mythical",
    50: "Godlike"
};

const rarityColors = {
    Common: "rgb(128, 100, 255)",
    Uncommon: "rgb(51, 186, 204)",
    Rare: "rgb(89, 188, 255)",
    Legendary: "rgb(255, 195, 107)",
    Mythical: "rgb(255, 150, 255)",
    Godlike: "rgb(81, 255, 168)"
};

const traitsByIndex = ["BRS", "NRG", "AGG", "SPK", "BRN"];
const individualTraitsByIndex = traitsByIndex.slice(1);

itemTypes.forEach(itemType => {
    itemType.rarity = raritiesByScore[itemType.rarityScoreModifier];
    // prepend BRS into the traitModifiers list
    itemType.traitModifiers = [itemType.rarityScoreModifier, ...itemType.traitModifiers];
    itemType.traitModifiersText = itemType.traitModifiers.map((modifier, index) => {
   	    if (modifier === 0) { return ""; }
   	    return `${traitsByIndex[index]} ${modifier > 0 ? '+' : ''}${modifier}`
   }).filter(text => !!text).join(", ")
});

const itemTypesById = Object.fromEntries(itemTypes.map(itemType => [itemType.id-0, itemType]));

wearableSets.forEach(set => {
    set.wearables = set.wearableIds.map(id => itemTypesById[id]);
    set.traitBonusesText = set.traitBonuses.map((bonus, index) => {
   	    if (bonus === 0) { return ""; }
   	    return `${traitsByIndex[index]} ${bonus > 0 ? '+' : ''}${bonus}`
    }).filter(text => !!text).join(", ")

    const setTraitBonusesMap = { BRS: 0, NRG: 0, AGG: 0, SPK: 0, BRN: 0 };
    set.traitBonuses.forEach((bonus, index) => {
        setTraitBonusesMap[traitsByIndex[index]] = bonus;
    })
    set.totalTraitBonuses = set.wearables.reduce((memo, wearable) => {
        wearable.traitModifiers.forEach((bonus, index) => {
            if (traitsByIndex[index]) {
                memo[traitsByIndex[index]] += bonus;
            }
        });
        return memo;
    }, { ...setTraitBonusesMap });
    set.totalTraitBonusesText = Object.keys(set.totalTraitBonuses).map(trait => {
        const bonus = set.totalTraitBonuses[trait];
        if (bonus === 0) { return ""; }
        return `${trait} ${bonus > 0 ? '+' : ''}${bonus}`
    }).filter(text => !!text).join(", ")
    set.totalBRSBonus = Object.values(set.totalTraitBonuses).reduce((memo, bonus) => {
        return memo + Math.abs(bonus);
    }, 0);
    set.totalTraitBonusTypesText = Object.keys(set.totalTraitBonuses).map(trait => {
        if (trait === "BRS") { return ""; }
        const bonus = set.totalTraitBonuses[trait];
        if (bonus === 0) { return ""; }
        return `${bonus > 0 ? '+' : '-'}${trait}`
    }).filter(text => !!text).join(", ")
    set.totalTraitBonusTypesCount = set.totalTraitBonusTypesText.split(",").length;
});

wearableSets.sort((setA, setB) => {
    if (setA.totalBRSBonus === setB.totalBRSBonus) {
        if (setA.name === setB.name) { return 0; }
        return setA.name < setB.name ? -1 : 1;
    }
    return setA.totalBRSBonus < setB.totalBRSBonus ? -1 : 1;
});

console.log("Wearable set 1: ", wearableSets[0]);
console.log("Wearable set 2: ", wearableSets[1]);
console.log("Wearable set 3: ", wearableSets[2]);
console.log("Wearable set 4: ", wearableSets[3]);
console.log("Wearable set 5: ", wearableSets[4]);

fs.writeFile('processedSets.json', JSON.stringify(wearableSets, null, 4), err => {
  if (err) {
    console.error(err)
    return
  }
  //done!
})

const tableRows = wearableSets.map(set => `
    <tr>
        <td class="sets-table__cell sets-table__cell--name">${set.name}</td>
        <td class="sets-table__cell">${set.traitBonusesText}</td>
        <td class="sets-table__cell sets-table__cell--wearables">
          <ul class="sets-table__wearables">
          	${set.wearables.map(wearable => "<li>" + wearable.name + " (" + wearable.rarity + "; " + wearable.traitModifiersText + ")</li>").join("")}
          </ul>
        </td>
        <td class="sets-table__cell">${set.totalTraitBonusesText}</td>
        <td class="sets-table__cell">${set.totalBRSBonus}</td>
    </tr>
`);

const getMatchingSets = function(profile) {
    return wearableSets.filter(set => {
        return individualTraitsByIndex.every((trait, index) => {
            if (set.totalTraitBonuses[trait] === 0) {
                return true;
            }
            return profile[index] ? set.totalTraitBonuses[trait] > 0 : set.totalTraitBonuses[trait] < 0;
        });
    }).map(set => `
    <details class="matching-set-with-types--${set.totalTraitBonusTypesCount}">
        <summary>
            <span class="set-summary">
                <span class="set-summary__rarity-markers rarity-markers">
                    ${set.wearables.map(wearable => `
                        <div class="rarity-marker" style="--rarity-marker-color: ${rarityColors[wearable.rarity]};" title="${wearable.name} (${wearable.rarity})"></div>
                    `).join("")}
                </span>
                <span class="set-summary__total">
                    [${set.totalBRSBonus}]
                </span>
                <span class="set-summary__text">
                    ${set.name} <span class="trait-bonus-types">(${set.totalTraitBonusTypesText})
                </span>
            </span>
        </summary>
        <ul class="set-details">
            ${set.wearables.map(wearable => `
                <li class="set-details__wearable">
                    <div
                        class="set-details__wearable-rarity-marker rarity-marker"
                        style="--rarity-marker-color: ${rarityColors[wearable.rarity]};">
                    </div>
                    <div class="set-details__wearable-desc">
                        ${wearable.name} (${wearable.rarity}; ${wearable.traitModifiersText})
                    </div>
                </li>
            `).join("")}
        </ul>
    </details>`);
};

const html = `
<html DOCTYPE="html">
<head>
    <title>Wearable Sets in Aavegotchi</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
    <style>
        body {
            text-size-adjust: none;
            font-size: 16px;
        }
        .sets-table__header {
            position: sticky;
            top: 0;
            background-color: rgba(255, 255, 255, 0.9);
        }
        .sets-table__cell {
            border-bottom: 10px solid white;
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
                grid-column: 1 / 5;
            }
            .sets-table__cell {
                margin-top: 10px;
                border-bottom: none;
            }
            .sets-table__cell--wearables {
                padding-bottom: 10px;
                border-bottom: 1px solid #ccc;
                font-size: 0.9em;
            }
            .sets-table__cell--name {
                font-weight: bold;
            }
        }

        .trait {
            white-space: nowrap;
            border-bottom: 20px solid white;
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
            color: #777;
        }
        .matching-set-with-types--1 {
            color: #555;
        }
        .matching-set-with-types--2 {
            color: #333;
        }
        .matching-set-with-types--3 {
            font-weight: bold;
        }
        .matching-set-with-types--4 {
            font-weight: bold;
            background-color: yellow;
        }
        .rarity-markers {
            display: inline-flex;
            gap: 1px;
        }
        .rarity-marker {
            flex: none;
            width: 10px;
            height: 15px;
            background-color: var(--rarity-marker-color);
        }
        .matching-sets-table__header--sets,
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
                border-bottom: 1px solid #ccc;
                font-size: 0.9em;
            }

            .matching-sets {
                padding-bottom: 0;
            }
            .matching-sets-table__cell {
                border-top: 1px solid #ccc;
            }
            .matching-sets-table__cell:first-child {
                border-left: 1px solid #ccc;
            }
            .matching-sets-table__cell:nth-child(4) {
                border-right: 1px solid #ccc;
            }
            .matching-sets-table__cell--sets {
                border: 1px solid #ccc;
                border-top: none;
                margin-bottom: 20px;
            }
        }
    </style>
    <h2>All Wearable Sets</h2>
    <table class="sets-table">
        <thead>
            <th class="sets-table__header">Set Name</th>
            <th class="sets-table__header">Set Bonus</th>
            <th class="sets-table__header sets-table__header--wearables">Items</th>
            <th class="sets-table__header">Total Modifiers</th>
            <th class="sets-table__header">Total BRS bonus</th>
        </thead>
        <tbody>
            ${tableRows.join("\n")}
        </tbody>
    </table>

    <h2>Matching sets for different types of gotchi</h2>
    <table class="matching-sets-table">
        <thead>
            <th>${individualTraitsByIndex[0]}</th>
            <th>${individualTraitsByIndex[1]}</th>
            <th>${individualTraitsByIndex[2]}</th>
            <th>${individualTraitsByIndex[3]}</th>
            <th class="matching-sets-table__header matching-sets-table__header--sets">Matching Sets</th>
        </thead>
        <tbody>
            ${traitProfiles.map(profile => `
                <tr class="trait-profile">
                    ${profile.map((direction, index) => `
                        <td class="matching-sets-table__cell trait ${ direction ? "trait--positive" : "trait--negative" }">
                            ${direction ? "+" : "-"} ${individualTraitsByIndex[index]}
                        </td>
                    `).join("")}
                    <td class="matching-sets-table__cell matching-sets-table__cell--sets">
                        <div class="matching-sets">
                            ${getMatchingSets(profile).join("")}
                        </div>
                    </td>
                </tr>
            `).join("")}
        </tbody>
    </table
</body>
</html>    	
`;

fs.writeFile('processedSets.html', html, err => {
  if (err) {
    console.error(err)
    return
  }
  //done!
})
