import test from "node:test"
import assert from "node:assert/strict"

import {
  __resetSupabaseClientFactory,
  __setSupabaseClientFactory,
  getTripHistoryAsync,
  TripHistory,
} from "./storage"

const HISTORY_KEY = "gensan_trip_history"

type SupabaseResponse = {
  data: Array<Record<string, unknown>> | null
  error: unknown
}

function createSupabaseMock(response: SupabaseResponse) {
  return {
    from() {
      return {
        select() {
          return {
            eq() {
              return {
                order() {
                  return Promise.resolve(response)
                },
              }
            },
          }
        },
      }
    },
  }
}

class LocalStorageMock {
  private store = new Map<string, string>()

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value)
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

test("merges cloud trips with string and array routes while preserving coordinates", async (t) => {
  const localStorage = new LocalStorageMock()
  ;(globalThis as any).window = { localStorage }
  ;(globalThis as any).localStorage = localStorage

  const localTrip: TripHistory = {
    id: "local-trip",
    deviceId: "device-local",
    timestamp: 1,
    type: "gps",
    distance: 1,
    fare: 10,
    currency: "PHP",
    route: [
      { latitude: 6.1, longitude: 125.1, timestamp: 100 },
      { latitude: 6.2, longitude: 125.2, timestamp: 200 },
    ],
  }

  localStorage.setItem(HISTORY_KEY, JSON.stringify([localTrip]))

  const stringRoute = [
    { latitude: 6.15, longitude: 125.15, timestamp: 150 },
    { latitude: 6.25, longitude: 125.25, timestamp: 250 },
  ]
  const arrayRoute = [
    { latitude: 6.3, longitude: 125.3, timestamp: 300 },
    { latitude: 6.4, longitude: 125.4, timestamp: 400 },
  ]

  __setSupabaseClientFactory(() =>
    createSupabaseMock({
      data: [
        {
          id: "cloud-string",
          device_id: "device-123",
          timestamp: 3,
          trip_type: "gps",
          distance: 2,
          fare: 20,
          currency: "PHP",
          start_lat: 6.1,
          start_lng: 125.1,
          end_lat: 6.2,
          end_lng: 125.2,
          route: JSON.stringify(stringRoute),
        },
        {
          id: "cloud-array",
          device_id: "device-123",
          timestamp: 4,
          trip_type: "gps",
          distance: 3,
          fare: 30,
          currency: "PHP",
          start_lat: 6.3,
          start_lng: 125.3,
          end_lat: 6.4,
          end_lng: 125.4,
          route: arrayRoute,
        },
      ],
      error: null,
    }),
  )

  t.after(() => {
    __resetSupabaseClientFactory()
    delete (globalThis as any).window
    delete (globalThis as any).localStorage
  })

  const trips = await getTripHistoryAsync()

  assert.equal(trips.length, 3)

  const fromString = trips.find((trip) => trip.id === "cloud-string")
  assert.deepEqual(fromString?.route, stringRoute)

  const fromArray = trips.find((trip) => trip.id === "cloud-array")
  assert.deepEqual(fromArray?.route, arrayRoute)

  const persisted = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as TripHistory[]
  const persistedString = persisted.find((trip) => trip.id === "cloud-string")
  const persistedArray = persisted.find((trip) => trip.id === "cloud-array")
  const persistedLocal = persisted.find((trip) => trip.id === "local-trip")

  assert.deepEqual(persistedString?.route, stringRoute)
  assert.deepEqual(persistedArray?.route, arrayRoute)
  assert.deepEqual(persistedLocal?.route, localTrip.route)
})

test("malformed routes from the cloud are ignored", async (t) => {
  const localStorage = new LocalStorageMock()
  ;(globalThis as any).window = { localStorage }
  ;(globalThis as any).localStorage = localStorage

  __setSupabaseClientFactory(() =>
    createSupabaseMock({
      data: [
        {
          id: "bad-route",
          device_id: "device-123",
          timestamp: 5,
          trip_type: "gps",
          distance: 4,
          fare: 40,
          currency: "PHP",
          route: "{not-json}",
        },
      ],
      error: null,
    }),
  )

  t.after(() => {
    __resetSupabaseClientFactory()
    delete (globalThis as any).window
    delete (globalThis as any).localStorage
  })

  const trips = await getTripHistoryAsync()

  assert.equal(trips.length, 1)
  assert.equal(trips[0]?.id, "bad-route")
  assert.equal(trips[0]?.route, undefined)

  const persisted = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? "[]") as TripHistory[]
  assert.equal(persisted[0]?.route, undefined)
})
