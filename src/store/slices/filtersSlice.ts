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
  searchTerm: string
  searchResults: string[]
  currentSearchIndex: number
}

const initialState: FiltersState = {
  sortOrder: 'desc',
  selectedYear: 'all',
  selectedCategory: 'all',
  selectedMember: 'all',
  showMajorEventsOnly: false,
  displayActivities: [],
  hasActiveFilters: false,
  searchTerm: "",
  searchResults: [],
  currentSearchIndex: -1,
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
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
      state.currentSearchIndex = 0;
    },
    setSearchResults(state, action: PayloadAction<string[]>) {
      state.searchResults = action.payload;
      // 沒有結果 → index 設 -1
      state.currentSearchIndex = action.payload.length > 0 ? 0 : -1;
    },
    goNext(state) {
      if (state.searchResults.length === 0) return;
      state.currentSearchIndex = (state.currentSearchIndex + 1) % state.searchResults.length;
    },
    goPrev(state) {
      if (state.searchResults.length === 0) return;
      state.currentSearchIndex =
        (state.currentSearchIndex - 1 + state.searchResults.length) % state.searchResults.length;
    }
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
  setHasActiveFilters,
  setSearchTerm,
  setSearchResults,
  goNext,
  goPrev
} = filtersSlice.actions

export default filtersSlice.reducer