"use client"
import type React from "react"
import { useState, useMemo } from "react"
import { Calendar, Plus, Trash2, Clock, CheckCircle, PlayCircle, PauseCircle, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Activity } from "./activity-types"
import { activitiesData } from "./activities-data"
import { statusConfig } from "./activity-types"

const months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"]
type SortOrder = "desc" | "asc"

export default function Component() {
  const [activities, setActivities] = useState<Activity[]>(activitiesData)
  const [selectedYear, setSelectedYear] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc") // 預設最新在前
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null)
  const [hoveredImage, setHoveredImage] = useState<string | null>(null)
  const [imageTooltipPosition, setImageTooltipPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number; side: "left" | "right" }>({
    x: 0,
    y: 0,
    side: "right",
  })
  const [newActivity, setNewActivity] = useState({
    name: "",
    startDate: "",
    endDate: "",
    url: "",
  })

  const availableYears = useMemo(() => {
    const years = new Set<number>()
    activities.forEach((activity) => {
      years.add(new Date(activity.startDate).getFullYear())
      years.add(new Date(activity.endDate).getFullYear())
    })
    const sortedYears = Array.from(years).sort()
    return sortOrder === "desc" ? sortedYears.reverse() : sortedYears
  }, [activities, sortOrder])

  const sortedActivities = useMemo(() => {
    const sorted = [...activities].sort((a, b) => {
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })
    return sorted
  }, [activities, sortOrder])

  const filteredActivities = useMemo(() => {
    if (selectedYear === "all") return sortedActivities
    return sortedActivities.filter((activity) => {
      const startYear = new Date(activity.startDate).getFullYear()
      const endYear = new Date(activity.endDate).getFullYear()
      return startYear <= Number.parseInt(selectedYear) && endYear >= Number.parseInt(selectedYear)
    })
  }, [sortedActivities, selectedYear])

  const getActivitySegments = (activity: Activity, year: number) => {
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

    const startPosition = (startMonth * 100) / 12 + ((startDay - 1) / daysInStartMonth) * (100 / 12)
    const endPosition = (endMonth * 100) / 12 + (endDay / daysInEndMonth) * (100 / 12)

    const isFirstSegment = startDate.getFullYear() === year
    const isLastSegment = endDate.getFullYear() === year
    const isMultiYear = startDate.getFullYear() !== endDate.getFullYear()

    return {
      startPosition,
      width: endPosition - startPosition,
      isFirstSegment,
      isLastSegment,
      isMultiYear,
    }
  }

  const handleActivityHover = (activity: Activity | null, event?: React.MouseEvent) => {
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
  }

  const handleImageHover = (imageSrc: string | null, event?: React.MouseEvent) => {
    if (!imageSrc || !event) {
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
  }

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }

  const renderYearTimeline = (year: number) => {
    const yearActivities = filteredActivities.filter((activity) => {
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
    

    return (
      <div key={year} className="mb-8 relative">
        <h3 className="text-2xl font-bold text-white mb-4">{year}年</h3>

        {/* 標題行 */}
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

        {/* 活動列表 */}
        <div className="space-y-3">
          {yearActivities.map((activity) => {
            const segment = getActivitySegments(activity, year)
            const config = statusConfig[activity.status]
            const Icon = getStatusIcon(config.icon)

            return (
              <div
                key={`${activity.id}-${year}`}
                className="flex bg-gray-800/30 rounded-lg min-h-[80px]"
              >
                {/* 左側活動資訊欄 */}
                <div className="w-80 flex-shrink-0 p-4 border-r border-gray-600/50 flex items-center gap-4">
                  <div className="relative">
                    <img
                      src={activity.image || "/placeholder.svg"}
                      alt={activity.name}
                      className="w-12 h-12 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all"
                      onMouseEnter={(e) => handleImageHover(activity.image, e)}
                      onMouseLeave={() => handleImageHover(null)}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={activity.url} target="_blank" className="text-white font-medium text-sm truncate">
                      <div className="flex items-center gap-2 mb-1">
                          <Icon className="w-4 h-4 text-white flex-shrink-0" />
                          <h4>{activity.name}</h4>
                      </div>
                    </a>
                    <p className="text-white text-xs font-medium mb-1">
                      {new Date(activity.startDate).getMonth() + 1}/{new Date(activity.startDate).getDate()} -{" "}
                      {new Date(activity.endDate).getMonth() + 1}/{new Date(activity.endDate).getDate()}
                    </p>
                    <p className="text-gray-400 text-xs">{activity.category}</p>
                    {/* 成員列表 */}
                    <p className="text-gray-400 text-xs mb-1">
                      {activity.member ? `${activity.member.join(", ")}` : "無成員資訊"}
                    </p>
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 ${config.color} rounded-full flex-shrink-0 ${
                          activity.status === "ongoing" ? "animate-pulse" : ""
                        }`}
                      ></div>
                      <span className="text-gray-400 text-xs">{config.label}</span>
                    </div>
                  </div>
                </div>

                {/* 右側時間軸 */}
                <div className="flex-1 relative flex items-center">
                  <div
                    className={`absolute h-8 ${config.color} rounded-lg flex items-center px-3 cursor-pointer transition-all duration-300 hover:scale-105 ${
                      activity.status === "ongoing" ? "animate-pulse" : ""
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
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const hoveredActivityData = hoveredActivity ? activities.find((a) => a.id === hoveredActivity) : null

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: "#16192c" }}>
      <div className="max-w-7xl mx-auto">
        {/* 標題和篩選器 */}
        <div className="mb-8">
          <img className="mx-auto" src="https://www.foralltime.com.tw/pc/gw/20230606115905/img/logo_c18e726.png" alt="" />
          <h1 className="text-4xl font-bold text-white mb-6 text-center">繁中服活動列表</h1>
          <p className="text-gray-400 text-xs text-center">PS.主線類別不會有角色標籤</p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
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
            </div>

            <div className="flex gap-2">
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

        {/* 甘特圖 */}
        <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 mb-8 relative">
          {selectedYear === "all"
            ? availableYears.map((year) => renderYearTimeline(year))
            : renderYearTimeline(Number.parseInt(selectedYear))}
        </div>

        {/* 未來會開的活動 */}
        <Card className="bg-gray-900/30 backdrop-blur-sm border-gray-600">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" style={{ color: "#3e6cc3" }} />
              未來會開的活動
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* 規劃中的活動列表 */}
            <div className="space-y-2">
              {activities
                .filter((activity) => activity.status === "planned")
                .map((activity) => (
                  <div key={activity.id} className="flex items-center justify-between bg-gray-800/30 p-3 rounded-lg">
                    <div className="flex items-center gap-3">
                      <img
                        src={activity.image || "/placeholder.svg"}
                        alt={activity.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <h4 className="text-white font-medium">{activity.name}</h4>
                        <p className="text-gray-400 text-sm">
                          {activity.startDate} ~ {activity.endDate}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
        
        <p className="text-gray-400 text-center text-xs mt-4">所有素材與活動資訊均來自官網，版權為時空中的繪旅人官方所有。</p>
      </div>
      {/* 活動詳情懸浮視窗 */}
      {hoveredActivity && hoveredActivityData && (
        <div
          className="fixed z-[9999] bg-gray-900/95 backdrop-blur-sm text-white p-3 rounded-lg shadow-xl max-w-xs pointer-events-none"
          style={{
            left: tooltipPosition.side === "right" ? `${tooltipPosition.x}px` : "auto",
            right: tooltipPosition.side === "left" ? `${window.innerWidth - tooltipPosition.x}px` : "auto",
            top: `${tooltipPosition.y}px`,
            transform: "translateY(-50%)",
          }}
        >
          <h4 className="font-bold mb-1">{hoveredActivityData.name}</h4>
          <p className="text-xs text-gray-400">
            {hoveredActivityData.startDate} ~ {hoveredActivityData.endDate}
          </p>
          <p className="text-xs text-gray-400">狀態: {statusConfig[hoveredActivityData.status].label}</p>
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
            <img
              src={hoveredImage.replace("height=40&width=40", "height=auto&width=500") || "/placeholder.svg"}
              alt="活動圖片預覽"
              className="w-[500px] object-cover rounded-lg"
              style={{ maxWidth: "500px", maxHeight: "500px" }}
            />
          </div>
        </div>
      )}
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
