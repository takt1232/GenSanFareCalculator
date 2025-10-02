"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MapPin, Navigation, Trash2, Calendar, RefreshCw } from "lucide-react"
import { getTripHistoryAsync, deleteTripFromHistory, clearTripHistory, type TripHistory } from "@/lib/storage"

interface TripHistoryProps {
  onClose: () => void
}

export function TripHistoryComponent({ onClose }: TripHistoryProps) {
  const [history, setHistory] = useState<TripHistory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadHistory = async () => {
    setIsLoading(true)
    try {
      const trips = await getTripHistoryAsync()
      setHistory(trips)
    } catch (error) {
      console.error("[v0] Error loading history:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadHistory()
  }, [])

  const handleDelete = async (tripId: string) => {
    try {
      await deleteTripFromHistory(tripId)
      const updatedHistory = await getTripHistoryAsync()
      setHistory(updatedHistory)
    } catch (error) {
      console.error("[v0] Error deleting trip:", error)
      alert("Failed to delete trip. Please try again.")
    }
  }

  const handleClearAll = async () => {
    if (
      confirm("Are you sure you want to clear all trip history? This will delete from both local storage and cloud.")
    ) {
      try {
        await clearTripHistory()
        setHistory([])
      } catch (error) {
        console.error("[v0] Error clearing history:", error)
        alert("Failed to clear history. Please try again.")
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const trips = await getTripHistoryAsync()
      setHistory(trips)
    } catch (error) {
      console.error("[v0] Error refreshing history:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Trip History</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {history.length} {history.length === 1 ? "trip" : "trips"} recorded
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isRefreshing} className="rounded-full">
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      {history.length > 0 && (
        <Button variant="outline" size="sm" onClick={handleClearAll} className="w-full bg-transparent">
          <Trash2 className="w-4 h-4 mr-2" />
          Clear All History
        </Button>
      )}

      <ScrollArea className="h-[calc(100vh-16rem)]">
        {isLoading ? (
          <Card className="p-8">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2">
                <RefreshCw className="w-6 h-6 text-muted-foreground animate-spin" />
              </div>
              <p className="text-muted-foreground">Loading trip history...</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {history.length === 0 ? (
              <Card className="p-8">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-2">
                    <MapPin className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No trips recorded yet</p>
                  <p className="text-sm text-muted-foreground">
                    Start tracking or calculate a fare to save your first trip
                  </p>
                </div>
              </Card>
            ) : (
              history.map((trip) => (
                <Card key={trip.id} className="p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        {trip.type === "gps" ? (
                          <Navigation className="w-4 h-4 text-primary" />
                        ) : (
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                        )}
                        <span className="text-xs font-medium text-muted-foreground uppercase">
                          {trip.type === "gps" ? "GPS Tracked" : "Manual Entry"}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-foreground">
                          {trip.currency}
                          {trip.fare.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">{trip.distance.toFixed(2)} km</span>
                      </div>

                      {trip.type === "gps" && trip.startPoint && trip.endPoint && (
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-start gap-1">
                            <span className="text-green-500">●</span>
                            <span>
                              Start: {trip.startPoint.latitude.toFixed(6)}, {trip.startPoint.longitude.toFixed(6)}
                            </span>
                          </div>
                          <div className="flex items-start gap-1">
                            <span className="text-red-500">●</span>
                            <span>
                              End: {trip.endPoint.latitude.toFixed(6)}, {trip.endPoint.longitude.toFixed(6)}
                            </span>
                          </div>
                          {trip.route && (
                            <div className="flex items-start gap-1">
                              <span>Route points: {trip.route.length}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="w-3 h-3" />
                        {formatDate(trip.timestamp)}
                      </div>
                    </div>

                    <Button variant="ghost" size="icon" onClick={() => handleDelete(trip.id)} className="flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
