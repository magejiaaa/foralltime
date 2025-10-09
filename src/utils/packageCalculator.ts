export const calculateValuePerDraw = (
    price: number,
    draws: number,
    diamonds: number = 0,
    stamina: number = 0
): number => {
    if (draws === 0 && diamonds === 0) return 0

    // 計算總價值（鑽石）
    const totalDiamondValue = diamonds + (draws * 150) + (stamina * 0.5)
    
    // 計算每抽價值
    const valuePerDraw = price / totalDiamondValue * 150

    return Math.max(0, valuePerDraw)
}