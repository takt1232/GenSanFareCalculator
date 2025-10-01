"use client"

import { useEffect, useRef } from "react"
import { MapPin } from "lucide-react"

interface Coordinates {
  latitude: number
  longitude: number
  timestamp: number
}

interface RouteMapProps {
  coordinates: Coordinates[]
  isTracking: boolean
}

export function RouteMap({ coordinates, isTracking }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const polylineRef = useRef<any>(null)

  useEffect(() => {
    // Dynamically import Leaflet only on client side
    if (typeof window !== "undefined" && mapRef.current && !mapInstanceRef.current) {
      import("leaflet").then((L) => {
        // Initialize map
        const map = L.map(mapRef.current!, {
          center: [6.1164, 125.1716], // General Santos City coordinates
          zoom: 13,
          zoomControl: true,
        })

        // Add OpenStreetMap tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          maxZoom: 19,
        }).addTo(map)

        mapInstanceRef.current = map

        // Add custom CSS for Leaflet
        const style = document.createElement("style")
        style.textContent = `
          .leaflet-container {
            height: 100%;
            width: 100%;
          }
          .leaflet-control-attribution {
            font-size: 10px;
          }
        `
        document.head.appendChild(style)
      })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (!mapInstanceRef.current || coordinates.length === 0) return

    import("leaflet").then((L) => {
      const map = mapInstanceRef.current

      // Clear existing markers and polyline
      markersRef.current.forEach((marker) => marker.remove())
      markersRef.current = []
      if (polylineRef.current) {
        polylineRef.current.remove()
      }

      // Create custom icons
      const startIcon = L.divIcon({
        html: `<div style="background-color: #10b981; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
        </div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const endIcon = L.divIcon({
        html: `<div style="background-color: #ef4444; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        </div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      const currentIcon = L.divIcon({
        html: `<div style="background-color: #0ea5e9; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 2s infinite;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        </div>
        <style>
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        </style>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      })

      // Add start marker
      const startMarker = L.marker([coordinates[0].latitude, coordinates[0].longitude], {
        icon: startIcon,
      })
        .addTo(map)
        .bindPopup("Start")
      markersRef.current.push(startMarker)

      // Add end/current marker
      const lastCoord = coordinates[coordinates.length - 1]
      const endMarker = L.marker([lastCoord.latitude, lastCoord.longitude], {
        icon: isTracking ? currentIcon : endIcon,
      })
        .addTo(map)
        .bindPopup(isTracking ? "Current Location" : "End")
      markersRef.current.push(endMarker)

      // Draw polyline for the route
      const latLngs = coordinates.map((coord) => [coord.latitude, coord.longitude] as [number, number])
      polylineRef.current = L.polyline(latLngs, {
        color: "#0ea5e9",
        weight: 4,
        opacity: 0.8,
        smoothFactor: 1,
      }).addTo(map)

      // Fit map to show entire route
      const bounds = L.latLngBounds(latLngs)
      map.fitBounds(bounds, { padding: [50, 50] })
    })
  }, [coordinates, isTracking])

  return (
    <div className="relative">
      <div ref={mapRef} className="w-full h-[300px] rounded-lg" />
      {coordinates.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-lg">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Start tracking to see your route</p>
          </div>
        </div>
      )}
      {isTracking && (
        <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 shadow-lg">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Live Tracking
        </div>
      )}
    </div>
  )
}
