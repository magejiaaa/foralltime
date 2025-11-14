// store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux'
import { useEffect } from "react";
import { setSearchResults } from "./slices/filtersSlice";
import type { RootState, AppDispatch } from './store'
import type { Activity } from '@/types/activity-types'
import type { CardType } from '@/types/card-types'

// 使用這些 hooks 而不是直接使用 useDispatch 和 useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector

// 搜尋
export function useSearchEngine(
  displayActivities: Array<{ activity: Activity; isChild: boolean; level: number }>,
  cards: CardType[]
) {
  const dispatch = useAppDispatch();
  const searchTerm = useAppSelector(s => s.filters.searchTerm);

  useEffect(() => {
    if (!searchTerm) {
      dispatch(setSearchResults([]));
      return;
    }
    // 使用 debounce，延遲 300ms 執行搜尋
    const debounceTimer = setTimeout(() => {
      const term = searchTerm.trim().toLowerCase();
      const resultSet = new Set<string>();
      
      // 從 displayActivities 取出實際的 activity
      const activities = displayActivities.map(({ activity }) => activity);

      // 搜尋 Activity（文字）
      for (const activity of activities) {
        if (
          activity.name.toLowerCase().includes(term) ||
          activity.description?.toLowerCase().includes(term)
        ) {
          resultSet.add(activity.id);
        }
      }

      // 搜尋 Card item - 預先建立查找表
      const activityIdSet = new Set(activities.map(a => a.id));
      for (const card of cards) {
        for (const item of card.item) {
          if (item.name.toLowerCase().includes(term)) {
            for (const id of card.activityId) {
              if (activityIdSet.has(id)) {
                resultSet.add(id);
              }
            }
            break; // 找到匹配就跳出內層迴圈
          }
        }
      }

      dispatch(setSearchResults(Array.from(resultSet)));
    }, 300); // 300ms 延遲

    // 清除之前的 timer
    return () => clearTimeout(debounceTimer);
  }, [searchTerm, displayActivities, cards, dispatch]);
}