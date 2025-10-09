"use client"
import type React from "react"
import { useState, useCallback } from "react"
import { Calculator } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import Image from 'next/image'
import { calculateValuePerDraw as utilCalculateValuePerDraw } from "@/utils/packageCalculator"

interface PackageCalculatorProps {
    className?: string
}

export default function PackageCalculator({ className }: PackageCalculatorProps) {

    // 新增計算機相關狀態
    const [isCalculatorOpen, setIsCalculatorOpen] = useState(false)
    const [calculatorInputs, setCalculatorInputs] = useState({
        packagePrice: '', // 禮包價格
        totalDraws: '',   // 總抽數
        diamonds: '',     // 鑽石數量
        stamina: '',      // 體力數量
    })

    // 計算每抽價值的函數
    const calculateValuePerDraw = useCallback(() => {
        const price = parseFloat(calculatorInputs.packagePrice) || 0
        const draws = parseFloat(calculatorInputs.totalDraws) || 0
        const diamonds = parseFloat(calculatorInputs.diamonds) || 0
        const stamina = parseFloat(calculatorInputs.stamina) || 0

        return utilCalculateValuePerDraw(price, draws, diamonds, stamina)
    }, [calculatorInputs])

    // 重置計算機
    const resetCalculator = useCallback(() => {
        setCalculatorInputs({
            packagePrice: '',
            totalDraws: '',
            diamonds: '',
            stamina: '',
        })
    }, [])

    // 處理輸入變更
    const handleCalculatorInputChange = useCallback((field: string, value: string) => {
        setCalculatorInputs(prev => ({
        ...prev,
        [field]: value
        }))
    }, [])

    return (
        <>
        {/* 禮包CP值計算機按鈕 */}
        <Dialog open={isCalculatorOpen} onOpenChange={setIsCalculatorOpen}>
            <DialogTrigger asChild>
                <Button className={`bg-gray-800/30 text-gray-400 flex items-center gap-2 flex-col h-auto hover:bg-gray-800/50 text-xs ${className}`}>
                <Image src="/com_icon_146.png" alt="" className="w-10 h-10" width={40} height={40} />
                禮包CP值計算機
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-600 text-white md:max-w-md">
                <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-green-400">
                    <Calculator className="w-5 h-5" />
                    禮包CP值計算機
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                    幫助你做出最佳購買決策
                </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                <div className="text-xs text-gray-400 bg-gray-800/50 p-3 rounded">
                    <p className="mb-2">計算公式：</p>
                    <p>• 1顏料 = 150鑽石</p>
                    <p>• 1體力 = 0.5鑽石</p>
                    <p>• 顏料與鑽石需擇一填寫，如果只填體力不計算</p>
                    <p className="mt-2">每抽價值 = 禮包價格 ÷ 總價值以顏料為單位</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div>
                    <Label htmlFor="packagePrice" className="text-white text-sm">
                        禮包價格 ($)
                    </Label>
                    <Input
                        id="packagePrice"
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="例：990"
                        value={calculatorInputs.packagePrice}
                        onChange={(e) => handleCalculatorInputChange('packagePrice', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                    />
                    </div>
                    
                    <div>
                    <Label htmlFor="totalDraws" className="text-white text-sm">
                        顏料數量
                    </Label>
                    <Input
                        id="totalDraws"
                        type="number"
                        placeholder="例：30"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={calculatorInputs.totalDraws}
                        onChange={(e) => handleCalculatorInputChange('totalDraws', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                    />
                    </div>
                </div>

                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-300">額外道具（可選）</h4>
                    
                    <div>
                    <Label htmlFor="diamonds" className="text-white text-sm">
                        鑽石數量
                    </Label>
                    <Input
                        id="diamonds"
                        type="number"
                        placeholder="例：3000"
                        value={calculatorInputs.diamonds}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        onChange={(e) => handleCalculatorInputChange('diamonds', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                    />
                    </div>
                    
                    <div>
                    <Label htmlFor="stamina" className="text-white text-sm">
                        體力數量
                    </Label>
                    <Input
                        id="stamina"
                        type="number"
                        placeholder="例：500"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={calculatorInputs.stamina}
                        onChange={(e) => handleCalculatorInputChange('stamina', e.target.value)}
                        className="bg-gray-800 border-gray-600 text-white"
                    />
                    </div>
                </div>

                {/* 計算結果 */}
                <div className="bg-gray-800/50 p-4 rounded">
                    <div className="text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                        ${calculateValuePerDraw().toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-300">每抽價值</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <Button
                    onClick={resetCalculator}
                    variant="outline"
                    className="flex-1 bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
                    >
                    重置
                    </Button>
                    <Button
                    onClick={() => setIsCalculatorOpen(false)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                    >
                    關閉
                    </Button>
                </div>
                </div>
            </DialogContent>
        </Dialog>
        </>
    )
}