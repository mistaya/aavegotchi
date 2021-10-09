import sets from "./wearable_sets.mjs";
import items from "./items.mjs";
import fs from "fs";


console.log("Found ", items.data.itemTypes.length, "items");
console.log("Found ", sets.data.wearableSets.length, "sets");

const itemTypes = items.data.itemTypes;
const wearableSets = sets.data.wearableSets;

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
        <td>${set.name}</td>
        <td>${set.traitBonusesText}</td>
        <td>
          <ul>
          	${set.wearables.map(wearable => "<li>" + wearable.name + " (" + wearable.rarity + "; " + wearable.traitModifiersText + ")</li>").join("")}
          </ul>
        </td>
        <td>${set.totalTraitBonusesText}</td>
        <td>${set.totalBRSBonus}</td>
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
    }).map(set => `<span class="matching-set-with-types--${set.totalTraitBonusTypesCount}">
        <div class="rarity-markers">
            ${set.wearables.map(wearable => `
                <div class="rarity-marker" style="--rarity-marker-color: ${rarityColors[wearable.rarity]};" title="${wearable.name} (${wearable.rarity})"></div>
            `).join("")}
        </div>
        <span class="set-total">[${set.totalBRSBonus}]</span>
        ${set.name} <span class="trait-bonus-types">(${set.totalTraitBonusTypesText})</span>
    </span><br>`);
};

const html = `
<html DOCTYPE="html">
<body>
    <style>
        td {
            vertical-align: top;
        }

        td.trait {
            white-space: nowrap;
        }
        td.trait--positive {
            background-color: #6aaa96;
        }
        td.trait--negative {
            background-color: #e67f83;
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
    </style>
    <table>
        <thead>
            <th>Set Name</th>
            <th>Set Bonus</th>
            <th>Items</th>
            <th>Total Modifiers</th>
            <th>Total BRS bonus</th>
        </thead>
        <tbody>
            ${tableRows.join("\n")}
        </tbody>
    </table>
    <hr />
    <table>
        <thead>
            <th>${individualTraitsByIndex[0]}</th>
            <th>${individualTraitsByIndex[1]}</th>
            <th>${individualTraitsByIndex[2]}</th>
            <th>${individualTraitsByIndex[3]}</th>
            <th>Matching Sets</th>
        </thead>
        <tbody>
            ${traitProfiles.map(profile => `
                <tr class="trait-profile">
                    ${profile.map((direction, index) => `
                        <td class="trait ${ direction ? "trait--positive" : "trait--negative" }">
                            ${direction ? "+" : "-"} ${individualTraitsByIndex[index]}
                        </td>
                    `).join("")}
                    <td>
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
