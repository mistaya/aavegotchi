import { ref, computed, watch } from 'vue';
import useStatus from "@/data/useStatus";
import useDiamond from "@/data/diamond";

// One gotchi is selected on the site at a time
const gotchiId = ref(null);
const gotchiDetails = ref(null);
const gotchiSvg = ref(null);
const previewWearables = ref(null);
const previewSvg = ref(null);

const { status: detailsStatus, setLoading: setDetailsLoading } = useStatus();
const { status: svgStatus, setLoading: setSvgLoading } = useStatus();
const { status: previewSvgStatus, setLoading: setPreviewSvgLoading } = useStatus();

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

// Namespacing modifies the <style> rules inside the SVG with a prefix
// so we can stop them affecting other gotchi SVGs on the same page
const namespaceSvg = function(svgText, namespace) {
    // simple hack, assumes the svgText only contains simple style selectors
    // This might break in future
    return svgText.replaceAll(".gotchi-", `.${namespace} .gotchi-`);
};

watch(
    () => gotchiId.value,
    newGotchiId => {
        const [isDetailsStale, setDetailsLoaded, setDetailsError] = setDetailsLoading();
        gotchiDetails.value = null;
        gotchiSvg.value = null;
        diamond.getAavegotchi(newGotchiId).then(result => {
            if (isDetailsStale()) { return; }
            gotchiDetails.value = {
                id: gotchiId,
                name: result.name,
                hauntId: result.hauntId,
                collateral: result.collateral,
                numericTraits: result.numericTraits,
                baseRarityScore: result.baseRarityScore,
                modifiedNumericTraits: result.modifiedNumericTraits,
                modifiedRarityScore: result.modifiedRarityScore,
                equippedWearables: result.equippedWearables,
            };
            setDetailsLoaded();
        }).catch(err => {
            if (isDetailsStale()) { return; }
            gotchiDetails.value = null;
            setDetailsError(err.message);
        });

        const [isSvgStale, setSvgLoaded, setSvgError] = setSvgLoading();
        diamond.getAavegotchiSideSvgs(gotchiId.value).then(result => {
            if (isSvgStale()) { return; }
            gotchiSvg.value = [insertEyePettingSvg(result[0]), result[1], result[3], result[2]];
            setSvgLoaded();
        }).catch(err => {
            if (isSvgStale()) { return; }
            gotchiSvg.value = null;
            setSvgError(err.message);
        });
    }
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

const getNamespacedGotchiSvg = function (namespace) {
    if (!gotchiSvg.value) { return null; }
    return gotchiSvg.value.map(svgText => namespaceSvg(svgText, namespace));
};

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
            previewSvg.value = [insertEyePettingSvg(result[0]), result[1], result[3], result[2]];
            setLoaded();
        }).catch(err => {
            if (isStale()) { return; }
            setLoaded.value = null;
            setError(err.message);
        });
    }
);

const getNamespacedPreviewSvg = function (namespace) {
    if (!previewSvg.value) { return null; }
    return previewSvg.value.map(svgText => namespaceSvg(svgText, namespace));
};

export default function useGotchi() {
    if (!diamond) {
        diamond = useDiamond();
    }

    return {
        gotchiId,
        gotchiStatus,
        gotchiDetails,
        gotchiSvg,
        getNamespacedGotchiSvg,
        setPreviewWearables,
        previewSvgStatus,
        previewSvg,
        getNamespacedPreviewSvg
    };
}