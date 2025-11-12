// store/slices/activitiesSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { Activity, ProcessedActivity } from '@/types/activity-types'
import type { Package } from '@/types/packages-types'
import type { CardType } from '@/types/card-types'

interface ActivitiesState {
  activities: Activity[]
  processedActivities: ProcessedActivity[]
  packages: Package[]
  cardDataList: CardType[]
  isLoading: boolean
  error: string | null
}

const initialState: ActivitiesState = {
  activities: [],
  processedActivities: [],
  packages: [],
  isLoading: true,
  error: null,
  cardDataList: [],
}

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    setActivities(state, action: PayloadAction<Activity[]>) {
      state.activities = action.payload
    },
    setProcessedActivities(state, action: PayloadAction<ProcessedActivity[]>) {
      state.processedActivities = action.payload
    },
    setPackages(state, action: PayloadAction<Package[]>) {
      state.packages = action.payload
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload
    },
    setCardDataList(state, action: PayloadAction<CardType[]>) {
      state.cardDataList = action.payload
    },
  },
})

export const {
  setActivities,
  setProcessedActivities,
  setPackages,
  setLoading,
  setError,
  setCardDataList,
} = activitiesSlice.actions

export default activitiesSlice.reducer