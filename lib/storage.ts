import { createClient } from "@/lib/supabase/client"

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

async function syncTripToCloud(trip: TripHistory): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("trips").insert({
      id: trip.id,
      device_id: trip.deviceId,
      trip_type: trip.type,
      distance: trip.distance,
      fare: trip.fare,
      currency: trip.currency,
      timestamp: trip.timestamp,
      start_lat: trip.startPoint?.latitude,
      start_lng: trip.startPoint?.longitude,
      end_lat: trip.endPoint?.latitude,
      end_lng: trip.endPoint?.longitude,
      route: trip.route ? JSON.stringify(trip.route) : null,
    })

    if (error) {
      console.error("[v0] Error syncing trip to cloud:", error)
    }
  } catch (error) {
    console.error("[v0] Error syncing trip to cloud:", error)
  }
}

async function fetchTripsFromCloud(deviceId: string): Promise<TripHistory[]> {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("trips")
      .select("*")
      .eq("device_id", deviceId)
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching trips from cloud:", error)
      return []
    }

    return (data || []).map((trip) => ({
      id: trip.id,
      deviceId: trip.device_id,
      timestamp: trip.timestamp,
      type: trip.trip_type as "gps" | "manual",
      distance: Number(trip.distance),
      fare: Number(trip.fare),
      currency: trip.currency,
      startPoint:
        trip.start_lat && trip.start_lng
          ? {
              latitude: Number(trip.start_lat),
              longitude: Number(trip.start_lng),
            }
          : undefined,
      endPoint:
        trip.end_lat && trip.end_lng
          ? {
              latitude: Number(trip.end_lat),
              longitude: Number(trip.end_lng),
            }
          : undefined,
      route: trip.route ? JSON.parse(trip.route) : undefined,
    }))
  } catch (error) {
    console.error("[v0] Error fetching trips from cloud:", error)
    return []
  }
}

async function deleteTripFromCloud(tripId: string): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("trips").delete().eq("id", tripId)

    if (error) {
      console.error("[v0] Error deleting trip from cloud:", error)
    }
  } catch (error) {
    console.error("[v0] Error deleting trip from cloud:", error)
  }
}

async function clearTripsFromCloud(deviceId: string): Promise<void> {
  try {
    const supabase = createClient()

    const { error } = await supabase.from("trips").delete().eq("device_id", deviceId)

    if (error) {
      console.error("[v0] Error clearing trips from cloud:", error)
    }
  } catch (error) {
    console.error("[v0] Error clearing trips from cloud:", error)
  }
}

export async function saveTripToHistory(trip: Omit<TripHistory, "id" | "deviceId" | "timestamp">): Promise<void> {
  if (typeof window === "undefined") return

  const history = getTripHistory()
  const newTrip: TripHistory = {
    ...trip,
    id: `trip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    deviceId: getDeviceId(),
    timestamp: Date.now(),
  }

  history.unshift(newTrip)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))

  // Sync to cloud
  await syncTripToCloud(newTrip)
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

export async function getTripHistoryAsync(): Promise<TripHistory[]> {
  if (typeof window === "undefined") return []

  try {
    const deviceId = getDeviceId()

    // Fetch from cloud
    const cloudTrips = await fetchTripsFromCloud(deviceId)

    // Get local trips
    const localTrips = getTripHistory()

    // Merge and deduplicate by ID, preferring cloud data
    const tripsMap = new Map<string, TripHistory>()

    localTrips.forEach((trip) => tripsMap.set(trip.id, trip))
    cloudTrips.forEach((trip) => tripsMap.set(trip.id, trip))

    const mergedTrips = Array.from(tripsMap.values()).sort((a, b) => b.timestamp - a.timestamp)

    // Update localStorage with merged data
    localStorage.setItem(HISTORY_KEY, JSON.stringify(mergedTrips))

    return mergedTrips
  } catch (error) {
    console.error("[v0] Error getting trip history:", error)
    return getTripHistory()
  }
}

export async function deleteTripFromHistory(tripId: string): Promise<void> {
  if (typeof window === "undefined") return

  const history = getTripHistory()
  const updatedHistory = history.filter((trip) => trip.id !== tripId)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))

  // Delete from cloud
  await deleteTripFromCloud(tripId)
}

export async function clearTripHistory(): Promise<void> {
  if (typeof window === "undefined") return

  const deviceId = getDeviceId()
  localStorage.removeItem(HISTORY_KEY)

  // Clear from cloud
  await clearTripsFromCloud(deviceId)
}
