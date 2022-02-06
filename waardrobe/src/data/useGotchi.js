import { ref, computed, watch } from 'vue';
import useStatus from "@/data/useStatus";
import useDiamond from "@/data/diamond";

import wearables from "./wearables.json";
import wearableSets from "./wearableSets.json";

const ANNOTATED_WEARABLE_SETS = wearableSets.map(item => {
    const rarityScoreModifier = item.traitsBonuses[0] - 0;
    const traitModifiers = item.traitsBonuses.slice(1).map(value => value - 0);
    let totalSetBonus = rarityScoreModifier;
    for (let modifier of traitModifiers) {
        totalSetBonus += Math.abs(modifier);
    }
    return {
        id: item.id,
        name: item.name,
        wearableIds: item.wearableIds,
        rarityScoreModifier,
        traitModifiers,
        totalSetBonus
    };
});

const wearablesById = Object.fromEntries(wearables.map(w => [w.id, { ...w, wearableSets: [] }]));

for (let i = 0; i < ANNOTATED_WEARABLE_SETS.length; i++) {
    const wearableSet = ANNOTATED_WEARABLE_SETS[i];
    for (let wearableId of wearableSet.wearableIds) {
        let wearable = wearablesById[wearableId];
        if (wearable) {
            wearable.wearableSets.push(i);
        }
    }
}

// One gotchi is selected on the site at a time
const gotchiId = ref(null);
const customGotchi = ref(null);
const gotchiDetails = ref(null);
const gotchiSvg = ref(null);
const previewWearables = ref(null);
const previewSvg = ref(null);

const { status: detailsStatus, setLoading: setDetailsLoading, reset: resetDetailsStatus } = useStatus();
const { status: svgStatus, setLoading: setSvgLoading, reset: resetSvgStatus } = useStatus();
const { status: previewSvgStatus, setLoading: setPreviewSvgLoading, reset: resetPreviewSvgStatus } = useStatus();

let diamond = null;

// The svg from the contract doesn't include the "eyes while petting" style.
// Copied this from aavegotchi.com and added CUSTOM marker class and style
const gotchiEyePettingSvg = `
    <style>
        .gotchi-eyeColor--CUSTOM-petting {
            display: none;
        }
    </style>
    <g class="gotchi-eyeColor gotchi-eyeColor--CUSTOM-petting">
        <path d="M23 26V25V24H22H21V25V26H22H23Z"/>
        <path d="M25 24H26H27V23V22H26H25H24H23V23V24H24H25Z"/>
        <path d="M27 26H28H29V25V24H28H27V25V26Z"/>
        <path d="M41 26H42H43V25V24H42H41V25V26Z"/>
        <path d="M39 24H40H41V23V22H40H39H38H37V23V24H38H39Z"/>
        <path d="M35 24V25V26H36H37V25V24H36H35Z"/>
    </g>
`;
const insertEyePettingSvg = function(svgText) {
    // simple hack, assumes there is a <g class="gotchi-eyeColor" in the SVG
    // This might break in future
    const insertionPoint = '<g class="gotchi-eyeColor';
    return svgText.replace(insertionPoint, `${gotchiEyePettingSvg}${insertionPoint}`)
};
const gotchiHideDefaultBgSvg = `
    <style>
        .gotchi-bg { display: none }
    </style>
`;
const hideDefaultBg = function(svgText) {
    // simple hack, assumes there is a <g class="gotchi-eyeColor" in the SVG
    // This might break in future
    const insertionPoint = '<g class="gotchi-eyeColor';
    return svgText.replace(insertionPoint, `${gotchiHideDefaultBgSvg}${insertionPoint}`)
};
const tweakSvg = function(svgText) {
    return hideDefaultBg(insertEyePettingSvg(svgText));
};

// Namespacing modifies the <style> rules inside the SVG with a prefix
// so we can stop them affecting other gotchi SVGs on the same page
const namespaceSvgText = function(svgText, namespace) {
    // simple hack, assumes the svgText only contains simple style selectors
    // This might break in future
    return svgText.replaceAll(".gotchi-", `.${namespace} .gotchi-`);
};

const clearGotchi = function () {
    gotchiDetails.value = null;
    gotchiSvg.value = null;
    previewSvg.value = null;
    resetDetailsStatus();
    resetSvgStatus();
    resetPreviewSvgStatus();
};

watch(
    () => gotchiId.value,
    newGotchiId => {
        clearGotchi();

        if (!newGotchiId) { return; }

        const [isDetailsStale, setDetailsLoaded, setDetailsError] = setDetailsLoading();
        diamond.getAavegotchi(newGotchiId).then(result => {
            if (isDetailsStale()) { return; }
            gotchiDetails.value = {
                id: gotchiId,
                name: result.name,
                hauntId: result.hauntId.toString(),
                collateral: result.collateral,
                escrow: result.escrow,
                numericTraits: result.numericTraits,
                equippedWearables: result.equippedWearables,
            };
            setDetailsLoaded();
        }).catch(err => {
            if (isDetailsStale()) { return; }
            gotchiDetails.value = null;
            let message = err.message
            const responseCode = err.code
            if (responseCode === "INVALID_ARGUMENT") {
                message = "Please provide a numeric gotchi ID."
            }
            setDetailsError(message);
        });

        const [isSvgStale, setSvgLoaded, setSvgError] = setSvgLoading();
        diamond.getAavegotchiSideSvgs(gotchiId.value).then(result => {
            if (isSvgStale()) { return; }
            gotchiSvg.value = [tweakSvg(result[0]), result[1], result[3], result[2]];
            setSvgLoaded();
        }).catch(err => {
            if (isSvgStale()) { return; }
            gotchiSvg.value = null;
            let message = err.message
            const responseCode = err.code
            if (responseCode === "INVALID_ARGUMENT") {
                message = "Please provide a numeric gotchi ID."
            } else {
                const responseMessage = err.errorArgs?.[0]
                if (responseMessage?.includes("Aavegotchi not claimed")) {
                    message = "That gotchi doesn't seem to exist."
                }
            }
            setSvgError(message);
        });
    }
);

watch(
    () => customGotchi.value,
    newCustomGotchi => {
        clearGotchi();

        if (!newCustomGotchi) { return; }

        // eslint-disable-next-line no-unused-vars
        const [isDetailsStale, setDetailsLoaded, setDetailsError] = setDetailsLoading();
        gotchiDetails.value = newCustomGotchi;
        setDetailsLoaded();

        const [isSvgStale, setSvgLoaded, setSvgError] = setSvgLoading();
        diamond.getPreviewAavegotchiSideSvgs(
            newCustomGotchi.hauntId,
            newCustomGotchi.collateral,
            newCustomGotchi.numericTraits,
            newCustomGotchi.equippedWearables
        ).then(result => {
            if (isSvgStale()) { return; }
            gotchiSvg.value = [tweakSvg(result[0]), result[1], result[3], result[2]];
            setSvgLoaded();
        }).catch(err => {
            if (isSvgStale()) { return; }
            gotchiSvg.value = null;
            let message = err.message
            const responseCode = err.code
            if (responseCode === "INVALID_ARGUMENT") {
                message = "Please provide numeric traits."
            }
            setSvgError(message);
        });
    },
    { deep: true }
);

const gotchiStatus = computed(() => {
    const loading = detailsStatus.value.loading || svgStatus.value.loading;
    const error = detailsStatus.value.error || svgStatus.value.error;
    const errorMessage = detailsStatus.value.errorMessage || svgStatus.value.errorMessage || "Error loading gotchi details or svg";
    const loaded = !error && detailsStatus.value.loaded && svgStatus.value.loaded;
    return {
        loading,
        loaded,
        error,
        errorMessage
    };
});

const setPreviewWearables = function(wearables) {
    previewWearables.value = [...wearables];
};

watch(
    () => previewWearables.value,
    () => {
        previewSvg.value = null;
        if (!gotchiDetails.value) { return; }
        const hauntId = gotchiDetails.value.hauntId;
        const collateralType = gotchiDetails.value.collateral;
        const numericTraits = gotchiDetails.value.numericTraits;
        const equippedWearables = previewWearables.value;
        const [isStale, setLoaded, setError] = setPreviewSvgLoading();
        diamond.getPreviewAavegotchiSideSvgs(hauntId, collateralType, numericTraits, equippedWearables).then(result => {
            if (isStale()) { return; }
            previewSvg.value = [tweakSvg(result[0]), result[1], result[3], result[2]];
            setLoaded();
        }).catch(err => {
            if (isStale()) { return; }
            setLoaded.value = null;
            setError(err.message);
        });
    }
);

const getBestWearableSet = function(wearableSetIndices) {
    if (!wearableSetIndices?.length) { return null; }
    const sortedSetIndices = [].concat(wearableSetIndices).sort((a, b) => {
        const setA = ANNOTATED_WEARABLE_SETS[a];
        const setB = ANNOTATED_WEARABLE_SETS[b];
        if (setA.totalSetBonus === setB.totalSetBonus) {
            if (setA.name === setB.name) {
                return 0;
            }
            // same total set bonus, different name.
            // pick the one with more wearables (Archer vs Elven Archer)
            if (setA.wearableIds.length === setB.wearableIds.length) {
                // same number of wearables: fall back to alphabetical name
                return setA.name < setB.name ? -1 : 1;
            }
            return setA.wearableIds.length > setB.wearableIds.length ? -1 : 1;
        }
        return setA.totalSetBonus > setB.totalSetBonus ? -1: 1;
    });
    return ANNOTATED_WEARABLE_SETS[sortedSetIndices[0]];
};


const calculateTraitsWithWearables = function (wearables) {
    const originalTraits = gotchiDetails.value?.numericTraits;
    const newTraits = [...originalTraits].map(value => value - 0);
    let additionalBrs = 0;
    let possibleWearableSets = [];
    for (const wearableId of wearables) {
        const wearable = wearablesById[wearableId];
        if (wearable && wearableId !== "0") {
            additionalBrs += wearable.rarityScoreModifier - 0;
            for (let i = 0; i < wearable.traitModifiers.length; i++) {
                newTraits[i] += wearable.traitModifiers[i] - 0;
            }
            possibleWearableSets.push(...wearable.wearableSets)
        }
    }
    // reduce to unique set indexes
    possibleWearableSets = [...new Set(possibleWearableSets)];
    // check each set to see if it's satisfied
    const previewHasWearable = id => wearables.includes(id);
    const matchingWearableSets = possibleWearableSets.filter(
        setIndex => ANNOTATED_WEARABLE_SETS[setIndex].wearableIds.every(previewHasWearable)
    );
    // only one set can be applied
    const bestWearableSet = getBestWearableSet(matchingWearableSets);
    if (bestWearableSet) {
        additionalBrs += bestWearableSet.rarityScoreModifier;
        for (let i = 0; i < bestWearableSet.traitModifiers.length; i++) {
            newTraits[i] += bestWearableSet.traitModifiers[i];
        }
    }
    const newBrs = calculateBaseRarityScore(newTraits) + additionalBrs;
    return {
        baseRarityScore: newBrs,
        numericTraits: newTraits,
        wearableSet: bestWearableSet
    };
}

const previewDetails = computed(() => calculateTraitsWithWearables(previewWearables.value));

const calculateBaseRarityScore = function(traits) {
    let rarityScore = 0;
    for (let trait of traits) {
        trait = trait - 0;
        if (trait >= 50) {
            rarityScore += trait + 1;
        } else {
            rarityScore += 100 - trait;
        }
    }
    return rarityScore;
};


const baseRarityScore = computed(() => {
    if (!gotchiDetails.value) { return null; }
    return calculateBaseRarityScore(gotchiDetails.value.numericTraits);
});

export default function useGotchi() {
    if (!diamond) {
        diamond = useDiamond();
    }

    return {
        gotchiId,
        customGotchi,
        gotchiStatus,
        gotchiDetails,
        gotchiSvg,
        baseRarityScore,
        previewWearables,
        setPreviewWearables,
        previewSvgStatus,
        previewSvg,
        namespaceSvgText,
        previewDetails,
        calculateTraitsWithWearables
    };
}