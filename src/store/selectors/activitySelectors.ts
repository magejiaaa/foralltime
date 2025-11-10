import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/store/store'
import type { DisplayActivityItem, Activity } from '@/types/activity-types'

// 已篩選的活動
const selectProcessedActivities = (state: RootState) => state.activities.processedActivities
// 篩選狀態選擇器
const selectSortOrder = (state: RootState) => state.filters.sortOrder
const selectSelectedYear = (state: RootState) => state.filters.selectedYear
const selectSelectedCategory = (state: RootState) => state.filters.selectedCategory
const selectSelectedMember = (state: RootState) => state.filters.selectedMember
const selectShowMajorEventsOnly = (state: RootState) => state.filters.showMajorEventsOnly

// ------------- 篩選條件建立 -------------
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

// ------------- 篩選資料處理 -------------

// 排序最新/最舊活動列表選擇器
// 輸出 processedActivities
const selectSortedActivities = createSelector(
  [
    selectProcessedActivities,
    selectSortOrder
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

// 多個條件篩選後的活動
// 輸出 processedActivities
const selectFilteredActivities = createSelector(
  [
    selectSortedActivities, // 已排序的活動列表
    selectSelectedYear,
    selectSelectedCategory,
    selectSelectedMember,
    selectShowMajorEventsOnly,
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

// 判斷某活動是否為子活動（被其他活動的 childrenActivities 包含）
const isChildActivity = (activityId: string, processedActivities: Activity[]): boolean => {
  return processedActivities.some((activity) => activity.childrenActivities?.includes(activityId))
}

// 如果含有子活動，就連子活動一起顯示
// 輸出 processedActivities
export const hasChildActivitiesSelector = createSelector(
  [
    selectFilteredActivities,
    selectProcessedActivities,
  ],
  (filteredActivities, processedActivities) => {
    const result: Array<DisplayActivityItem> = []
    const getChildrenActivities = (parentActivity: Activity): Activity[] => {
      if (!parentActivity.childrenActivities?.length) return []
      return parentActivity.childrenActivities
        .map((childId) => processedActivities.find((activity) => activity.id === childId))
        .filter(Boolean) as Activity[]
    }

    // 1. 處理父活動（不是子活動的活動）
    const parentActivities = filteredActivities.filter(
      activity => !isChildActivity(activity.id, processedActivities)
    )

    // 記錄已經顯示過的子活動 id，避免重複
    const shownChildIds = new Set<string>()

    parentActivities.forEach((parentActivity) => {
      // 顯示父活動
      result.push({ activity: parentActivity, isChild: false, level: 0 })

      // 顯示所有子活動
      const children = getChildrenActivities(parentActivity)
      children.forEach((childActivity) => {
        result.push({ activity: childActivity, isChild: true, level: 1 })
        shownChildIds.add(childActivity.id)
      })
    })

    // 2. 處理單獨被篩選到的子活動（父活動沒被篩選到）
    filteredActivities.forEach((activity) => {
      if (
        isChildActivity(activity.id, processedActivities) && // 是子活動
        !shownChildIds.has(activity.id) // 尚未顯示過
      ) {
        result.push({ activity, isChild: true, level: 1 })
      }
    })

    return result
  }
)