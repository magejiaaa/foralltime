"use client"
import type React from "react"
import { useState, useMemo, useCallback } from "react"
// icon
import {
  Clock, ArrowUp, SquareArrowOutUpRight
} from "lucide-react"
import type { Activity } from "../app/activity-types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from 'next/image'

interface BottomNavProps {
  processedActivities: Activity[]  // 從父元件傳入
  activities: Activity[]          // 從父元件傳入
  selectedCategory: string   // 從父元件傳入
  selectedMember: string     // 從父元件傳入
  showMajorEventsOnly: boolean // 從父元件傳入
}

export default function BottomNav({
  processedActivities, 
  activities, 
  selectedCategory, 
  selectedMember,
  showMajorEventsOnly
}: BottomNavProps) {
  // 未來活動列表視窗狀態
  const [isFutureActivitiesOpen, setIsFutureActivitiesOpen] = useState(false)
  
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const latestCnStartDate = useMemo(() => {
    if (!processedActivities.length) return null
    // 過濾有 cnStartDate 的活動（使用所有活動，不受篩選影響）
    const activitiesWithDate = processedActivities.filter(activity => 
      activity.cnStartDate && activity.startDate
    )
    if (!activitiesWithDate.length) return null
    // 找出最大日期
    const latest = activitiesWithDate.reduce((max, curr) => {
      return new Date(curr.cnStartDate!) > new Date(max.cnStartDate!) ? curr : max
    })
    return latest.cnStartDate
  }, [processedActivities]) 

  
  // 未來會開的活動
  const filteredPlannedActivities = useMemo(() => {
    if (!activities.length) return []

    try {
      let filtered = activities.filter((activity) => activity.status === "upcoming" && !activity.startDate && !activity.endDate)

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
          return activity.member && activity.member.some((member) => member === selectedMember)
        })
      }
      // 大活動篩選
      if (showMajorEventsOnly) {
        filtered = filtered.filter((activity) => activity.isMajorEvent)
      }

      // 根據 latestCnStartDate 標記 isSpecificDate
      if (latestCnStartDate) {
        filtered = filtered.map((activity) => {
          if (
            activity.cnStartDate &&
            new Date(activity.cnStartDate) < new Date(latestCnStartDate)
          ) {
            return { ...activity, isSpecificDate: true }
          }
          return activity
        })
      }
      return filtered
    } catch (err) {
      console.error("Error filtering upcoming activities:", err)
      return []
    }
  }, [activities, selectedCategory, selectedMember, latestCnStartDate, showMajorEventsOnly])

  return (
    <>
      {/* 底部導航按鈕 */}
      <div className="fixed bottom-5 md:bottom-16 left-1/2 -translate-x-1/2 w-11/12 md:w-xs flex z-50 border-2 border-blue-600 rounded-full">
        <Dialog open={isFutureActivitiesOpen} onOpenChange={setIsFutureActivitiesOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-[#16192ce0] hover:bg-[#16192c] text-white rounded-l-full shadow-lg w-1/2 py-3 px-4 h-auto flex gap-1 items-center justify-center transition"
              title="未來活動列表"
            ><Clock className="w-5 h-5" />未來活動列表
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900/80 backdrop-blur-sm border-gray-600 h-4/5 w-11/12 md:max-w-7xl flex flex-col text-white">
            <DialogHeader>
              <DialogTitle className="text-left">
                <p className=" flex items-center gap-2 mb-1">
                  <Clock className="w-5 h-5" style={{ color: "#3e6cc3" }} />
                  未來會開的活動
                </p>
                <p className="text-gray-400 text-sm">
                  日期只是猜的以官方為準，時鐘icon為特定日期或delay的活動
                </p>
                {latestCnStartDate && (
                  <p className="text-gray-400 text-xs">
                    目前活動進行到：{latestCnStartDate}
                  </p>
                )}
              </DialogTitle>
              <DialogDescription className="sr-only">
                查看即將到來的活動列表，包含預估開放時間和活動詳情
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-40 flex-auto">
              {/* 規劃中的活動列表 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlannedActivities.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-sm mb-2">沒有符合篩選條件的規劃活動</div>
                  </div>
                ) : (
                  filteredPlannedActivities.map((activity) => (
                    <div key={activity.id} className="flex bg-gray-800/30 p-3 rounded-lg" data-id={activity.id}>
                        <a href={activity.url} target="_blank" className="flex items-center gap-3">
                          <Image
                            src={activity.image || "/placeholder.svg"}
                            alt={activity.name}
                            className="w-16 h-16 rounded-full object-cover"
                            width={100}
                            height={100}
                            onError={(e) => { 
                              // 圖片載入失敗時的處理
                              const target = e.target as HTMLImageElement
                              target.src = "/placeholder.svg"
                            }}
                            loading="lazy"
                          />
                          <div className="h-full">
                            <h4 className={`${activity.isSpecificDate ? "text-blue-500" : "text-white"} flex items-center gap-1 font-medium`}>
                              {activity.isSpecificDate && (
                                <Clock className="w-3 h-3"/>
                              )}
                              {activity.name}
                              <div className="text-xs flex-shrink-0">
                                <SquareArrowOutUpRight className="w-3 h-3 " />
                              </div>
                            </h4>
                            {activity.cnStartDate && activity.cnEndDate && (
                            <p className="text-gray-400 text-xs">{activity.cnStartDate} ~ {activity.cnEndDate}</p>
                            )}
                            {activity.description && (
                              <p className="text-gray-400 text-sm">
                                {activity.description}
                              </p>
                            )}
                            {activity.category && (
                              <p className="text-gray-400 text-sm">
                                {activity.category ? activity.category.join("、") : ""}
                              </p>
                            )}
                            {activity.member && activity.member.length > 0 && (
                              <p className="text-gray-400 text-sm">
                                {activity.member ? activity.member.join("、") : ""}
                              </p>
                            )}
                          </div>
                        </a>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
        <Button
          onClick={scrollToTop}
          className="bg-[#16192ce0] hover:bg-[#16192c] border-l-1 border-l-blue-600 text-white rounded-r-full shadow-lg w-1/2 h-12 p-0 flex items-center justify-center"
          title="返回最上方"
        >
          <ArrowUp className="w-5 h-5" />回頂部
        </Button>
      </div>
    </>
  )
}