// store/slices/filtersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { SortOrder, DisplayActivityItem } from '@/types/activity-types'

interface FiltersState {
  sortOrder: SortOrder
  selectedYear: string
  selectedCategory: string
  selectedMember: string
  showMajorEventsOnly: boolean
  displayActivities: DisplayActivityItem[]
  hasActiveFilters: boolean
  searchQuery: string
  searchResults: SearchResult[]
  currentSearchIndex: number
  isSearching: boolean
}
interface SearchResult {
  activityId: string
  activityName: string
  matchText: string
  elementId?: string // DOM element ID for scrolling
}

const initialState: FiltersState = {
  sortOrder: 'desc',
  selectedYear: 'all',
  selectedCategory: 'all',
  selectedMember: 'all',
  showMajorEventsOnly: false,
  displayActivities: [],
  hasActiveFilters: false,
  searchQuery: "",
  searchResults: [],
  currentSearchIndex: -1,
  isSearching: false
}

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setSortOrder: (state, action: PayloadAction<SortOrder>) => {
      state.sortOrder = action.payload
    },
    setSelectedYear: (state, action: PayloadAction<string>) => {
      state.selectedYear = action.payload
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload
    },
    setSelectedMember: (state, action: PayloadAction<string>) => {
      state.selectedMember = action.payload
    },
    setShowMajorEventsOnly: (state, action: PayloadAction<boolean>) => {
      state.showMajorEventsOnly = action.payload
    },
    setDisplayActivities: (state, action: PayloadAction<DisplayActivityItem[]>) => {
      state.displayActivities = action.payload
    },
    resetFilters: (state) => {
      state.selectedYear = 'all'
      state.selectedCategory = 'all'
      state.selectedMember = 'all'
      state.showMajorEventsOnly = false
      state.hasActiveFilters = false
    },
    setHasActiveFilters: (state, action: PayloadAction<boolean>) => {
      state.hasActiveFilters = action.payload
    },
  },
})

export const {
  setSortOrder,
  setSelectedYear,
  setSelectedCategory,
  setSelectedMember,
  setShowMajorEventsOnly,
  setDisplayActivities,
  resetFilters,
  setHasActiveFilters
} = filtersSlice.actions

export default filtersSlice.reducer