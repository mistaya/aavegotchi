// https://raw.githubusercontent.com/aavegotchi/aavegotchi-contracts/master/diamondABI/diamond.json
import diamondAbi from "./diamondAbi.json";

import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("https://polygon-rpc.com/");

let contract = null;

const initContract = function () {
    const diamondAddress = "0x86935F11C86623deC8a25696E1C19a8659CbF95d";
    contract = new ethers.Contract(
        diamondAddress,
        diamondAbi,
        provider
    );
};

const diamond = {
    getAavegotchi (gotchiId) {
        return contract.getAavegotchi(gotchiId);
    },

    getAavegotchiSideSvgs (gotchiId) {
        return contract.getAavegotchiSideSvgs(gotchiId);
    },

    getPreviewAavegotchiSideSvgs (hauntId, collateralType, numericTraits, equippedWearables) {
        return contract.previewSideAavegotchi(hauntId, collateralType, numericTraits, equippedWearables);
    },

    // call manually to get the latest wearables.json
    getItemTypes () {
        contract.getItemTypes([]).then(
            result => {
                console.log("getItemTypes: Result", result);
                const itemTypes = result.filter(item => item.category === "0").map(item => ({
                    id: item.svgId,
                    name: item.name,
                    dimensions: item.dimensions,
                    slotPositions: item.slotPositions,
                    rarityScoreModifier: item.rarityScoreModifier,
                    traitModifiers: item.traitModifiers
                }));
                console.log(JSON.stringify(itemTypes));
            },
            error => {
                console.error("getItemTypes: Error calling contract function", error);
            }
        );
    },

    // call manually to get the latest wearableSets.json
    getWearableSets () {
        contract.getWearableSets().then(
            result => {
                console.log("getWearableSets: Result", result);
                const wearableSets = result.map(item => {
                    const rarityScoreModifier = item.traitsBonuses[0] - 0;
                    const traitModifiers = item.traitsBonuses.slice(1).map(value => value - 0);
                    let totalSetBonus = rarityScoreModifier;
                    for (let modifier of traitModifiers) {
                        totalSetBonus += Math.abs(modifier);
                    }
                    return {
                        name: item.name,
                        wearableIds: item.wearableIds,
                        rarityScoreModifier,
                        traitModifiers,
                        totalSetBonus
                    };
                });
                console.log(JSON.stringify(wearableSets));
            },
            error => {
                console.error("getWearableSets: Error calling contract function", error);
            }
        );
    }
};

export default function useDiamond () {
    if (!contract) {
        initContract();
    }
    return diamond;
}