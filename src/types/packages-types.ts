export interface PricingOption {
    name: string
    price: number
    totalDraws?: number
    diamonds?: number
    stamina?: number
    oneDrawValue?: number
}

export interface Package {
    id: string
    name: string
    description?: string
    pricingOptions: PricingOption[]
    isActive: boolean
}
