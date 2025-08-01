"use client"
import type React from "react"
import { useState, useMemo, useEffect, useCallback } from "react"
import {
  Calendar,
  Plus,
  Clock,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  ArrowUp,
  ArrowDown,
  Filter,
  User,
  Loader2,
  ShoppingBag,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Activity } from "./activity-types"
import { activitiesData } from "./activities-data"
import { statusConfig } from "./activity-types"
import Image from 'next/image'
import type { Package } from "./packages-types"
import { packagesData } from "./packages-data"

const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
type SortOrder = "desc" | "asc"
type ProcessedActivity = Activity & {
  calculatedStatus?: Activity["status"]
}

export default function Component() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [packages, setPackages] = useState<Package[]>([])
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

  // 獲取活動關聯的禮包
  const getActivityPackage = useCallback(
    (activity: Activity) => {
      if (!activity.packageId) return null
      return packages.find((pkg) => pkg.id === activity.packageId) || null
    },
    [packages],
  )

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

  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedMember, setSelectedMember] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc") // 預設最新在前
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
  // 活動類別列表
  const availableCategories = useMemo(() => {
    if (!processedActivities.length) return []

    try {
      const categories = new Set<string>()
      processedActivities.forEach((activity) => {
        if (activity.category) {
          categories.add(activity.category)
        }
      })
      return Array.from(categories).sort()
    } catch (err) {
      console.error("Error calculating available categories:", err)
      return []
    }
  }, [processedActivities])

  // 角色列表
  const availableMembers = useMemo(() => {
    if (!processedActivities.length) return []

    try {
      const members = new Set<string>()
      processedActivities.forEach((activity) => {
        if (activity.member) {
          activity.member.forEach((member) => members.add(member))
        }
      })
      return Array.from(members).sort()
    } catch (err) {
      console.error("Error calculating available members:", err)
      return []
    }
  }, [processedActivities])

  // 排序活動
  const sortedActivities = useMemo(() => {
    const sorted = [...processedActivities].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })
    return sorted
  }, [processedActivities, sortOrder])

  const filteredActivities = useMemo(() => {
    if (!processedActivities.length) return []

    // 先篩選所有活動（不區分父子）
    let allFilteredActivities = sortedActivities
    try {
      // 年份篩選
      if (selectedYear !== "all") {
        allFilteredActivities = allFilteredActivities.filter((activity) => {
          const startYear = new Date(activity.startDate).getFullYear()
          const endYear = new Date(activity.endDate).getFullYear()
          return startYear <= Number.parseInt(selectedYear) && endYear >= Number.parseInt(selectedYear)
        })
      }    
    
      // 類型篩選
      if (selectedCategory !== "all") {
        allFilteredActivities = allFilteredActivities.filter((activity) => activity.category === selectedCategory)
      }
      // 角色篩選
      if (selectedMember !== "all") {
        allFilteredActivities = allFilteredActivities.filter((activity) => {
          return activity.member && activity.member.some((member) => member === selectedMember)
        })
      }
      // 獲取符合條件的活動ID集合
      const filteredActivityIds = new Set(allFilteredActivities.map((activity) => activity.id))

      // 構建最終顯示的父活動列表
      const finalParentActivities = new Set<string>()

      allFilteredActivities.forEach((activity) => {
        if (isChildActivity(activity.id)) {
          // 如果是子活動符合條件，也要包含其父活動
          const parent = getParentActivity(activity.id)
          if (parent) {
            finalParentActivities.add(parent.id)
          }
        } else {
          // 如果是父活動符合條件，直接添加
          finalParentActivities.add(activity.id)
        }
      })

      // 返回所有需要顯示的父活動
      return sortedActivities.filter(
        (activity) => finalParentActivities.has(activity.id) && !isChildActivity(activity.id),
      )
    } catch (err) {
      console.error("Error filtering activities:", err)
      return sortedActivities.filter((activity) => !isChildActivity(activity.id))
    }
  }, [sortedActivities, selectedYear, selectedCategory, selectedMember, isChildActivity, getParentActivity, processedActivities.length])

  
  // 獲取要顯示的活動列表（包含父活動和子活動的層級結構）
  const displayActivities = useMemo(() => {
    const result: Array<{ activity: Activity; isChild: boolean; level: number }> = []

    // 先篩選所有活動（不區分父子）
    let allFilteredActivities = sortedActivities

    // 年份篩選
    if (selectedYear !== "all") {
      allFilteredActivities = allFilteredActivities.filter((activity) => {
        const startYear = new Date(activity.startDate).getFullYear()
        const endYear = new Date(activity.endDate).getFullYear()
        return startYear <= Number.parseInt(selectedYear) && endYear >= Number.parseInt(selectedYear)
      })
    }

    // 類型篩選
    if (selectedCategory !== "all") {
      allFilteredActivities = allFilteredActivities.filter((activity) => activity.category === selectedCategory)
    }

    // 獲取符合條件的活動ID集合
    const filteredActivityIds = new Set(allFilteredActivities.map((activity) => activity.id))

    filteredActivities.forEach((parentActivity) => {
      // 添加父活動
      result.push({ activity: parentActivity, isChild: false, level: 0 })

      // 檢查子活動
      const children = getChildrenActivities(parentActivity)
      children.forEach((childActivity) => {
        // 只顯示符合篩選條件的子活動，或者父活動符合條件時顯示所有子活動
        const parentMatches = filteredActivityIds.has(parentActivity.id)
        const childMatches = filteredActivityIds.has(childActivity.id)

        if (parentMatches || childMatches) {
          result.push({ activity: childActivity, isChild: true, level: 1 })
        }
      })
    })

    return result
  }, [filteredActivities, getChildrenActivities, sortedActivities, selectedYear, selectedCategory])
  // 篩選出規劃中的活動
  const filteredPlannedActivities = useMemo(() => {
    if (!activities.length) return []

    try {
      let filtered = activities.filter((activity) => activity.status === "upcoming")

      // 類型篩選
      if (selectedCategory !== "all") {
        filtered = filtered.filter((activity) => activity.category === selectedCategory)
      }
      // 角色篩選
      if (selectedMember !== "all") {
        filtered = filtered.filter((activity) => {
          return activity.member && activity.member.some((member) => member === selectedMember)
        })
      }

      return filtered
    } catch (err) {
      console.error("Error filtering planned activities:", err)
      return []
    }
  }, [activities, selectedCategory, selectedMember])

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

  const toggleSortOrder = useCallback(() => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }, [sortOrder])

  const clearFilters = useCallback(() => {
    setSelectedYear("all")
    setSelectedCategory("all")
    setSelectedMember("all")
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const scrollToPlanning = useCallback(() => {
    const planningSection = document.getElementById("planning-section")
    if (planningSection) {
      planningSection.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

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

      const getStatusIcon = (iconName: string) => {
        switch (iconName) {
          case "CheckCircle":
            return CheckCircle
          case "PlayCircle":
            return PlayCircle
          case "Clock":
            return Clock
          case "PauseCircle":
            return PauseCircle
          default:
            return Clock
        }
      }
      
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

          {/* 桌面版標題行 */}
          {!isMobile && (
          <div className="flex mb-4">
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
            {yearDisplayActivities.map(({ activity, isChild, level }) => {
              const segment = getActivitySegments(activity, year)
              const config = statusConfig[activity.calculatedStatus]
              
              const Icon = getStatusIcon(config.icon)

              return (
                <div
                  key={`${activity.id}-${year}`} data-id={activity.id}
                  className={`flex flex-col md:flex-row bg-gray-800/30 rounded-lg backdrop-blur-sm min-h-[80px] ${
                      isChild ? "ml-1 border-l-4 border-blue-400/50" : ""
                    }`}
                >
                  {/* 左側活動資訊欄 */}
                  <div
                    className={`${isMobile ? "w-full" : "w-80"} ${isChild ? "md:w-[312px]" : ""} flex-shrink-0 p-4 ${!isMobile ? "border-r border-gray-600/50" : ""} flex items-center gap-4`}
                  >
                    <div className="relative">
                      <Image
                        src={activity.image || "/placeholder.svg?height=40&width=40&text=activity"}
                        alt={activity.name}
                        width={100}
                        height={100}
                        className={`${isMobile ? "w-20 h-20" : "w-12 h-12"} rounded-lg object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all`}
                        onMouseEnter={(e) => handleImageHover(activity.image, e)}
                        onMouseLeave={() => handleImageHover(null)}
                        onError={(e) => {
                            // 圖片載入失敗時的處理
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=40&width=40&text=error"
                        }}
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <a href={activity.url} target="_blank" className="text-white font-medium text-sm truncate">
                        <div className="flex items-center gap-2 mb-1">
                            <Icon className="w-4 h-4 text-white flex-shrink-0" />
                            <h4
                              className={`text-white font-medium ${isMobile ? "text-sm" : "text-sm"} truncate ${isChild ? "text-gray-300" : ""}`}
                            >
                              {activity.name}
                            </h4>
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
                      {/* 類別標籤 */}
                      {activity.category && (
                        <p
                          className={`text-gray-300 ${isMobile ? "text-xs" : "text-xs"} leading-relaxed line-clamp-2`}
                        >{activity.category}</p>
                      )}
                      {/* 成員列表 */}
                      {activity.member && (
                        <p className="text-gray-400 text-xs">
                          {activity.member ? `${activity.member.join(", ")}` : ""}
                        </p>
                      )}
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
    [displayActivities, isMobile, getActivitySegments, handleActivityHover, handleImageHover],
  )


  const hoveredActivityData = hoveredActivity ? processedActivities.find((a) => a.id === hoveredActivity) : null
  const hasActiveFilters = selectedYear !== "all" || selectedCategory !== "all" || selectedMember !== "all"

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
    <div className="min-h-screen p-4" style={{ backgroundColor: "#16192c" }}>
      <div className="max-w-7xl mx-auto">
        {/* 標題和篩選器 */}
        <div className="mb-8">
          <Image width={200} height={0} className="mx-auto" src="https://www.foralltime.com.tw/pc/gw/20230606115905/img/logo_c18e726.png" alt="" />
          <h1 className="text-4xl font-bold text-white text-center">繁中服活動列表</h1>
          <ul className="text-gray-400 text-xs w-fit mx-auto mb-6 mt-2 list-decimal">
            <li>全員活動不會有角色標籤</li>
            <li>活動類型參照中國服wiki分類</li>
            <li>點擊活動名稱可直接連到wiki活動頁面</li>
            <li>禮包只推薦一抽$33以內的選項<br />計算方式：1顏料=150鑽、1體力=0.5鑽，其他材料不計算</li>
          </ul>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-white" />
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="選擇年份" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white">
                      所有年份
                    </SelectItem>
                    {availableYears.map((year) => (
                      <SelectItem key={year} value={year.toString()} className="text-white">
                        {year}年
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-white" />
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-32 md:w-40 bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="選擇類型" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white">
                      所有類型
                    </SelectItem>
                    {availableCategories.map((category) => {
                      return (
                        <SelectItem key={category} value={category} className="text-white">
                          {category}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-white" />
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger className="w-32 md:w-40 bg-gray-800/50 border-gray-600 text-white">
                    <SelectValue placeholder="選擇成員" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600">
                    <SelectItem value="all" className="text-white">
                      所有成員
                    </SelectItem>
                    {availableMembers.map((member) => {
                      return (
                        <SelectItem key={member} value={member} className="text-white">
                          {member}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={toggleSortOrder}
                variant="outline"
                size="sm"
                className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 flex items-center gap-2"
              >
                {sortOrder === "desc" ? (
                  <>
                    <ArrowDown className="w-4 h-4" />
                    最新在前
                  </>
                ) : (
                  <>
                    <ArrowUp className="w-4 h-4" />
                    最舊在前
                  </>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  onClick={clearFilters}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50"
                >
                  清除篩選
                </Button>
              )}
            </div>
            <div className="flex gap-2 flex-wrap">
              {/* 狀態圖例 */}
              {Object.entries(statusConfig).map(([status, config]) => {
                const Icon = getStatusIcon(config.icon)
                return (
                  <div key={status} className="flex items-center gap-1 text-sm text-gray-300">
                    <div className={`w-3 h-3 ${config.color} rounded`}></div>
                    <Icon className="w-4 h-4" />
                    <span>{config.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* 篩選狀態顯示 */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-gray-400 text-sm">目前篩選：</span>
            {selectedYear !== "all" && (
              <Badge variant="secondary" className="bg-blue-900/50 text-blue-300">
                {selectedYear}年
              </Badge>
            )}
            {selectedCategory !== "all" && (
              <Badge variant="secondary" className="bg-green-900/50 text-green-300">
                {selectedCategory}
              </Badge>
            )}
            {selectedMember !== "all" && (
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                {selectedMember}
              </Badge>
            )}
            <span className="text-gray-400 text-sm">共 {displayActivities.length} 個活動</span>
          </div>
        )}
        {/* 甘特圖 */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl py-6 md:p-6 mb-8 relative">
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

        {/* 未來會開的活動 */}
        <Card id="planning-section" className="bg-gray-900/30 backdrop-blur-sm border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5" style={{ color: "#3e6cc3" }} />
              未來會開的活動
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 規劃中的活動列表 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPlannedActivities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-sm mb-2">沒有符合篩選條件的規劃活動</div>
                </div>
              ) : (
                filteredPlannedActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg" data-id={activity.id}>
                    <div>
                      <a href={activity.url} target="_blank" className="flex items-center gap-3">
                        <Image
                          src={activity.image || "/placeholder.svg?height=40&width=40&text=activity"}
                          alt={activity.name}
                          className="w-16 h-16 rounded-full object-cover"
                          width={100}
                          height={100}
                          onError={(e) => { 
                            // 圖片載入失敗時的處理
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=40&width=40&text=error"
                          }}
                          loading="lazy"
                        />
                        <div>
                          <h4 className="text-white font-medium">{activity.name}</h4>
                          <p className="text-gray-400 text-sm">
                            {activity.description}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {activity.category}
                          </p>
                          {activity.member && activity.member.length > 0 && (
                            <p className="text-gray-400 text-sm">
                              {activity.member ? activity.member.join(", ") : ""}
                            </p>
                          )}
                        </div>
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
        
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
            {hoveredActivityData.startDate} ~ {hoveredActivityData.endDate} 04:00
          </p>
          <p className="text-xs text-gray-400">狀態: {statusConfig[hoveredActivityData.calculatedStatus || hoveredActivityData.status].label}</p>
          {/* 關聯方案 */}
          {hoveredActivityData.packageId &&
            (() => {
              const activityPackage = getActivityPackage(hoveredActivityData)
              return activityPackage ? (
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <h5 className="font-medium text-sm mb-2 text-green-300 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" />
                    活動商店: {activityPackage.name}
                  </h5>
                  <div className="bg-gray-800/50 rounded p-3">
                    {/* <p className="text-xs text-gray-300 mb-3">{activityPackage.description}</p> */}
                    <div className="space-y-2">
                      {activityPackage.pricingOptions.map((option) => (
                        <div key={option.id} className="flex items-center justify-between bg-gray-700/50 rounded p-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">{option.name}</span>
                            </div>
                            {option.description && <p className="text-xs text-gray-400 mt-1">{option.description}</p>}
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-green-400">
                                一抽${option.price}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null
            })()}
          {/* 同期活動 */}
          {hoveredActivityData.childrenActivities && hoveredActivityData.childrenActivities.length > 0 && (
            <div className="mt-4 pt-3 border-t border-gray-700">
              <h5 className="font-medium text-sm mb-2 text-blue-300">同期活動:</h5>
              <div className="space-y-2">
                {getChildrenActivities(hoveredActivityData).map((childActivity) => {
                  const getStatusConfig = (status: string) => {
                    const validStatuses = ['completed', 'ongoing', 'upcoming'] as const;
                    return validStatuses.includes(status as typeof validStatuses[number]) 
                      ? statusConfig[status as keyof typeof statusConfig]
                      : statusConfig.upcoming;
                  };
                  const childConfig = getStatusConfig(childActivity.calculatedStatus || childActivity.status);

                  return (
                    <div key={childActivity.id} className="bg-gray-800/50 rounded p-2">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 ${childConfig.color} rounded-full flex-shrink-0`}></div>
                        <span className="text-sm font-medium text-gray-200">{childActivity.name}</span>
                      </div>
                      <p className="text-xs text-gray-400 ml-4">
                        {childActivity.startDate} ~ {childActivity.endDate}
                      </p>
                      {childActivity.member && childActivity.member.length > 0 && (
                        <p className="text-xs text-gray-400 ml-4">{childActivity.member.join(", ")}</p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
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
            />
          </div>
        </div>
      )}

      {/* 底部導航按鈕 */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50">
        <Button
          onClick={scrollToPlanning}
          className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg rounded-full w-12 h-12 p-0 flex items-center justify-center"
          title="跳至未來活動"
        >
          <Clock className="w-5 h-5" />
        </Button>
        <Button
          onClick={scrollToTop}
          className="bg-gray-600 hover:bg-gray-700 text-white shadow-lg rounded-full w-12 h-12 p-0 flex items-center justify-center"
          title="返回最上方"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}

const getStatusIcon = (iconName: string) => {
  switch (iconName) {
    case "CheckCircle":
      return CheckCircle
    case "PlayCircle":
      return PlayCircle
    case "Clock":
      return Clock
    case "PauseCircle":
      return PauseCircle
    default:
      return Clock
  }
}
