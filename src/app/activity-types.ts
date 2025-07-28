export interface Activity {
  id: string
  name: string
  startDate: string
  endDate: string
  status: "completed" | "ongoing" | "upcoming" | "planned"
  url: string
  image: string
  category?: string
  member?: Array<string>
}

export const statusConfig = {
  completed: { color: "bg-gray-500", label: "已結束", icon: "CheckCircle" },
  ongoing: { color: "bg-blue-500", label: "進行中", icon: "PlayCircle" },
  upcoming: { color: "bg-blue-400", label: "即將開始", icon: "Clock" },
  planned: { color: "bg-blue-300", label: "規劃中", icon: "PauseCircle" },
} as const
