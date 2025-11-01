"use client"
import type React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
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
import type { Activity, SortOrder, ProcessedActivity, DisplayActivityItem } from "./activity-types"
import type { Package } from "./packages-types"
import { statusConfig } from "./activity-types"
import { activitiesData } from "./activities-data"
import { packagesData } from "./packages-data"
// 元件
import PackageCalculator from "@/components/PackageCalculator"
import { getStatusIcon } from "@/utils/getStatusIcon"
import BottomNav from "@/components/BottomNav"
import ActivityPackageBox from "@/components/ActivityPackageBox"
import FilterActivity from "@/components/FilterActivity"

const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc") // 預設最新在前
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMember, setSelectedMember] = useState<string>("all")
  // 大活動狀態勾選
  const [showMajorEventsOnly, setShowMajorEventsOnly] = useState(false)

  // 自動判斷活動狀態的函數 - 使用useCallback避免重複創建
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

  const [activities, setActivities] = useState<Activity[]>([])
  // 初始化數據
  useEffect(() => {
    const initializeData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // 模擬異步載入，避免阻塞UI
        await new Promise((resolve) => setTimeout(resolve, 100))

        setActivities(activitiesData)
        setPackages(packagesData)
        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing data:", err)
        setError("載入數據時發生錯誤")
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  // 處理活動數據，添加計算出的狀態
  const processedActivities = useMemo((): ProcessedActivity[] => {
    if (!activities.length) return []

    try {
      return activities.map((activity) => ({
        ...activity,
        calculatedStatus: getActivityStatus(activity),
      }))
    } catch (err) {
      console.error("Error processing activities:", err)
      return activities.map((activity) => ({ ...activity, calculatedStatus: activity.status }))
    }
  }, [activities, getActivityStatus])


  // 獲取子活動的函數
  const getChildrenActivities = useCallback(
    (parentActivity: Activity) => {
      if (!parentActivity.childrenActivities?.length) return []

      return parentActivity.childrenActivities
        .map((childId) => processedActivities.find((activity) => activity.id === childId))
        .filter(Boolean) as Activity[]
    },
    [processedActivities],
  )

  // 檢查是否為子活動
  const isChildActivity = useCallback(
    (activityId: string) => {
      return processedActivities.some((activity) => activity.childrenActivities?.includes(activityId))
    },
    [processedActivities],
  )

  // 獲取父活動
  const getParentActivity = useCallback(
    (childId: string) => {
      return processedActivities.find((activity) => activity.childrenActivities?.includes(childId))
    },
    [processedActivities],
  )


  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null)
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const [imageTooltipPosition, setImageTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; side: "left" | "right" }>({
    x: 0,
    y: 0,
    side: "right",
  })
  const [isMobile, setIsMobile] = useState(false)

  // 檢測是否為手機版
  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    const checkMobile = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setIsMobile(window.innerWidth < 768)
      }, 100)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => {
      window.removeEventListener("resize", checkMobile)
      clearTimeout(timeoutId)
    }
  }, [])
  // 可用年份列表
  const availableYears = useMemo(() => {
    if (!processedActivities.length) return []

    try {
      const years = new Set<number>()
      processedActivities.forEach((activity) => {
        if (!activity.startDate || !activity.endDate) return
        years.add(new Date(activity.startDate).getFullYear())
        years.add(new Date(activity.endDate).getFullYear())
      })
      const sortedYears = Array.from(years).sort()
      return sortOrder === "desc" ? sortedYears.reverse() : sortedYears
    } catch (err) {
      console.error("Error calculating available years:", err)
      return []
    }
  }, [processedActivities, sortOrder])


  // 從子元件接收的篩選結果
  const [displayActivities, setDisplayActivities] = useState<DisplayActivityItem[]>([])

  const handleDisplayActivitiesChange = useCallback((activities: DisplayActivityItem[]) => {
    setDisplayActivities(activities)
  }, [])



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
        setHoveredActivity(null)
        return
      }

      const rect = event.currentTarget.getBoundingClientRect()
      const viewportWidth = window.innerWidth

      // 決定懸浮視窗顯示在左側還是右側
      const side = rect.right > viewportWidth * 0.7 ? "left" : "right"

      // 計算位置
      const x = side === "right" ? rect.right + 10 : rect.left - 10
      const y = rect.top + rect.height / 2

      setTooltipPosition({ x, y, side })
      setHoveredActivity(activity.id)
    } catch (err) {
      console.error("Error handling activity hover:", err)
    }
  }, [])

  const handleImageHover = useCallback(
    (imageSrc: string | null, event?: React.MouseEvent) => {
      try {
        if (!imageSrc || !event || isMobile) {
          setHoveredImage(null)
          return
        }

        const rect = event.currentTarget.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        // 計算懸浮視窗位置，確保不超出螢幕
        let x = rect.right + 10
        let y = rect.top

        // 如果右側空間不足，顯示在左側
        if (x + 500 > viewportWidth) {
          x = rect.left - 510
        }

        // 如果下方空間不足，向上調整
        if (y + 500 > viewportHeight) {
          y = viewportHeight - 510
        }

        // 確保不超出螢幕頂部
        if (y < 10) {
          y = 10
        }

        setImageTooltipPosition({ x, y })
        setHoveredImage(imageSrc)
      } catch (err) {
        console.error("Error handling image hover:", err)
      }
    }, [isMobile])


  const [showAll, setShowAll] = useState(false)
  const defaultCount = 10
  const hasActiveFilters = selectedYear !== "all" || selectedCategory !== "all" || selectedMember !== "all" || showMajorEventsOnly
  const hoveredActivityData = hoveredActivity ? processedActivities.find((a) => a.id === hoveredActivity) : null
  
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
      const activitiesToShow = hasActiveFilters
        ? yearDisplayActivities
        : (showAll ? yearDisplayActivities : yearDisplayActivities.slice(0, defaultCount))

      if (yearDisplayActivities.length === 0) {
        return null // 如果該年份沒有符合篩選條件的活動，不顯示該年份
      }

      return (
        <div key={year} className="mb-8 relative">
          <div className="flex items-center gap-4 mb-4">
            <h3 className="text-2xl font-bold text-white">{year}年</h3>
            <Badge variant="secondary" className="bg-gray-700 text-gray-300">
              {yearDisplayActivities.length} 個活動
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
                        processedActivities={processedActivities}
                        packages={packages}
                      />
                    </div>
                  </div>
                
                  {/* 右側時間軸 */}
                  {!isMobile && (
                  <div className="flex-1 relative flex flex-col justify-center">
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
                </div>
              )
            })}
          </div>
          {/* 顯示更多按鈕 */}
          {!hasActiveFilters && !showAll && yearDisplayActivities.length > defaultCount && (
            <div className="flex justify-center mt-4">
              <Button
                onClick={() => setShowAll(true)}
                className="border border-blue-600 bg-transparent text-blue-600"
              >
                顯示全部
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
    [displayActivities, isMobile, getActivitySegments, handleActivityHover, handleImageHover, showAll, hasActiveFilters, processedActivities, packages],
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
              setError(null)
              setIsLoading(true)
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
            </ul>
            <PackageCalculator />
          </div>
        </div>
        <FilterActivity
          hasActiveFilters={hasActiveFilters}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedMember={selectedMember}
          setSelectedMember={setSelectedMember}
          showMajorEventsOnly={showMajorEventsOnly}
          setShowMajorEventsOnly={setShowMajorEventsOnly}
          statusConfig={statusConfig}
          getStatusIcon={getStatusIcon}
          availableYears={availableYears}
          processedActivities={processedActivities}
          isChildActivity={isChildActivity}
          getParentActivity={getParentActivity}
          getChildrenActivities={getChildrenActivities}
          onDisplayActivitiesChange={handleDisplayActivitiesChange}
          showAll={showAll}
          setShowAll={setShowAll}
          defaultCount={defaultCount}
        />
        {/* 甘特圖 */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl py-6 md:p-6 md:mb-8 relative">
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
      {/* 活動詳情懸浮視窗 */}
      {hoveredActivity && hoveredActivityData && (
        <div
          className="fixed z-[9999] bg-gray-900/95 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl max-w-sm pointer-events-none"
          style={{
            left: tooltipPosition.side === "right" ? `${tooltipPosition.x}px` : "auto",
            right: tooltipPosition.side === "left" ? `${window.innerWidth - tooltipPosition.x}px` : "auto",
            top: `${tooltipPosition.y}px`,
            transform: "translateY(-50%)",
          }}
        >
          <h4 className="font-bold mb-1">{hoveredActivityData.name}</h4>
          <p className="text-xs text-gray-400">
            繁中服：{hoveredActivityData.startDate} ~ {hoveredActivityData.endDate}
            <br />
            {hoveredActivityData.cnStartDate && hoveredActivityData.cnEndDate && (
              <span>中國服：{hoveredActivityData.cnStartDate} ~ {hoveredActivityData.cnEndDate}</span>
            )}
          </p>
          <p className="text-xs text-gray-400">狀態: {statusConfig[hoveredActivityData.calculatedStatus || hoveredActivityData.status].label}</p>
        </div>
      )}

      {/* 圖片懸浮視窗 */}
      {hoveredImage && (
        <div
          className="fixed z-[9998] pointer-events-none"
          style={{
            left: `${imageTooltipPosition.x}px`,
            top: `${imageTooltipPosition.y}px`,
          }}
        >
          <div className="bg-gray-900/95 backdrop-blur-sm rounded-lg p-2 shadow-2xl">
            <Image
              src={hoveredImage.replace("height=40&width=40", "height=auto&width=auto") || "/placeholder.svg"}
              alt="活動圖片預覽"
              width={0}
              height={0}
              sizes="(max-width: 500px) 100vw, 500px"
              className="max-w-[500px] max-h-[500px] w-auto h-auto object-cover rounded-lg"
              style={{ maxWidth: "500px", maxHeight: "500px" }}
              loading="lazy"
            />
          </div>
        </div>
      )}

      {/* 底部導航按鈕 */}
      <BottomNav
        processedActivities={processedActivities}
        activities={activities}
        selectedCategory={selectedCategory}
        selectedMember={selectedMember}
        showMajorEventsOnly={showMajorEventsOnly}
      />
    </div>
  )
}