export interface PricingOption {
    id: string
    name: string
    price: number
    description?: string
}

export interface Package {
    id: string
    name: string
    description?: string
    pricingOptions: PricingOption[]
    isActive: boolean
}
