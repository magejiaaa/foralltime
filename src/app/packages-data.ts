import type { Package } from "./packages-types"

export const packagesData: Package[] = [
    {
        id: "pkg001",
        name: "復刻禮包",
        description: "",
        isActive: true,
        pricingOptions: [
            {
                id: "price001",
                name: "月卡特惠盒",
                price: 28,
                description: "顏料*6",
            },
            {
                id: "price002",
                name: "畫材大禮包",
                price: 31,
                description: "顏料*10、鑽石*68",
            },
            {
                id: "price003",
                name: "畫廊禮包",
                price: 33,
                description: "顏料*1、鴿子券*1",
            },
        ],
    },
    {   // 新手限定+累充用
        id: "pkg002",
        name: "新手限定",
        description: "累充不夠的時候可以湊數的禮包",
        isActive: true,
        pricingOptions: [
            {
                id: "price004",
                name: "基礎版",
                price: 99,
                description: "包含基本道具和金幣",
            },
            {
                id: "price005",
                name: "豪華版",
                price: 299,
                description: "包含稀有道具和大量資源",
            },
            {
                id: "price006",
                name: "至尊版",
                price: 599,
                description: "包含傳說道具和專屬稱號",
            },
        ],
    }
]
