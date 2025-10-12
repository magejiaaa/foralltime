export interface Activity {
  id: string
  name: string
  startDate: string
  endDate: string
  cnStartDate?: string
  cnEndDate?: string
  status: "completed" | "ongoing" | "upcoming"
  url: string
  image: string
  category?: Array<string>
  member?: Array<string>
  description?: string
  childrenActivities?: Array<string>
  calculatedStatus?: string;
  packageId?: string // 關聯的方案ID
  isSpecificDate?: boolean // 特定日期不照順序
  isMajorEvent?: boolean // 是否為大活動
}

export const statusConfig = {
  completed: { color: "bg-gray-500", label: "已結束", icon: "CheckCircle" },
  ongoing: { color: "bg-blue-500", label: "進行中", icon: "PlayCircle" },
  upcoming: { color: "bg-blue-400", label: "尚未開始", icon: "Clock" },
} as const
