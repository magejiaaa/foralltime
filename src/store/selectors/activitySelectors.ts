import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import type { DisplayActivityItem, Activity } from '@/types/activity-types'

// 基礎選擇器
const selectProcessedActivities = (state: RootState) => state.activities.processedActivities
const selectSortOrder = (state: RootState) => state.filters.sortOrder
const selectSelectedYear = (state: RootState) => state.filters.selectedYear
const selectSelectedCategory = (state: RootState) => state.filters.selectedCategory
const selectSelectedMember = (state: RootState) => state.filters.selectedMember
const selectShowMajorEventsOnly = (state: RootState) => state.filters.showMajorEventsOnly

// 排序後的活動列表選擇器
export const selectSortedActivities = createSelector(
  [
    (state: RootState) => state.activities.processedActivities,
    (state: RootState) => state.filters.sortOrder
  ],
  (processedActivities, sortOrder) => {
    const statusPriority = { upcoming: 0, ongoing: 1, completed: 2 } as const
    
    return [...processedActivities].sort((a, b) => {
      if (sortOrder === "desc") {
        const aStatus = a.calculatedStatus || a.status
        const bStatus = b.calculatedStatus || b.status
        
        if (statusPriority[aStatus] !== statusPriority[bStatus]) {
          return statusPriority[aStatus] - statusPriority[bStatus]
        }
      }
      
      const dateA = new Date(a.startDate).getTime()
      const dateB = new Date(b.startDate).getTime()
      return sortOrder === "desc" ? dateB - dateA : dateA - dateB
    })
  }
)

// 可用年份列表選擇器
export const selectAvailableYears = createSelector(
  [selectProcessedActivities, selectSortOrder],
  (processedActivities, sortOrder) => {
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
  }
)

// 可用類別列表選擇器
export const selectAvailableCategories = createSelector(
  [selectProcessedActivities],
  (processedActivities) => {
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
  }
)

// 可用角色列表選擇器
export const selectAvailableMembers = createSelector(
  [selectProcessedActivities],
  (processedActivities) => {
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
  }
)

// 篩選後的活動選擇器
export const selectFilteredActivities = createSelector(
  [
    selectSortedActivities,
    selectSelectedYear,
    selectSelectedCategory,
    selectSelectedMember,
    selectShowMajorEventsOnly,
    // 需要從組件傳入的輔助函數，可以通過參數傳遞
  ],
  (sortedActivities, selectedYear, selectedCategory, selectedMember, showMajorEventsOnly) => {
    let filtered = sortedActivities

    try {
      // 年份篩選
      if (selectedYear !== "all") {
        filtered = filtered.filter((activity) => {
          const startYear = new Date(activity.startDate).getFullYear()
          const endYear = new Date(activity.endDate).getFullYear()
          return startYear <= Number.parseInt(selectedYear) && endYear >= Number.parseInt(selectedYear)
        })
      }

      // 類型篩選
      if (selectedCategory !== "all") {
        filtered = filtered.filter((activity) => {
          if (!activity.category) return false
          if (Array.isArray(activity.category)) {
            return activity.category.includes(selectedCategory)
          }
          return activity.category === selectedCategory
        })
      }

      // 角色篩選
      if (selectedMember !== "all") {
        filtered = filtered.filter((activity) => {
          const isFiveMemberActivity =
            Array.isArray(activity.member) && activity.member.includes("五人大活動")

          if (isFiveMemberActivity && selectedMember !== "風硯") {
            return true
          }
          return activity.member && activity.member.some((member) => member === selectedMember)
        })
      }

      // 大活動篩選
      if (showMajorEventsOnly) {
        filtered = filtered.filter((activity) => activity.isMajorEvent)
      }

      return filtered
    } catch (err) {
      console.error("Error filtering activities:", err)
      return sortedActivities
    }
  }
)

// 創建一個工廠函數來處理需要輔助函數的選擇器
export const createDisplayActivitiesSelector = (
  isChildActivity: (id: string) => boolean
) => createSelector(
  [
    selectFilteredActivities,
    selectSortedActivities,
    selectSelectedYear,
    selectSelectedCategory,
    selectProcessedActivities,
  ],
  (filteredActivities, sortedActivities, selectedYear, selectedCategory, processedActivities) => {
    const result: Array<DisplayActivityItem> = []
    const getChildrenActivities = (parentActivity: Activity): Activity[] => {
      if (!parentActivity.childrenActivities?.length) return []
      return parentActivity.childrenActivities
        .map((childId) => processedActivities.find((activity) => activity.id === childId))
        .filter(Boolean) as Activity[]
    }
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

    // 只處理不是子活動的父活動
    const parentActivities = filteredActivities.filter(activity => !isChildActivity(activity.id))

    parentActivities.forEach((parentActivity) => {
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
  }
)