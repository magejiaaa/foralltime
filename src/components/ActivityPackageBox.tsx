import { useState, useCallback, useMemo } from "react"
// icon
import {
  ShoppingBag,
  Plus,
  Minus,
} from "lucide-react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { Activity } from "../types/activity-types"
import type { Package, PricingOption } from "../types/packages-types"

import { calculateValuePerDraw } from "@/utils/packageCalculator"

interface ActivityPackageBoxProps {
  activity: Activity
  processedActivities: Activity[] // 用於篩選有使用的禮包
  packages: Package[] // 從父元件傳入所有禮包資料
}

export default function ActivityPackageBox({ activity, processedActivities, packages }: ActivityPackageBoxProps) {
  // 禮包折疊狀態
  const [expandedPackages, setExpandedPackages] = useState<Record<string, boolean>>({});

  // 根據每抽價值排序禮包資料
  const sortedPackages = useMemo(() => {
    const oneDrawValue = (option: PricingOption) => {
      return calculateValuePerDraw(option.price, option.totalDraws || 0, option.diamonds || 0, option.stamina || 0)
    }

    // 先找出所有在活動中使用的禮包ID
    const usedPackageIds = new Set(
      processedActivities
        .filter(activity => activity.packageId)
        .map(activity => activity.packageId)
        .filter(Boolean)
    )

    // 只處理有被使用的禮包
    return packages
      .filter(pkg => usedPackageIds.has(pkg.id))
      .map(pkg => ({
        ...pkg,
        pricingOptions: pkg.pricingOptions
          .map(option => ({
            ...option,
            oneDrawValue: oneDrawValue(option) // 儲存計算結果
          }))
          .sort((a, b) => (a.oneDrawValue || 0) - (b.oneDrawValue || 0))
      }))
      .sort((a, b) => {
        // 根據每個禮包中最便宜選項排序禮包
        const aMinValue = Math.min(...a.pricingOptions.map(option => option.oneDrawValue || Infinity))
        const bMinValue = Math.min(...b.pricingOptions.map(option => option.oneDrawValue || Infinity))
        return aMinValue - bMinValue
      })
  }, [packages, processedActivities])
  
  // 獲取活動關聯的禮包
  const getActivityPackage = useCallback((activity: Activity) => {
    if (!activity.packageId) return null
    
    return sortedPackages.find(pkg => pkg.id === activity.packageId)
  }, [sortedPackages])

  return (
    <>
      {(activity.calculatedStatus === "ongoing" || activity.calculatedStatus === "upcoming") &&
        activity.packageId && (
          () => {
            const activityPackage = getActivityPackage(activity)
            
            return activityPackage ? (
              <div className="mt-2 pt-2 border-t border-gray-700">
                <Collapsible open={!!expandedPackages[activity.packageId ?? ""]} 
                  onOpenChange={(open) =>
                    setExpandedPackages(prev => ({
                      ...prev,
                      [activity.packageId ?? ""]: open
                    }))
                  }
                >
                  <CollapsibleTrigger asChild>
                    <h5 className="font-medium text-sm text-green-300 flex items-center gap-2 cursor-pointer">
                      <ShoppingBag className="w-4 h-4" />
                      禮包推薦: {activityPackage.name}
                      {expandedPackages[activity.packageId ?? ""] ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </h5>
                  </CollapsibleTrigger>
                  <CollapsibleContent className={`
                        data-[state=open]:animate-[collapseHeight_0.5s_ease-in-out]
                        data-[state=closed]:animate-[expandHeight_0.5s_ease-in-out]
                    overflow-hidden mt-2`}>
                    {activityPackage.description && (
                      <p className="text-xs text-gray-300 mb-3">{activityPackage.description}</p>
                    )}
                    <div className="space-y-2">
                      {activityPackage.pricingOptions.map((option, index) => (
                        <div key={index} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{option.name}</span>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                                {[
                                  option.totalDraws && `顏料*${option.totalDraws}`,
                                  option.diamonds && `鑽石*${option.diamonds}`,
                                  option.stamina && `體力*${option.stamina}`
                                ].filter(Boolean).join("、")}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-green-400">
                                一抽${calculateValuePerDraw(
                                    option.price, 
                                    option.totalDraws || 0, 
                                    option.diamonds || 0, 
                                    option.stamina || 0
                                ).toFixed(1)}
                              </span>
                              <p className="text-xs text-gray-400 mt-1">${option.price}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
            </div>
          ) : null
        })()}
    </>
  )
}