"use client"
import type React from "react"
import { useMemo, useCallback, useEffect } from "react"
// icon
import {
  Calendar,
  ArrowUp,
  ArrowDown,
  Filter,
  User
} from "lucide-react"
// UI元件
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// 型別
import type { SortOrder, ProcessedActivity, DisplayActivityItem, Activity } from "@/app/activity-types"



interface FilterActivityProps {
  sortOrder: SortOrder
  setSortOrder: (order: SortOrder) => void
  selectedYear: string
  setSelectedYear: (year: string) => void
  selectedCategory: string
  setSelectedCategory: (category: string) => void
  selectedMember: string
  setSelectedMember: (member: string) => void
  statusConfig: Record<string, { label: string; color: string; icon: string }>
  getStatusIcon: (iconName: string) => React.ComponentType<React.SVGProps<SVGSVGElement>>
  showMajorEventsOnly: boolean
  setShowMajorEventsOnly: (show: boolean) => void
  availableYears: number[]
  processedActivities: ProcessedActivity[]
  onDisplayActivitiesChange: (activities: DisplayActivityItem[]) => void
  // 篩選相關的函數
  isChildActivity: (id: string) => boolean
  getParentActivity: (id: string) => Activity | undefined
  getChildrenActivities: (parent: Activity) => Activity[]
  hasActiveFilters: boolean
}

export default function FilterActivity({
  hasActiveFilters,
  sortOrder,
  setSortOrder,
  selectedYear,
  setSelectedYear,
  selectedCategory,
  setSelectedCategory,
  selectedMember,
  setSelectedMember,
  statusConfig,
  getStatusIcon,
  showMajorEventsOnly,
  setShowMajorEventsOnly,
  availableYears,
  processedActivities,
  isChildActivity,
  getParentActivity,
  getChildrenActivities,
  onDisplayActivitiesChange
}: FilterActivityProps) {
  // 活動類別列表
  const availableCategories = useMemo(() => {
    if (!processedActivities.length) return []

    try {
      const categories = new Set<string>()
      processedActivities.forEach((activity) => {
        if (activity.category) {
          if (Array.isArray(activity.category)) {
            activity.category.forEach((cat) => categories.add(cat))
          } else {
            categories.add(activity.category)
          }
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
    const statusPriority = { upcoming: 0, ongoing: 1, completed: 2 }
    const sorted = [...processedActivities].sort((a, b) => {
      if (sortOrder === "desc") {
        // 狀態優先排序
        const aStatus = a.calculatedStatus ? a.calculatedStatus : a.status
        const bStatus = b.calculatedStatus ? b.calculatedStatus : b.status
        if (statusPriority[aStatus] !== statusPriority[bStatus]) {
          return statusPriority[aStatus] - statusPriority[bStatus]
        }
      }
      // 同狀態內依照日期排序
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
        allFilteredActivities = allFilteredActivities.filter((activity) => {
          if (!activity.category) return false
          if (Array.isArray(activity.category)) {
            return activity.category.includes(selectedCategory)
          }
          return activity.category === selectedCategory
        })
      }
      // 角色篩選
      if (selectedMember !== "all") {
        allFilteredActivities = allFilteredActivities.filter((activity) => {
          // 判斷是否為五人大活動
          const isFiveMemberActivity =
            Array.isArray(activity.member) && activity.member.includes("五人大活動")

          // 如果是五人大活動且不是風硯，則通過篩選
          if (isFiveMemberActivity && selectedMember !== "風硯") {
            return true
          }
          return activity.member && activity.member.some((member) => member === selectedMember)
        })
      }
      // 大活動篩選
      if (showMajorEventsOnly) {
        allFilteredActivities = allFilteredActivities.filter((activity) => activity.isMajorEvent)
      }

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
  }, [sortedActivities, selectedYear, selectedCategory, selectedMember, isChildActivity, getParentActivity, processedActivities.length, showMajorEventsOnly])

    
  // 獲取要顯示的活動列表（包含父活動和子活動的層級結構）
  const displayActivities = useMemo(() => {
    const result: Array<DisplayActivityItem> = []

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
      allFilteredActivities = allFilteredActivities.filter((activity) => {
        if (!activity.category) return false
        if (Array.isArray(activity.category)) {
          return activity.category.includes(selectedCategory)
        }
        return activity.category === selectedCategory
      })
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

  const toggleSortOrder = useCallback(() => {
    setSortOrder(sortOrder === "desc" ? "asc" : "desc")
  }, [sortOrder, setSortOrder])

  const clearFilters = useCallback(() => {
    setSelectedYear("all")
    setSelectedCategory("all")
    setSelectedMember("all")
    setShowMajorEventsOnly(false)
  }, [setSelectedYear, setSelectedCategory, setSelectedMember, setShowMajorEventsOnly])

  // 當顯示活動改變時，通知父元件
  useEffect(() => {
    onDisplayActivitiesChange(displayActivities)
  }, [displayActivities, onDisplayActivitiesChange])

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between md:mx-6">
        <div className="flex items-center gap-4 flex-wrap justify-center md:justify-start">
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-white" />
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-40 bg-gray-800/50 border-gray-600 text-white flex-auto">
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
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-5 h-5 text-white" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-32 md:w-40 bg-gray-800/50 border-gray-600 text-white flex-auto">
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
          <div className="flex items-center gap-2 flex-1">
            <User className="w-5 h-5 text-white" />
            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="w-32 md:w-40 bg-gray-800/50 border-gray-600 text-white flex-auto">
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
          <Label className="text-white bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50 h-9 px-4 rounded-md">
            <Checkbox checked={showMajorEventsOnly} onCheckedChange={(checked) => setShowMajorEventsOnly(!!checked)} />
            <p>
              只顯示
              <a className="underline" href="https://hlr1023.huijiwiki.com/wiki/%E6%B4%BB%E5%8A%A8%E4%B8%80%E8%A7%88" target="_blank">大活動</a>
            </p>
          </Label>
          <Button
            onClick={toggleSortOrder}
            variant="outline"
            size="sm"
            className="bg-gray-800/50 border-gray-600 text-white hover:bg-gray-700/50 hover:text-white flex items-center gap-2 flex-auto h-9"
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
        <div className="flex gap-2 flex-none">
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

      {/* 篩選狀態顯示 */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 md:mx-6 mt-6 items-center">
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
        </div>
      )}
    </>
  )
}