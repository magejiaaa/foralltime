// icon
import {
  Clock,
  CheckCircle,
  PlayCircle
} from "lucide-react"

export const getStatusIcon = (iconName: string) => {
  switch (iconName) {
    case "CheckCircle":
      return CheckCircle
    case "PlayCircle":
      return PlayCircle
    case "Clock":
      return Clock
    default:
      return Clock
  }
}