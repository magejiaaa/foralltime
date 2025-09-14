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
    },
    {
        id: "pkg003",
        name: "重返葉塞",
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
                id: "price004",
                name: "顏料鑽石箱",
                price: 30,
                description: "顏料*10、鑽石*980",
            },
            {
                id: "price002",
                name: "畫材大禮包",
                price: 31,
                description: "顏料*10、鑽石*68",
            }
        ],
    },
    {
        id: "pkg004",
        name: "新年活動",
        description: "[特惠顏料箱]僅可在網頁端購買，限購1次。[特惠顏料箱]與[限定超值百連]共享限購次數",
        isActive: true,
        pricingOptions: [
            {
                id: "price003",
                name: "10元禮包",
                price: 15,
                description: "鑽石*100、體力*60",
            },
            {
                id: "price012",
                name: "季旅專列",
                price: 17,
                description: "鑽石*7960",
            },
            {
                id: "price001",
                name: "鑽石連續包",
                price: 20,
                description: "鑽石*3280",
            },
            {
                id: "price004",
                name: "鑽石特惠包",
                price: 23,
                description: "鑽石*980",
            },
            {
                id: "price005",
                name: "顏料連續包",
                price: 23,
                description: "顏料*7、鑽石*450",
            },
            {
                id: "price006",
                name: "每日禮包連續包",
                price: 23,
                description: "顏料*21、鑽石*420",
            },
            {
                id: "price007",
                name: "印鑑禮包",
                price: 27,
                description: "顏料*1、鑽石*100",
            },
            {
                id: "price008",
                name: "顏料包",
                price: 27,
                description: "顏料*6、體力*60",
            },
            {
                id: "price009",
                name: "33元禮包",
                price: 29,
                description: "顏料*1、鑽石*20",
            },
            {
                id: "price010",
                name: "特惠顏料箱",
                price: 30,
                description: "顏料*66、鑽石*6480",
            },
            {
                id: "price002",
                name: "畫材大禮包",
                price: 31,
                description: "顏料*10、鑽石*68",
            },
            {
                id: "price011",
                name: "限定超值百連",
                price: 33,
                description: "顏料*100",
            }
        ],
    },
    {
        id: "pkg005",
        name: "瑰夢",
        isActive: true,
        pricingOptions: [
            {
                id: "price001",
                name: "10元禮包",
                price: 15,
                description: "鑽石*100、體力*60"
            },
            {
                id: "price002",
                name: "特殊顏料兌換券",
                price: 26,
                description: "顏料*84"
            },
            {
                id: "price003",
                name: "月卡特惠盒",
                price: 28,
                description: "顏料*6",
            },
            {
                id: "price005",
                name: "每日禮包",
                price: 29,
                description: "顏料*1、鑽石*10",
            },
            {
                id: "price004",
                name: "畫材大禮包",
                price: 31,
                description: "顏料*10、鑽石*68",
            }
        ]
    },
    {
        id: "pkg006",
        name: "霧隱都市",
        description: "",
        isActive: true,
        pricingOptions: [
            {
                id: "price003",
                name: "10元禮包",
                price: 15,
                description: "鑽石*100、體力*60",
            },
            {
                id: "price004",
                name: "鑽石特惠包",
                price: 23,
                description: "鑽石*980",
            },
            {
                id: "price005",
                name: "鑽石大禮包",
                price: 23,
                description: "顏料*7、鑽石*450",
            },
            {
                id: "price009",
                name: "33元禮包",
                price: 29,
                description: "顏料*1、鑽石*20",
            },
            {
                id: "price002",
                name: "畫材大禮包",
                price: 31,
                description: "顏料*10、鑽石*68",
            }
        ],
    },
]
