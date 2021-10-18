import wearables from "./wearables.json";
import wearableSlots from "./wearableSlots.json";

const wearablesBySlot = Object.fromEntries(
    wearableSlots.map(slot => [
        slot.index,
        wearables.filter(wearable => wearable.slotPositions[slot.index])
    ])
);

console.log("Wearables", { wearableSlots, wearablesBySlot });

export default wearablesBySlot;