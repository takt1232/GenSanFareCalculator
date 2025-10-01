export interface TripHistory {
  id: string
  deviceId: string
  timestamp: number
  type: "gps" | "manual"
  distance: number
  fare: number
  currency: string
  // GPS-specific data
  startPoint?: {
    latitude: number
    longitude: number
  }
  endPoint?: {
    latitude: number
    longitude: number
  }
  route?: Array<{
    latitude: number
    longitude: number
    timestamp: number
  }>
}

const DEVICE_ID_KEY = "gensan_device_id"
const HISTORY_KEY = "gensan_trip_history"

export function getDeviceId(): string {
  if (typeof window === "undefined") return ""

  let deviceId = localStorage.getItem(DEVICE_ID_KEY)

  if (!deviceId) {
    // Generate a unique device ID
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    localStorage.setItem(DEVICE_ID_KEY, deviceId)
  }

  return deviceId
}

export function saveTripToHistory(trip: Omit<TripHistory, "id" | "deviceId" | "timestamp">): void {
  if (typeof window === "undefined") return

  const history = getTripHistory()
  const newTrip: TripHistory = {
    ...trip,
    id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    deviceId: getDeviceId(),
    timestamp: Date.now(),
  }

  history.unshift(newTrip) // Add to beginning of array
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
}

export function getTripHistory(): TripHistory[] {
  if (typeof window === "undefined") return []

  try {
    const history = localStorage.getItem(HISTORY_KEY)
    return history ? JSON.parse(history) : []
  } catch (error) {
    console.error("[v0] Error reading trip history:", error)
    return []
  }
}

export function deleteTripFromHistory(tripId: string): void {
  if (typeof window === "undefined") return

  const history = getTripHistory()
  const updatedHistory = history.filter((trip) => trip.id !== tripId)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
}

export function clearTripHistory(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(HISTORY_KEY)
}
