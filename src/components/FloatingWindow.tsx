"use client"
import type React from "react"
import Image from 'next/image'

import { statusConfig } from "../types/activity-types"
// Redux imports
import { useAppSelector } from '@/store/hooks'

export default function FloatingWindow() {
  const { hoveredActivity, tooltipPosition, hoveredImage, imageTooltipPosition } = useAppSelector(state => state.ui)
  const { processedActivities } = useAppSelector(state => state.activities)

  const hoveredActivityData = hoveredActivity ? processedActivities.find((a) => a.id === hoveredActivity) : null


  return (
    <>
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
            <img
              src={hoveredImage.replace("height=40&width=40", "height=auto&width=auto") || "/placeholder.svg"}
              alt="活動圖片預覽"
              referrerPolicy="no-referrer"
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
    </>
  )
}