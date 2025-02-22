// from https://github.com/aavegotchi/aavegotchi-contracts/blob/6aef490cead8bd4cd934cf7f3ab73fb00b42e5b4/scripts/wearableSets.ts

module.exports = wearableSetArrays = [
  {
    setId: 0,
    name: "Infantry",
    wearableIds: [1, 2, 3],
    traitsBonuses: [1, 0, 1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 1,
    name: "Trooper",
    wearableIds: [4, 5, 6],
    traitsBonuses: [2, 0, 1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 2,
    name: "Sergeant",
    wearableIds: [7, 8, 9],
    traitsBonuses: [3, 0, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 3,
    name: "Link Marine",
    wearableIds: [10, 11, 12],
    traitsBonuses: [4, 0, 2, 0, 4], //add 4 BRN to compensate for Link Bubbly -2 BRN
    allowedCollaterals: [],
  },
  {
    setId: 4,
    name: "Mythical Sergey",
    wearableIds: [13, 14, 15],
    traitsBonuses: [5, 0, 3, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 5,
    name: "Godlike Sergey",
    wearableIds: [13, 14, 16],
    traitsBonuses: [6, -3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 6,
    name: "Apex Sergey",
    wearableIds: [13, 14, 16, 17],
    traitsBonuses: [6, -4, 0, 0, 0],
    allowedCollaterals: [3],
  },
  {
    setId: 7,
    name: "Aave Hero",
    wearableIds: [18, 19, 20],
    traitsBonuses: [1, 0, 0, 1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 8,
    name: "Captain Aave",
    wearableIds: [21, 22, 23],
    traitsBonuses: [2, 0, 0, 1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 9,
    name: "Thaave",
    wearableIds: [24, 25, 26],
    traitsBonuses: [3, 2, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 10,
    name: "Marc",
    wearableIds: [27, 28, 29],
    traitsBonuses: [4, 2, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 11,
    name: "Jordan",
    wearableIds: [30, 31, 32],
    traitsBonuses: [5, 0, 0, 3, 0],
    allowedCollaterals: [],
  },
  {
    setId: 12,
    name: "Godlike Stani",
    wearableIds: [33, 34, 35],
    traitsBonuses: [6, 0, -3, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 13,
    name: "Apex Stani",
    wearableIds: [32, 33, 34, 35],
    traitsBonuses: [6, 1, -3, 0, 0],
    allowedCollaterals: [2],
  },
  {
    setId: 14,
    name: "ETH Maxi",
    wearableIds: [36, 37, 38],
    traitsBonuses: [1, 0, 0, 0, -1],
    allowedCollaterals: [],
  },
  {
    setId: 15,
    name: "Foxy Meta",
    wearableIds: [39, 40, 41],
    traitsBonuses: [2, 0, -1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 16,
    name: "Nogara the Eagle",
    wearableIds: [42, 43, 44],
    traitsBonuses: [3, 2, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 17,
    name: "DeFi Degen",
    wearableIds: [45, 46, 47],
    traitsBonuses: [4, 0, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 18,
    name: "DAO Summoner",
    wearableIds: [48, 49, 50, 51],
    traitsBonuses: [5, 0, 0, 0, 3],
    allowedCollaterals: [],
  },
  {
    setId: 19,
    name: "Vitalik Visionary",
    wearableIds: [52, 53, 54],
    traitsBonuses: [6, -3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 20,
    name: "Apex Vitalik Visionary",
    wearableIds: [51, 52, 53, 54],
    traitsBonuses: [7, -3, 0, 0, 1],
    allowedCollaterals: [1],
  },
  {
    setId: 21,
    name: "Super Aagent",
    wearableIds: [55, 56, 57, 58, 59],
    traitsBonuses: [4, -1, 0, 2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 22,
    name: "Aagent",
    wearableIds: [55, 56, 57],
    traitsBonuses: [3, -1, 0, 1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 23,
    name: "Aagent",
    wearableIds: [55, 56, 57, 58],
    traitsBonuses: [3, -1, 0, 2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 24,
    name: "Wizard",
    wearableIds: [60, 64, 66],
    traitsBonuses: [1, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 25,
    name: "Wizard",
    wearableIds: [61, 64, 66],
    traitsBonuses: [1, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 26,
    name: "Wizard",
    wearableIds: [62, 64, 66],
    traitsBonuses: [1, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 27,
    name: "Wizard",
    wearableIds: [63, 64, 66],
    traitsBonuses: [1, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 28,
    name: "Wizard",
    wearableIds: [60, 65, 66],
    traitsBonuses: [1, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 29,
    name: "Legendary Wizard",
    wearableIds: [61, 65, 66],
    traitsBonuses: [4, 1, 0, 0, 1],
    allowedCollaterals: [],
  },
  {
    setId: 30,
    name: "Mythical Wizard",
    wearableIds: [62, 65, 66],
    traitsBonuses: [5, 1, 0, 0, 2],
    allowedCollaterals: [],
  },
  {
    setId: 31,
    name: "Godlike Wizard",
    wearableIds: [63, 65, 66],
    traitsBonuses: [6, 1, 0, 0, 2],
    allowedCollaterals: [],
  },
  {
    setId: 32,
    name: "Farmer",
    wearableIds: [67, 68, 69],
    traitsBonuses: [1, -1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 33,
    name: "Mythical Farmer",
    wearableIds: [67, 68, 70],
    traitsBonuses: [5, -2, 0, 0, -1],
    allowedCollaterals: [],
  },
  {
    setId: 34,
    name: "OKex Jaay",
    wearableIds: [72, 73, 74],
    traitsBonuses: [5, -1, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 35,
    name: "OKex Jaay Hao",
    wearableIds: [72, 73, 74, 75],
    traitsBonuses: [5, -1, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 36,
    name: "Skater",
    wearableIds: [77, 78, 79],
    traitsBonuses: [2, 0, 0, 0, -1],
    allowedCollaterals: [],
  },
  {
    setId: 37,
    name: "Sushi Chef",
    wearableIds: [80, 81, 82],
    traitsBonuses: [4, 0, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 38,
    name: "Sushi Chef",
    wearableIds: [80, 81, 83],
    traitsBonuses: [3, 0, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 39,
    name: "Master Sushi Chef",
    wearableIds: [80, 81, 82, 83],
    traitsBonuses: [4, 0, 2, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 40,
    name: "Gentleman",
    wearableIds: [84, 85, 86],
    traitsBonuses: [4, 0, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 41,
    name: "Miner",
    wearableIds: [87, 88, 89],
    traitsBonuses: [2, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 42,
    name: "Pajamas",
    wearableIds: [90, 91, 92],
    traitsBonuses: [3, 0, 0, -2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 43,
    name: "Pajamas",
    wearableIds: [90, 91, 93],
    traitsBonuses: [3, 0, 0, -2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 44,
    name: "Full Pajamas",
    wearableIds: [90, 91, 92, 93],
    traitsBonuses: [4, 0, 0, -3, 0],
    allowedCollaterals: [],
  },
  {
    setId: 45,
    name: "Runner",
    wearableIds: [94, 95, 96],
    traitsBonuses: [2, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 46,
    name: "Runner",
    wearableIds: [94, 95, 118],
    traitsBonuses: [2, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 47,
    name: "Runner",
    wearableIds: [94, 125, 96],
    traitsBonuses: [2, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 48,
    name: "Long Distance Runner",
    wearableIds: [94, 125, 118],
    traitsBonuses: [4, 2, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 49,
    name: "Lady",
    wearableIds: [97, 98, 100],
    traitsBonuses: [4, 0, 0, -2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 50,
    name: "Lady",
    wearableIds: [97, 98, 99],
    traitsBonuses: [4, 0, 0, -2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 51,
    name: "Socialite",
    wearableIds: [97, 98, 99, 100],
    traitsBonuses: [5, 2, 0, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 52,
    name: "Witchy",
    wearableIds: [101, 102, 103],
    traitsBonuses: [5, 0, 0, 3, 0],
    allowedCollaterals: [],
  },
  {
    setId: 53,
    name: "Portal Mage",
    wearableIds: [104, 105, 106],
    traitsBonuses: [4, 0, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 54,
    name: "Supreme Portal Mage",
    wearableIds: [104, 105, 107],
    traitsBonuses: [6, 0, 3, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 55,
    name: "Rastafarian",
    wearableIds: [108, 109, 110],
    traitsBonuses: [3, 0, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 56,
    name: "Off Duty Hazmat",
    wearableIds: [111, 112, 123],
    traitsBonuses: [4, 2, 0, 2, 0], //add +2 SPK to compensate for -2 SPK of Apple Juice
    allowedCollaterals: [],
  },
  {
    setId: 57,
    name: "On Duty Hazmat",
    wearableIds: [111, 112, 113],
    traitsBonuses: [6, 3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 58,
    name: "Blue Vacationer",
    wearableIds: [115, 116, 117],
    traitsBonuses: [4, -2, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 59,
    name: "Red Vacationer",
    wearableIds: [114, 116, 117],
    traitsBonuses: [5, -2, 0, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 60,
    name: "Crypto OG",
    wearableIds: [12, 19, 36, 40, 77],
    traitsBonuses: [4, 0, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 61,
    name: "Rektboi",
    wearableIds: [29, 45, 46],
    traitsBonuses: [4, 0, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 62,
    name: "Man of Culture",
    wearableIds: [47, 59, 74],
    traitsBonuses: [4, 0, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 63,
    name: "Curve Surfer",
    wearableIds: [66, 76, 115],
    traitsBonuses: [4, 0, 0, 0, 2],
    allowedCollaterals: [],
  },
  {
    setId: 64,
    name: "PoW Miner",
    wearableIds: [25, 77, 89],
    traitsBonuses: [3, 0, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 65,
    name: "Toddler",
    wearableIds: [90, 91, 119],
    traitsBonuses: [4, 0, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 66,
    name: "FU Money",
    wearableIds: [35, 114, 117, 120],
    traitsBonuses: [6, 0, -3, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 67,
    name: "Farmer Alf",
    wearableIds: [13, 67, 68, 69],
    traitsBonuses: [5, -3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 68,
    name: "Battle Santa",
    wearableIds: [5, 13, 71, 106],
    traitsBonuses: [5, 0, 3, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 69,
    name: "Party Animal",
    wearableIds: [109, 40, 124],
    traitsBonuses: [5, 0, 0, 0, -3],
    allowedCollaterals: [],
  },
  {
    setId: 70,
    name: "Snapshot Voter",
    wearableIds: [137, 138, 139],
    traitsBonuses: [3, 0, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 71,
    name: "Polygonist",
    wearableIds: [134, 135, 136],
    traitsBonuses: [3, 0, -1, 0, 1],
    allowedCollaterals: [],
  },
  {
    setId: 72,
    name: "Quickswap Dragon",
    wearableIds: [130, 131, 132],
    traitsBonuses: [3, 0, 1, 1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 73,
    name: "Swappy the Dragon",
    wearableIds: [130, 132, 133],
    traitsBonuses: [4, 0, 1, 1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 74,
    name: "Gotchi Elf",
    wearableIds: [140, 141, 142],
    traitsBonuses: [3, 0, 0, -1, 1],
    allowedCollaterals: [],
  },
  {
    setId: 75,
    name: "Gotchi Princess",
    wearableIds: [140, 141, 142, 143],
    traitsBonuses: [4, 1, 1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 76,
    name: "Gotchi Queen",
    wearableIds: [140, 141, 144, 143],
    traitsBonuses: [5, 0, 0, -2, 1],
    allowedCollaterals: [],
  },
  {
    setId: 77,
    name: "Godli Locks",
    wearableIds: [140, 141, 145, 143],
    traitsBonuses: [6, 0, 0, -2, 2],
    allowedCollaterals: [],
  },
  {
    setId: 78,
    name: "Gotchi Baron",
    wearableIds: [146, 147, 148],
    traitsBonuses: [3, -1, 0, 0, -1],
    allowedCollaterals: [],
  },
  {
    setId: 79,
    name: "Gotchi Lord",
    wearableIds: [146, 147, 148, 150],
    traitsBonuses: [5, -1, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 80,
    name: "Gotchi King",
    wearableIds: [146, 149, 148, 150],
    traitsBonuses: [5, -2, 0, 0, -1],
    allowedCollaterals: [],
  },
  {
    setId: 81,
    name: "Gotchi Emperor",
    wearableIds: [146, 149, 148, 150, 156],
    traitsBonuses: [6, -2, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 82,
    name: "Lil Pumpagotchi",
    wearableIds: [157, 158, 159, 160, 161],
    traitsBonuses: [6, 2, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 83,
    name: "Soundcloud Rapper",
    wearableIds: [108, 157, 158, 159, 160],
    traitsBonuses: [5, 1, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 84,
    name: "REALM Tycoon",
    wearableIds: [84, 85, 86, 146],
    traitsBonuses: [4, -1, -1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 85,
    name: "Yegres the Dragon",
    wearableIds: [14, 131, 132, 44],
    traitsBonuses: [5, 0, 0, 1, 2],
    allowedCollaterals: [],
  },
  {
    setId: 86,
    name: "Vacation Santa",
    wearableIds: [71, 114, 120, 117],
    traitsBonuses: [5, -1, -1, -1, 0],
    allowedCollaterals: [],
  },

  //new

  {
    setId: 87,
    name: "VR Gamer",
    wearableIds: [202, 203, 204],
    traitsBonuses: [5, 2, 1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 88,
    name: "Steampunk",
    wearableIds: [199, 200, 201],
    traitsBonuses: [4, 0, 0, 2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 89,
    name: "Casual Gamer",
    wearableIds: [117, 203, 204],
    traitsBonuses: [3, 1, 1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 90,
    name: "Gentleman Farmer",
    wearableIds: [69, 146, 200],
    traitsBonuses: [2, 0, 0, 1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 91,
    name: "Cyberpunk",
    wearableIds: [43, 48, 202],
    traitsBonuses: [5, 3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 92,
    name: "Steampunk Grenadier",
    wearableIds: [1, 2, 6, 199],
    traitsBonuses: [3, 0, 0, 2, 0],
    allowedCollaterals: [],
  },

  {
    name: "Venly Biker",
    wearableIds: [206, 207, 208, 209],
    traitsBonuses: [4, -1, 1, 0, 0], //change NRG to -1 to be in line with others
    allowedCollaterals: [],
  },
  {
    setId: 94,
    name: "Hacker Aanon",
    wearableIds: [211, 212, 213],
    traitsBonuses: [5, -2, 0, 0, 1],
    allowedCollaterals: [],
  },
  {
    setId: 95,
    name: "Shadowy Supercoder",
    wearableIds: [212, 213, 214],
    traitsBonuses: [6, -2, 0, 0, 1],
    allowedCollaterals: [],
  },
  {
    setId: 96,
    name: "Cyborg ",
    wearableIds: [215, 216, 217],
    traitsBonuses: [5, 0, 3, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 97,
    name: "Punk Rocker",
    wearableIds: [218, 219, 220],
    traitsBonuses: [4, 0, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 98,
    name: "Piraate",
    wearableIds: [221, 222, 223, 224],
    traitsBonuses: [3, 0, 0, 0, -2],
    allowedCollaterals: [],
  },
  {
    setId: 99,
    name: "Aair Gotchi",
    wearableIds: [225, 226, 227],
    traitsBonuses: [3, 2, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 100,
    name: "Wraangler",
    wearableIds: [228, 229, 230],
    traitsBonuses: [2, 0, 1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 101,
    name: "Ranchero",
    wearableIds: [231, 232, 233],
    traitsBonuses: [2, -1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 102,
    name: "Ranchero",
    wearableIds: [231, 232, 236],
    traitsBonuses: [2, -1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 103,
    name: "Ranchero",
    wearableIds: [231, 232, 237],
    traitsBonuses: [2, -1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 104,
    name: "Ranchero",
    wearableIds: [231, 232, 238],
    traitsBonuses: [2, -1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 105,
    name: "Novice Shaaman",
    wearableIds: [233, 234, 235],
    traitsBonuses: [5, -3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 106,
    name: "Shaaman Priest",
    wearableIds: [234, 235, 236],
    traitsBonuses: [5, -3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 107,
    name: "Shaaman Mystic",
    wearableIds: [234, 235, 237],
    traitsBonuses: [5, -3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 108,
    name: "Master Shaaman",
    wearableIds: [234, 235, 238],
    traitsBonuses: [6, -3, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 109,
    name: "WGMI Wagie ",
    wearableIds: [239, 240, 241],
    traitsBonuses: [3, 0, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 110,
    name: "YOLO Guy",
    wearableIds: [242, 243, 244],
    traitsBonuses: [4, -1, -1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 111,
    name: "Psychonaut",
    wearableIds: [234, 235, 238, 53],
    traitsBonuses: [7, -3, 0, 0, 1],
    allowedCollaterals: [],
  },
  {
    setId: 112,
    name: "Tech Bro",
    wearableIds: [242, 243, 244, 212],
    traitsBonuses: [5, -2, 0, 0, 1],
    allowedCollaterals: [],
  },
  {
    setId: 113,
    name: "Gunslinger",
    wearableIds: [231, 228, 58, 58],
    traitsBonuses: [3, 0, 2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 114,
    name: "We Are Legion",
    wearableIds: [85, 211, 212],
    traitsBonuses: [5, 0, 0, 3, 0],
    allowedCollaterals: [],
  },
  {
    setId: 115,
    name: "Aastronaut",
    wearableIds: [252, 253, 254],
    traitsBonuses: [1, 0, 0, 1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 116,
    name: "Geckogotchi",
    wearableIds: [249, 250, 251],
    traitsBonuses: [2, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 117,
    name: "Super Geckogotchi",
    wearableIds: [245, 249, 250, 251],
    traitsBonuses: [3, 0, 0, -1, -1],
    allowedCollaterals: [],
  },
  {
    setId: 118,
    name: "Lil Bubble",
    wearableIds: [255, 256, 257],
    traitsBonuses: [4, 2, -1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 119,
    name: "Radar",
    wearableIds: [261, 262, 263],
    traitsBonuses: [5, 0, -1, 0, 2],
    allowedCollaterals: [],
  },
  {
    setId: 120,
    name: "Laozigotchi",
    wearableIds: [258, 259, 260],
    traitsBonuses: [6, -2, 0, 0, 1],
    allowedCollaterals: [],
  },
  {
    setId: 121,
    name: "Wandering Sage",
    wearableIds: [65, 258, 259, 260],
    traitsBonuses: [7, -2, 0, 0, 2],
    allowedCollaterals: [],
  },
  {
    setId: 122,
    name: "APY Visionary",
    wearableIds: [246, 247, 248],
    traitsBonuses: [2, 1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 123,
    name: "Aarcher",
    wearableIds: [292, 293, 294],
    traitsBonuses: [1, 0, -1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 124,
    name: "Baarbarian",
    wearableIds: [295, 296, 297, 298],
    traitsBonuses: [2, 0, 1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 125,
    name: "Raanger",
    wearableIds: [293, 299, 300],
    traitsBonuses: [2, -1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 126,
    name: "Geisha",
    wearableIds: [301, 302, 303, 304],
    traitsBonuses: [3, 0, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 127,
    name: "Fairy",
    wearableIds: [306, 307, 308],
    traitsBonuses: [4, -1, 0, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 128,
    name: "Sus Fairy",
    wearableIds: [305, 306, 307, 308],
    traitsBonuses: [4, -1, 0, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 129,
    name: "Knight",
    wearableIds: [309, 310, 311],
    traitsBonuses: [5, 2, -1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 130,
    name: "Citaadel Knight",
    wearableIds: [309, 310, 311, 312],
    traitsBonuses: [5, 1, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 131,
    name: "Bushidogotchi",
    wearableIds: [313, 314, 315],
    traitsBonuses: [6, 0, 1, 2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 132,
    name: "Robin Hood",
    wearableIds: [18, 293, 294, 300],
    traitsBonuses: [2, -1, 0, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 133,
    name: "Nure-onna",
    wearableIds: [249, 302, 303, 304],
    traitsBonuses: [3, 0, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 134,
    name: "Tinkerbell",
    wearableIds: [148, 306, 307, 308],
    traitsBonuses: [4, -1, 0, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 135,
    name: "Rave Gurl",
    wearableIds: [216, 120, 49, 235, 307],
    traitsBonuses: [5, -1, 1, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 136,
    name: "Off Duty Knight",
    wearableIds: [99, 122, 144, 310],
    traitsBonuses: [5, 1, 0, -2, 0],
    allowedCollaterals: [],
  },
  {
    setId: 137,
    name: "Daimyogotchi",
    wearableIds: [155, 313, 314, 315],
    traitsBonuses: [7, 0, 1, 2, -1],
    allowedCollaterals: [],
  },
  {
    setId: 138,
    name: "Shogungotchi",
    wearableIds: [156, 313, 314, 315],
    traitsBonuses: [8, -1, 1, 2, -1],
    allowedCollaterals: [],
  },
  {
    setId: 139,
    name: "Noble Savage",
    wearableIds: [146, 296, 297, 298],
    traitsBonuses: [2, 0, 1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 140,
    name: "Elven Aarcher",
    wearableIds: [140, 292, 293, 294],
    traitsBonuses: [1, 0, -1, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 141,
    name: "Elven Raanger",
    wearableIds: [140, 141, 293, 299, 300],
    traitsBonuses: [2, 0, 0, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 142,
    name: "Woodland Critter",
    wearableIds: [293, 300, 140, 40],
    traitsBonuses: [2, 0, 0, -1, 0],
    allowedCollaterals: [],
  },
  {
    setId: 143,
    name: "Vacation Geisha",
    wearableIds: [115, 304, 243, 302],
    traitsBonuses: [4, 0, -2, 0, 0],
    allowedCollaterals: [],
  },
  {
    setId: 144,
    name: "Tooth Fairy",
    wearableIds: [306, 307, 308, 93],
    traitsBonuses: [4, 0, 0, -2, 0],
    allowedCollaterals: [],
  },
];

