"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Calculator,
  MapPin,
  DollarSign,
  Settings,
  Navigation,
  Square,
  Heart,
  History,
  Save,
  Shield,
  FileText,
} from "lucide-react"
import { FareSettings } from "@/components/fare-settings"
import { RouteMap } from "@/components/route-map"
import { TripHistoryComponent } from "@/components/trip-history"
import { PrivacyPolicy } from "@/components/privacy-policy"
import { PatchNotes } from "@/components/patch-notes" // Added PatchNotes import
import { saveTripToHistory } from "@/lib/storage"

interface Coordinates {
  latitude: number
  longitude: number
  timestamp: number
}

function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((coord2.latitude - coord1.latitude) * Math.PI) / 180
  const dLon = ((coord2.longitude - coord1.longitude) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((coord1.latitude * Math.PI) / 180) *
      Math.cos((coord2.latitude * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function FareCalculator() {
  const [distance, setDistance] = useState("")
  const [fare, setFare] = useState<number | null>(null)
  const [baseFare, setBaseFare] = useState(15)
  const [baseDistance, setBaseDistance] = useState(4)
  const [ratePerKm, setRatePerKm] = useState(1)
  const [currency, setCurrency] = useState("₱")
  const [showSettings, setShowSettings] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showPatchNotes, setShowPatchNotes] = useState(false) // Added state for patch notes

  const [isTracking, setIsTracking] = useState(false)
  const [trackedDistance, setTrackedDistance] = useState(0)
  const [gpsError, setGpsError] = useState<string | null>(null)
  const watchIdRef = useRef<number | null>(null)
  const coordinatesRef = useRef<Coordinates[]>([])

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setGpsError("GPS is not supported by your device")
      return
    }

    setGpsError(null)
    setTrackedDistance(0)
    coordinatesRef.current = []
    setIsTracking(true)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const newCoord: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: position.timestamp,
        }

        if (coordinatesRef.current.length > 0) {
          const lastCoord = coordinatesRef.current[coordinatesRef.current.length - 1]
          const distanceIncrement = calculateDistance(lastCoord, newCoord)

          // Only add distance if movement is significant (more than 10 meters)
          if (distanceIncrement > 0.01) {
            setTrackedDistance((prev) => prev + distanceIncrement)
          }
        }

        coordinatesRef.current.push(newCoord)
      },
      (error) => {
        console.error("[v0] GPS error:", error)
        setGpsError("Unable to access GPS. Please enable location services.")
        stopTracking()
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    )
  }

  const stopTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsTracking(false)

    // Set the tracked distance to the input field
    if (trackedDistance > 0) {
      setDistance(trackedDistance.toFixed(2))
    }
  }

  const calculateFare = () => {
    const distanceNum = Number.parseFloat(distance)
    if (!isNaN(distanceNum) && distanceNum > 0) {
      let calculatedFare: number
      if (distanceNum <= baseDistance) {
        calculatedFare = baseFare
      } else {
        const additionalDistance = distanceNum - baseDistance
        calculatedFare = baseFare + additionalDistance * ratePerKm
      }
      setFare(calculatedFare)
    }
  }

  const resetCalculator = () => {
    setDistance("")
    setFare(null)
    setTrackedDistance(0)
    coordinatesRef.current = []
  }

  const saveTrip = async () => {
    if (fare === null || !distance) return

    const distanceNum = Number.parseFloat(distance)

    try {
      if (coordinatesRef.current.length > 0) {
        // GPS tracked trip
        await saveTripToHistory({
          type: "gps",
          distance: distanceNum,
          fare: fare,
          currency: currency,
          startPoint: {
            latitude: coordinatesRef.current[0].latitude,
            longitude: coordinatesRef.current[0].longitude,
          },
          endPoint: {
            latitude: coordinatesRef.current[coordinatesRef.current.length - 1].latitude,
            longitude: coordinatesRef.current[coordinatesRef.current.length - 1].longitude,
          },
          route: coordinatesRef.current.map((coord) => ({
            latitude: coord.latitude,
            longitude: coord.longitude,
            timestamp: coord.timestamp,
          })),
        })
      } else {
        // Manual entry
        await saveTripToHistory({
          type: "manual",
          distance: distanceNum,
          fare: fare,
          currency: currency,
        })
      }

      // Show success feedback
      alert("Trip saved to history and synced to cloud!")
    } catch (error) {
      console.error("[v0] Error saving trip:", error)
      alert("Trip saved locally, but cloud sync failed. Will retry later.")
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between max-w-2xl">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Calculator className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">GenSanFareCalculator</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setShowHistory(!showHistory)} className="rounded-full">
              <History className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)} className="rounded-full">
              <Settings className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setShowPrivacy(!showPrivacy)} className="rounded-full">
              <Shield className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowPatchNotes(!showPatchNotes)}
              className="rounded-full"
            >
              <FileText className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-6 max-w-2xl">
        {showPatchNotes ? (
          <PatchNotes onClose={() => setShowPatchNotes(false)} />
        ) : showPrivacy ? (
          <PrivacyPolicy onClose={() => setShowPrivacy(false)} />
        ) : showHistory ? (
          <TripHistoryComponent onClose={() => setShowHistory(false)} />
        ) : showSettings ? (
          <FareSettings
            baseFare={baseFare}
            baseDistance={baseDistance}
            ratePerKm={ratePerKm}
            currency={currency}
            onBaseFareChange={setBaseFare}
            onBaseDistanceChange={setBaseDistance}
            onRatePerKmChange={setRatePerKm}
            onCurrencyChange={setCurrency}
            onClose={() => setShowSettings(false)}
          />
        ) : (
          <div className="space-y-6">
            {/* Info Card */}
            <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-foreground mb-1">Calculate Your Fare</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Use GPS tracking to automatically measure your journey, or enter the distance manually.
                  </p>
                </div>
              </div>
            </Card>

            {/* Map Visualization */}
            {(isTracking || coordinatesRef.current.length > 0) && (
              <Card className="p-0 overflow-hidden">
                <RouteMap coordinates={coordinatesRef.current} isTracking={isTracking} />
              </Card>
            )}

            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">GPS Tracking</Label>
                  {isTracking && (
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-muted-foreground">Tracking...</span>
                    </div>
                  )}
                </div>

                {gpsError && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                    <p className="text-sm text-destructive">{gpsError}</p>
                  </div>
                )}

                {isTracking && (
                  <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-1">Distance Tracked</p>
                      <p className="text-3xl font-bold text-foreground">{trackedDistance.toFixed(2)} km</p>
                    </div>
                  </div>
                )}

                {!isTracking ? (
                  <Button onClick={startTracking} className="w-full h-14 text-base font-semibold" variant="default">
                    <Navigation className="w-5 h-5 mr-2" />
                    Start GPS Tracking
                  </Button>
                ) : (
                  <Button onClick={stopTracking} className="w-full h-14 text-base font-semibold" variant="destructive">
                    <Square className="w-5 h-5 mr-2" />
                    Stop Tracking
                  </Button>
                )}
              </div>
            </Card>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or enter manually</span>
              </div>
            </div>

            {/* Calculator Card */}
            <Card className="p-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="distance" className="text-base font-medium">
                    Distance Traveled
                  </Label>
                  <div className="relative">
                    <Input
                      id="distance"
                      type="number"
                      inputMode="decimal"
                      placeholder="0.0"
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                      className="text-2xl h-16 pr-16 font-semibold"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          calculateFare()
                        }
                      }}
                      disabled={isTracking}
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                      km
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={calculateFare}
                    className="flex-1 h-12 text-base font-semibold"
                    disabled={!distance || Number.parseFloat(distance) <= 0}
                  >
                    Calculate Fare
                  </Button>
                  {fare !== null && (
                    <Button onClick={resetCalculator} variant="outline" className="h-12 px-6 bg-transparent">
                      Reset
                    </Button>
                  )}
                </div>
              </div>
            </Card>

            {/* Result Card */}
            {fare !== null && (
              <Card className="p-8 bg-gradient-to-br from-primary to-accent border-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="text-center space-y-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary-foreground/20 mb-2">
                    <DollarSign className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-primary-foreground/80 mb-1">Total Fare</p>
                    <p className="text-5xl font-bold text-primary-foreground text-balance">
                      {currency}
                      {fare.toFixed(2)}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-primary-foreground/20">
                    <p className="text-xs text-primary-foreground/70">
                      {Number.parseFloat(distance) <= baseDistance
                        ? `Base fare for first ${baseDistance} km: ${currency}${baseFare.toFixed(2)}`
                        : `Base fare: ${currency}${baseFare.toFixed(2)} + ${(Number.parseFloat(distance) - baseDistance).toFixed(2)} km × ${currency}${ratePerKm.toFixed(2)}/km`}
                    </p>
                  </div>
                  <div className="pt-4">
                    <Button
                      onClick={saveTrip}
                      variant="secondary"
                      className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Trip to History
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Rate Info */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">First {baseDistance} km</span>
                <span className="font-semibold text-foreground">
                  {currency}
                  {baseFare.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-muted-foreground">Additional per km</span>
                <span className="font-semibold text-foreground">
                  {currency}
                  {ratePerKm.toFixed(2)}
                </span>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 max-w-2xl">
          <div className="flex flex-col items-center gap-3 mb-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 hover:bg-primary hover:text-primary-foreground transition-colors bg-transparent"
              onClick={() => {
                window.open("https://www.paypal.com/donate", "_blank")
              }}
            >
              <Heart className="w-4 h-4" />
              Donate
            </Button>
          </div>
          <div className="flex items-center justify-center gap-4 mb-2">
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
              onClick={() => setShowPrivacy(true)}
            >
              <Shield className="w-3 h-3 mr-1" />
              Privacy Policy
            </Button>
            <span className="text-xs text-muted-foreground">•</span>
            <Button
              variant="link"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-auto p-0"
              onClick={() => setShowPatchNotes(true)}
            >
              <FileText className="w-3 h-3 mr-1" />
              Patch Notes
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">Tap the settings icon to customize fare rates</p>
        </div>
      </footer>
    </div>
  )
}
