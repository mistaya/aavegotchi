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
    }
};

export default function useDiamond () {
    if (!contract) {
        initContract();
    }
    return diamond;
}