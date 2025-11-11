"use client"
import type React from "react"
import { useEffect, useCallback } from "react"
import Image from 'next/image'
// icon
import {
  Clock,
  Loader2,
  SquareArrowOutUpRight,
  Pointer
} from "lucide-react"
// UI元件
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// 型別與資料
import type { Activity } from "../types/activity-types"
import { statusConfig } from "../types/activity-types"
import { activitiesData } from "./activities-data"
import { packagesData } from "./packages-data"
import { cardDataList } from "./card-data"
// 元件
import PackageCalculator from "@/components/PackageCalculator"
import { getStatusIcon } from "@/utils/getStatusIcon"
import BottomNav from "@/components/BottomNav"
import ActivityPackageBox from "@/components/ActivityPackageBox"
import FilterActivity from "@/components/FilterActivity"
import FloatingWindow from "@/components/FloatingWindow"

// Redux imports
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import {
  setActivities,
  setProcessedActivities,
  setPackages,
  setLoading,
  setError,
} from '@/store/slices/activitiesSlice'
import {
  setHoveredActivity,
  setHoveredImage,
  setImageTooltipPosition,
  setTooltipPosition,
  setIsMobile,
  setShowAll
} from '@/store/slices/uiSlice'
import { 
  selectAvailableYears, 
  hasChildActivitiesSelector 
} from '@/store/selectors/activitySelectors'

const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

export default function Component() {
  const dispatch = useAppDispatch()
  
  // 從 store 獲取所有必要的資料
  const { activities, isLoading, error } = useAppSelector(state => state.activities)
  const { selectedYear } = useAppSelector(state => state.filters)
  const availableYears = useAppSelector(selectAvailableYears)
  // 最終篩選活動顯示
  const displayActivities = useAppSelector(hasChildActivitiesSelector)
  const { isMobile, showAll } = useAppSelector(state => state.ui)

  const defaultCount = 10

  // 根據日期自動判斷活動狀態 - 使用useCallback避免重複創建
  const getActivityStatus = useCallback((activity: Activity): Activity["status"] => {
    try {
      const today = new Date()
      today.setHours(9, 0, 0, 0) // 設定為當天開始時間

      const startDate = new Date(activity.startDate)
      startDate.setHours(9, 0, 0, 0)

      const endDate = new Date(activity.endDate)
      endDate.setHours(4, 0, 0, 0) // 設定為結束日期的早上4:00

      if (endDate < today) {
        return "completed" // 已結束
      } else if (startDate <= today && today <= endDate) {
        return "ongoing" // 進行中
      } else if (startDate === null || endDate === null) {
        return "upcoming" // 即將開始(沒有時間)
      }

      return activity.status // 預設返回原狀態
    } catch (err) {
      console.error("Error calculating activity status:", err)
      return activity.status
    }
  }, [])

  // 初始化數據，丟資料進store
  useEffect(() => {
    const initializeData = async () => {
      try {
        dispatch(setLoading(true))
        dispatch(setError(null))

        await new Promise((resolve) => setTimeout(resolve, 100))

        dispatch(setActivities(activitiesData))
        dispatch(setPackages(packagesData))
      } catch (err) {
        console.error("Error initializing data:", err)
        dispatch(setError("載入數據時發生錯誤"))
      }
    }

    initializeData()
    dispatch(setLoading(false))
  }, [dispatch])

  // 根據日期並設定每個活動的計算後狀態 getActivityStatus
  useEffect(() => {
    if (!activities.length) return

    try {
      const processed = activities.map((activity) => ({
        ...activity,
        calculatedStatus: getActivityStatus(activity),
      }))
      dispatch(setProcessedActivities(processed))
    } catch (err) {
      console.error("Error processing activities:", err)
    }
  }, [activities, getActivityStatus, dispatch])

  // 檢測是否為手機版
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const checkMobile = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        dispatch(setIsMobile(window.innerWidth < 768))
      }, 100)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearTimeout(timeoutId)
    }
  }, [dispatch])


  // 創建活動時間軸段落
  const getActivitySegments = useCallback((activity: Activity, year: number) => {
    try {
      const startDate = new Date(activity.startDate)
      const endDate = new Date(activity.endDate)
      const yearStart = new Date(year, 0, 1)
      const yearEnd = new Date(year, 11, 31)

      const segmentStart = new Date(Math.max(startDate.getTime(), yearStart.getTime()))
      const segmentEnd = new Date(Math.min(endDate.getTime(), yearEnd.getTime()))

      const startMonth = segmentStart.getMonth()
      const endMonth = segmentEnd.getMonth()
      const startDay = segmentStart.getDate()
      const endDay = segmentEnd.getDate()

      const daysInStartMonth = new Date(year, startMonth + 1, 0).getDate()
      const daysInEndMonth = new Date(year, endMonth + 1, 0).getDate()

      // 計算在相關月份範圍內的位置
      const startPosition = (startMonth * 100) / 12 + ((startDay - 1) / daysInStartMonth) * (100 / 12)
      const endPosition = (endMonth * 100) / 12 + (endDay / daysInEndMonth) * (100 / 12)
      const width = endPosition - startPosition

      const isFirstSegment = startDate.getFullYear() === year
      const isLastSegment = endDate.getFullYear() === year
      const isMultiYear = startDate.getFullYear() !== endDate.getFullYear()

      return {
        startPosition,
        width,
        isFirstSegment,
        isLastSegment,
        isMultiYear,
      }
    } catch (err) {
      console.error("Error calculating activity segments:", err)
      return {
        startPosition: 0,
        width: 10,
        isFirstSegment: true,
        isLastSegment: true,
        isMultiYear: false,
      }
    }
  }, [])

  const handleActivityHover = useCallback((activity: Activity | null, event?: React.MouseEvent) => {
    try {
      if (!activity || !event) {
        dispatch(setHoveredActivity(null))
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const side = rect.right > viewportWidth * 0.7 ? "left" : "right"
      const x = side === "right" ? rect.right + 10 : rect.left - 10
      const y = rect.top + rect.height / 2

      dispatch(setTooltipPosition({ x, y, side }))
      dispatch(setHoveredActivity(activity.id))
    } catch (err) {
      console.error("Error handling activity hover:", err)
    }
  }, [dispatch])

  const handleImageHover = useCallback((imageSrc: string | null, event?: React.MouseEvent) => {
    try {
      if (!imageSrc || !event || isMobile) {
        dispatch(setHoveredImage(null))
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      let x = rect.right + 10
      let y = rect.top

      if (x + 500 > viewportWidth) {
        x = rect.left - 510
      }

      if (y + 500 > viewportHeight) {
        y = viewportHeight - 510
      }

      if (y < 10) {
        y = 10
      }

      dispatch(setImageTooltipPosition({ x, y }))
      dispatch(setHoveredImage(imageSrc))
    } catch (err) {
      console.error("Error handling image hover:", err)
    }
  }, [isMobile, dispatch])


  const renderYearTimeline = useCallback(
  (year: number) => {
    try {    
      // 計算剩餘時間的函數
      const getRemainingTime = (endDate: string) => {
        try {
          const now = new Date()
          const end = new Date(endDate)
          end.setHours(4, 0, 0, 0) // 設定為結束日期的早上4:00

          const diffMs = end.getTime() - now.getTime()

          if (diffMs <= 0) {
            return null // 已結束
          }

          const days = Math.floor(diffMs / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))

          return { days, hours }
        } catch (err) {
          console.error("Error calculating remaining time:", err)
          return null
        }
      }
      // 獲取該年份的顯示活動（包含父子關係）
      const yearDisplayActivities = displayActivities.filter(({ activity }) => {
        const startYear = new Date(activity.startDate).getFullYear()
        // 只在活動開始的年份顯示，避免跨年活動重複顯示
        return startYear === year
      })
      // 控制顯示筆數
      const activitiesToShow = showAll 
        ? yearDisplayActivities 
        : yearDisplayActivities.slice(0, defaultCount)

      if (yearDisplayActivities.length === 0) {
        return null // 如果該年份沒有符合篩選條件的活動，不顯示該年份標題
      }

      return (
        <div key={year} className="mb-8 relative">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-2xl font-bold text-white">{year}年</h3>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              {!showAll && yearDisplayActivities.length > defaultCount
                ? `${defaultCount} / ${yearDisplayActivities.length} 個活動`
                : `${yearDisplayActivities.length} 個活動`
              }
            </Badge>
          </div>

          {/* 桌面版時間軸標題行 */}
          {!isMobile && (
          <div className="flex mb-4 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10 pt-2 pb-2 border-b border-gray-600">
            <div className="w-80 flex-shrink-0 text-center text-sm text-gray-300 border-r border-gray-600 pr-4">
              活動資訊
            </div>
            <div className="flex-1 flex">
              {months.map((month, index) => (
                <div
                  key={index}
                  className="flex-1 text-center text-sm text-gray-300 border-r border-gray-600 last:border-r-0"
                >
                  {month}
                </div>
              ))}
            </div>
          </div>
          )}

          {/* 活動列表 */}
          <div className="space-y-3">
            {activitiesToShow.map(({ activity, isChild }) => {
              const segment = getActivitySegments(activity, year)
              const getStatusConfig = (status: string) => {
                    const validStatuses = ['completed', 'ongoing', 'upcoming'] as const;
                    return validStatuses.includes(status as typeof validStatuses[number]) 
                      ? statusConfig[status as keyof typeof statusConfig]
                      : statusConfig.upcoming;
                  };
              const config = getStatusConfig(activity.calculatedStatus || activity.status)

              const Icon = getStatusIcon(config.icon)

              // SSR 資料
              const cardData = cardDataList.find(card => card.activityId.includes(activity.id))
              const startMonth = new Date(activity.startDate).getMonth() + 1 // 1~12
              const isLeft = startMonth <= 6

              return (
                <div
                  key={`${activity.id}-${year}`} data-id={activity.id}
                  className={`flex flex-col md:flex-row rounded-lg backdrop-blur-sm min-h-[80px] ${
                      isChild ? "ml-1 border-l-4 border-blue-400/50" : ""
                    } ${activity.calculatedStatus === "ongoing" ? "bg-gray-700/50" : "bg-gray-800/30"}`}
                >
                  {/* 左側活動資訊欄 */}
                  <div
                    className={`w-full md:w-80 ${isChild ? "md:w-[312px]" : ""} flex-shrink-0 p-4 md:border-r md:border-gray-600/50 flex md:items-center gap-4`}
                  >
                    <div className="relative">
                      <Image
                        src={activity.image || "/placeholder.svg"}
                        alt={activity.name}
                        width={100}
                        height={100}
                        className={`${isMobile ? "w-20 h-20" : "w-12 h-12"} rounded-lg object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all`}
                        onMouseEnter={(e) => handleImageHover(activity.image, e)}
                        onMouseLeave={() => handleImageHover(null)}
                        onError={(e) => {
                            // 圖片載入失敗時的處理
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={activity.url} target="_blank" className="text-white font-medium text-sm truncate flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-white flex-shrink-0" />
                          <h4
                            className={`text-white font-medium ${isMobile ? "text-sm" : "text-sm"} truncate ${isChild ? "text-gray-300" : ""}`}
                          >
                            {activity.name}
                          </h4>
                          <div className="text-gray-400 text-xs border border-gray-400 px-1 py-0.5 rounded-full flex-shrink-0 flex items-center gap-1">
                            wiki
                            <SquareArrowOutUpRight className="w-3 h-3 " />
                          </div>
                      </a>
                      {/* 進行中活動的剩餘時間顯示 */}
                      {isMobile && activity.calculatedStatus === "ongoing" &&
                        (() => {
                          const remaining = getRemainingTime(activity.endDate)
                          return remaining ? (
                            <div
                              className="text-xs text-orange-300 font-medium bg-gray-900/80 px-2 py-1 rounded backdrop-blur-sm flex items-center w-fit"
                            >
                              <span className="truncate">
                                剩餘 {remaining.days > 0 ? `${remaining.days}日` : ""}
                                {remaining.hours}小時
                              </span>
                            </div>
                          ) : null
                        })()}
                        
                      <p
                        className={`text-gray-300 ${isMobile ? "text-xs" : "text-xs"} leading-relaxed line-clamp-2 mb-1`}
                      >
                        {new Date(activity.startDate).getMonth() + 1}/{new Date(activity.startDate).getDate()} -{" "}
                        {new Date(activity.endDate).getMonth() + 1}/{new Date(activity.endDate).getDate()}
                      </p>
                      <p className="flex items-center gap-2 text-xs">
                        {/* 類別標籤 */}
                        {activity.category && (
                          <span
                            className={`text-gray-300`}
                          >{activity.category ? `${activity.category.join("、")}` : null}</span>
                        )}
                        {activity.category && activity.member && <span className="text-gray-400">|</span>}
                        {/* 成員列表 */}
                        {activity.member && (
                          <span className="text-gray-400">
                            {activity.member ? `${activity.member.join("、")}` : null}
                          </span>
                        )}
                      </p>
                      {/* 狀態標籤 */}
                      {isMobile && (
                        <div className="flex items-center gap-2 mt-1">
                          <div
                            className={`w-2 h-2 ${config.color} rounded-full flex-shrink-0 ${
                              activity.calculatedStatus === "ongoing" ? "animate-pulse" : ""
                            }`}
                          ></div>
                          <span className="text-gray-400 text-xs">{config.label}</span>
                        </div>
                      )}
                      {/* 關聯方案 */}
                      <ActivityPackageBox 
                        activity={activity}
                      />
                    </div>
                  </div>
                
                  {/* 右側時間軸 */}
                  <div className="flex-1 relative items-center">
                    {!isMobile && (
                    <div className="flex flex-col justify-center h-full">
                      <div className={`relative h-8 flex items-center justify-center`}>
                        <div
                          className={`absolute h-8 ${config.color} rounded-lg flex items-center px-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                            activity.calculatedStatus === "ongoing" ? "animate-pulse" : ""
                          } ${
                            segment.isMultiYear
                              ? segment.isFirstSegment
                                ? "rounded-r-none"
                                : segment.isLastSegment
                                  ? "rounded-l-none"
                                  : "rounded-none"
                              : ""
                          }`}
                          style={{
                            left: `${segment.startPosition}%`,
                            width: `${segment.width}%`,
                          }}
                          onMouseEnter={(e) => handleActivityHover(activity, e)}
                          onMouseLeave={() => handleActivityHover(null)}
                        >
                          <Pointer className="w-3 h-3 text-white flex-shrink-0" />
                        </div>
                      </div>
                      {/* 進行中活動的剩餘時間顯示 */}
                      {activity.calculatedStatus === "ongoing" &&
                        (() => {
                          const remaining = getRemainingTime(activity.endDate)
                          return remaining ? (
                            <div
                              className="absolute text-xs text-orange-300 font-medium bg-gray-900/80 px-2 py-1 rounded backdrop-blur-sm"
                              style={{
                                left: `${segment.startPosition}%`,
                                width: `${segment.width}%`,
                                top: isMobile ? "calc(50% + 20px)" : "calc(50% + 24px)",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                minWidth: "fit-content",
                              }}
                            >
                              <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
                              <span className="truncate">
                                剩餘 {remaining.days > 0 ? `${remaining.days}日` : ""}
                                {remaining.hours}小時
                              </span>
                            </div>
                          ) : null
                        })()}
                    </div>
                    )}
                    {/* 活動SSR */}
                    {cardData && Array.isArray(cardData.item) &&(
                    <div className={`md:absolute p-2 flex flex-wrap gap-1 md:w-1/2 md:top-1/2 md:-translate-y-1/2 ${isLeft ? "right-1 justify-end" : "left-1"}`}>
                      {cardData.item.map((item, idx) => (
                        <Image
                          key={item.image + idx}
                          src={item.image}
                          alt={item.name}
                          width={40}
                          height={40}
                          className={`rounded object-cover w-10 h-10`}
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg"
                          }}
                          referrerPolicy="no-referrer"
                          crossOrigin="anonymous"
                          unoptimized
                        />
                      ))}
                    </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
          {/* 顯示更多按鈕 */}
          {!showAll && yearDisplayActivities.length > defaultCount && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => { 
                  dispatch(setShowAll(true))
                }}
                className="border border-blue-600 bg-transparent text-blue-600"
              >
                顯示剩餘 {yearDisplayActivities.length - defaultCount} 個活動
              </Button>
            </div>
          )}
        </div>
      )
    } catch (err) {
        console.error("Error rendering year timeline:", err)
        return (
          <div key={year} className="mb-8 relative">
            <div className="text-red-400 text-center py-4">載入 {year} 年數據時發生錯誤</div>
          </div>
        )
      }
    },
    [displayActivities, isMobile, getActivitySegments, handleActivityHover, handleImageHover, showAll, dispatch],
  )

  // Loading 狀態
  if (isLoading) {
    return (
      <div className="min-h-screen p-2 md:p-4 flex items-center justify-center" style={{ backgroundColor: "#16192c" }}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <div className="text-white text-lg mb-2">載入中...</div>
          <div className="text-gray-400 text-sm">正在準備活動數據</div>
        </div>
      </div>
    )
  }

  // 錯誤狀態
  if (error) {
    return (
      <div className="min-h-screen p-2 md:p-4 flex items-center justify-center" style={{ backgroundColor: "#16192c" }}>
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Button
            onClick={() => {
              dispatch(setError(null))
              dispatch(setLoading(true))
              window.location.reload()
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            重新載入
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pb-20 md:pb-4" style={{ backgroundColor: "#16192c" }}>
      <div className="max-w-7xl mx-auto">
        {/* 標題和篩選器 */}
        <div className="md:mb-8 flex flex-wrap justify-center md:justify-between md:mx-6">
          <div className="flex flex-wrap justify-center items-center">
            <Image width={200} height={166} priority={true} className="w-[100px] h-[83px]" src="/logo.png" alt="" />
            <h1 className="text-3xl md:text-4xl font-bold text-white text-center">繁中服活動列表</h1>
          </div>
          <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-10 my-6 justify-center">
            <ul className="text-gray-400 text-xs list-decimal pl-4">
              <li>五人大活動的定義為全員SSR，小活動只會顯示該活動有SSR角色的標籤</li>
              <li>活動類型參照中國服wiki分類</li>
              <li>禮包只推薦一抽$33以內的選項<br />計算方式：1顏料=150鑽、1體力=0.5鑽，其他材料不計算</li>
              <li>SSR卡片資料建置中</li>
            </ul>
            <PackageCalculator />
          </div>
        </div>
        <FilterActivity
          statusConfig={statusConfig}
          getStatusIcon={getStatusIcon}
        />
        {/* 甘特圖 */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl py-6 md:p-6 md:mb-8 relative">z
          {displayActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">沒有找到符合條件的活動</div>
              <div className="text-gray-500 text-sm">請調整篩選條件或新增活動</div>
            </div>
          ) : selectedYear === "all" ? (
            availableYears.map((year) => renderYearTimeline(year))
          ) : (
            renderYearTimeline(Number.parseInt(selectedYear))
          )}
        </div>
        
        <p className="text-gray-400 text-center text-xs mt-4">
          所有素材與活動資訊均來自官網，版權為時空中的繪旅人官方所有。<br />
          尚未開放活動資訊與圖片來源為時空中的繪旅人wiki。
        </p>
      </div>

      {/* 浮動視窗 */}
      <FloatingWindow/>

      {/* 底部導航按鈕 */}
      <BottomNav/>
    </div>
  )
}