// https://raw.githubusercontent.com/aavegotchi/aavegotchi-contracts/master/diamondABI/diamond.json
import diamondAbi from "./diamondAbi.json";

import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider("https://base-rpc.publicnode.com");

let contract = null;

const initContract = function () {
    const diamondAddress = "0xA99c4B08201F2913Db8D28e71d020c4298F29dBF";
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
    }
};

export default function useDiamond () {
    if (!contract) {
        initContract();
    }
    return diamond;
}