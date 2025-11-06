import type { Package } from "./packages-types"

// 定義共用的禮包配置
const commonPackages = {
    monthlySpecialBox: {
        name: "月卡特惠盒",
        price: 170,
        totalDraws: 6,
    },
    artMaterialGiftPack: {
        name: "畫材大禮包",
        price: 330,
        totalDraws: 10,
        diamonds: 68,
    },
    tenYuanGiftPack: {
        name: "10元禮包",
        price: 10,
        diamonds: 100,
        stamina: 60,
    },
    paintGiftPack: {
        name: "顏料禮包",
        price: 33,
        totalDraws: 1,
    },
    thirtyThreeYuanGiftPack: {
        name: "33元禮包",
        price: 33,
        totalDraws: 1,
        diamonds: 20,
    },
    limitedValueHundredDraw: {
        name: "限定超值百連",
        price: 3300,
        totalDraws: 100,
    },
    diamondSpecialPackage: {
        name: "鑽石特惠包",
        price: 150,
        diamonds: 980,
    },
} as const

export const packagesData: Package[] = [
    {
        id: "pkg001",
        name: "復刻禮包",
        description: "",
        isActive: true,
        pricingOptions: [
            commonPackages.paintGiftPack,
            commonPackages.monthlySpecialBox,
            commonPackages.artMaterialGiftPack,
        ],
    },
    {
        id: "pkg003",
        name: "潮汐瓦解",
        description: "",
        isActive: true,
        pricingOptions: [
            commonPackages.tenYuanGiftPack,
            commonPackages.monthlySpecialBox,
            commonPackages.thirtyThreeYuanGiftPack,
            commonPackages.artMaterialGiftPack,
        ],
    },
    {
        id: "pkg004",
        name: "新年活動",
        description: "[特惠顏料箱]僅可在網頁端購買，限購1次。[特惠顏料箱]與[限定超值百連]共享限購次數",
        isActive: true,
        pricingOptions: [
            commonPackages.tenYuanGiftPack,
            {
                name: "季旅專列",
                price: 920,
                diamonds: 7960,
            },
            {
                name: "鑽石連續包",
                price: 430,
                diamonds: 3280,
            },
            commonPackages.diamondSpecialPackage,
            {
                name: "顏料連續包",
                price: 230,
                totalDraws: 7,
                diamonds: 450,
            },
            {
                name: "每日禮包連續包",
                price: 693,
                totalDraws: 21,
                diamonds: 420,
            },
            {
                name: "印鑑禮包",
                price: 45,
                totalDraws: 1,
                diamonds: 100,
            },
            {
                name: "顏料包",
                price: 170,
                totalDraws: 6,
                stamina: 60,
            },
            commonPackages.thirtyThreeYuanGiftPack,
            {
                name: "特惠顏料箱",
                price: 3290,
                totalDraws: 66,
                diamonds: 6480,
            },
            commonPackages.artMaterialGiftPack,
            commonPackages.limitedValueHundredDraw,
        ],
    },
    {
        id: "pkg005",
        name: "瑰夢",
        isActive: true,
        pricingOptions: [
            commonPackages.tenYuanGiftPack,
            {
                name: "Q版裝扮連續禮包",
                price: 230,
                totalDraws: 5,
                diamonds: 450,
            },
            commonPackages.monthlySpecialBox,
            {
                name: "每日禮包",
                price: 33,
                totalDraws: 1,
                diamonds: 20,
            },
            commonPackages.artMaterialGiftPack,
            {
                name: "服裝優惠折扣包(330-270)",
                price: 60,
                totalDraws: 4,
            },
        ]
    },
    {
        id: "pkg006",
        name: "霧隱都市",
        description: "",
        isActive: true,
        pricingOptions: [
            commonPackages.tenYuanGiftPack,
            {
                name: "顏料特惠包",
                price: 430,
                totalDraws: 14,
                diamonds: 880,
                stamina: 280
            },
            {
                name: "顏料連續包",
                price: 230,
                totalDraws: 7,
                diamonds: 450
            },
            commonPackages.diamondSpecialPackage,
            {
                name: "鑽石大禮包",
                price: 230,
                totalDraws: 7,
                diamonds: 450
            },
            commonPackages.thirtyThreeYuanGiftPack,
            commonPackages.artMaterialGiftPack,
            commonPackages.limitedValueHundredDraw,
        ],
    },
    {
        id: "pkg007",
        name: "主線預購禮包",
        description: "",
        isActive: true,
        pricingOptions: [
            {
                name: "主線預購顏料禮包",
                price: 230,
                totalDraws: 10
            }
        ],
    },
]
