// store/slices/uiSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  hoveredActivity: string | null
  hoveredImage: string | null
  imageTooltipPosition: { x: number; y: number }
  tooltipPosition: { x: number; y: number; side: 'left' | 'right' }
  isMobile: boolean
  showAll: boolean
}

const initialState: UIState = {
  hoveredActivity: null,
  hoveredImage: null,
  imageTooltipPosition: { x: 0, y: 0 },
  tooltipPosition: { x: 0, y: 0, side: 'right' },
  isMobile: false,
  showAll: false,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setHoveredActivity: (state, action: PayloadAction<string | null>) => {
      state.hoveredActivity = action.payload
    },
    setHoveredImage: (state, action: PayloadAction<string | null>) => {
      state.hoveredImage = action.payload
    },
    setImageTooltipPosition: (state, action: PayloadAction<{ x: number; y: number }>) => {
      state.imageTooltipPosition = action.payload
    },
    setTooltipPosition: (state, action: PayloadAction<{ x: number; y: number; side: 'left' | 'right' }>) => {
      state.tooltipPosition = action.payload
    },
    setIsMobile: (state, action: PayloadAction<boolean>) => {
      state.isMobile = action.payload
    },
    setShowAll: (state, action: PayloadAction<boolean>) => {
      state.showAll = action.payload
    }
  },
})

export const {
  setHoveredActivity,
  setHoveredImage,
  setImageTooltipPosition,
  setTooltipPosition,
  setIsMobile,
  setShowAll
} = uiSlice.actions

export default uiSlice.reducer