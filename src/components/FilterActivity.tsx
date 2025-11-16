"use client"
import type React from "react"
import { useCallback, useEffect } from "react"
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
import { Input } from "@/components/ui/input"

// store
import { 
  useAppDispatch, 
  useAppSelector
} from '@/store/hooks'
import { 
  setSortOrder,
  setSelectedYear,
  setSelectedCategory,
  setSelectedMember,
  setShowMajorEventsOnly,
  setHasActiveFilters,
  setSearchTerm,
  goNext,
  goPrev
} from '@/store/slices/filtersSlice'
import { 
  selectAvailableYears,
  selectAvailableCategories,
  selectAvailableMembers
} from '@/store/selectors/activitySelectors'
import { setShowAll } from '@/store/slices/uiSlice'

interface FilterActivityProps {
  statusConfig: Record<string, { label: string; color: string; icon: string }>
  getStatusIcon: (iconName: string) => React.ComponentType<React.SVGProps<SVGSVGElement>>
}

export default function FilterActivity({
  statusConfig,
  getStatusIcon,
}: FilterActivityProps) {
  const dispatch = useAppDispatch()

  const availableYears = useAppSelector(selectAvailableYears) // 活動年份列表
  const availableCategories = useAppSelector(selectAvailableCategories) // 活動類別列表
  const availableMembers = useAppSelector(selectAvailableMembers) // 角色列表
  // 篩選條件
  const selectedYear = useAppSelector((state) => state.filters.selectedYear)
  const selectedCategory = useAppSelector((state) => state.filters.selectedCategory)
  const selectedMember = useAppSelector((state) => state.filters.selectedMember)
  const showMajorEventsOnly = useAppSelector((state) => state.filters.showMajorEventsOnly)
  const sortOrder = useAppSelector((state) => state.filters.sortOrder)
  const hasActiveFilters = useAppSelector((state) => state.filters.hasActiveFilters)

  useEffect(() => {
    if (hasActiveFilters) {
      dispatch(setShowAll(true));
    }
  }, [hasActiveFilters, dispatch])

  // 創建處理函數
  const handleYearChange = useCallback((value: string) => {
    dispatch(setSelectedYear(value))
    dispatch(setHasActiveFilters(value !== "all"))
  }, [dispatch])

  const handleCategoryChange = useCallback((value: string) => {
    dispatch(setSelectedCategory(value))
    dispatch(setHasActiveFilters(value !== "all"))
  }, [dispatch])

  const handleMemberChange = useCallback((value: string) => {
    dispatch(setSelectedMember(value))
    dispatch(setHasActiveFilters(value !== "all"))
  }, [dispatch])

  const handleMajorEventsChange = useCallback((checked: boolean) => {
    dispatch(setShowMajorEventsOnly(checked))
    dispatch(setHasActiveFilters(checked))
  }, [dispatch])

  const toggleSortOrder = useCallback(() => {
    dispatch(setSortOrder(sortOrder === "desc" ? "asc" : "desc"))
  }, [sortOrder, dispatch])

  const clearFilters = useCallback(() => {
    dispatch(setSelectedYear("all"))
    dispatch(setSelectedCategory("all"))
    dispatch(setSelectedMember("all"))
    dispatch(setShowMajorEventsOnly(false))
    dispatch(setHasActiveFilters(false))
  }, [dispatch])

  const { searchTerm, searchResults, currentSearchIndex } = useAppSelector(s => s.filters);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between py-2 md:sticky md:top-0 bg-[#16192c]/80 md:backdrop-blur-sm z-10 md:px-6">
        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap justify-center md:justify-start">
          {/* 所有年份 */}
          <div className="flex items-center gap-2 flex-1">
            <Calendar className="w-5 h-5 text-white" />
            <Select value={selectedYear} onValueChange={handleYearChange}>
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
          {/* 所有類型 */}
          <div className="flex items-center gap-2 flex-1">
            <Filter className="w-5 h-5 text-white" />
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
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
          {/* 所有成員 */}
          <div className="flex items-center gap-2 flex-1">
            <User className="w-5 h-5 text-white" />
            <Select value={selectedMember} onValueChange={handleMemberChange}>
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
            <Checkbox checked={showMajorEventsOnly} onCheckedChange={handleMajorEventsChange} />
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
          {/* 搜尋 */}
          <div className="flex items-center gap-1 flex-1 min-w-1/2 fixed bottom-18 md:bottom-0 z-10 md:relative">
            <Input
              type="text"
              placeholder="活動名稱、SSR卡名"
              className="bg-gray-800/50 border-gray-600 text-white placeholder-gray-300 focus:border-blue-500 h-9 text-xs pr-10"
              value={searchTerm}
              onChange={(e) => dispatch(setSearchTerm(e.target.value))}
            />
            <p className="text-white text-xs absolute right-[102px]">{searchResults.length > 0 ? `${currentSearchIndex + 1} / ${searchResults.length}` : "0 / 0"}</p>
            <Button 
              className="text-white bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50 h-9 rounded-md"
              onClick={() => dispatch(goPrev())}
              disabled={searchResults.length === 0}
            ><ArrowUp className="w-4 h-4" /></Button>
            <Button 
              className="text-white bg-gray-800/50 border border-gray-600 hover:bg-gray-700/50 h-9 rounded-md"
              onClick={() => dispatch(goNext())}
              disabled={searchResults.length === 0}
            ><ArrowDown className="w-4 h-4" /></Button>
          </div>
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
      {hasActiveFilters && !showMajorEventsOnly && (
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