"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { ScrollArea } from "@/components/ui/scroll-area"

interface PatchNotesProps {
  onClose: () => void
}

export function PatchNotes({ onClose }: PatchNotesProps) {
  const versions = [
    {
      version: "1.8.0",
      date: "2025-02-10",
      changes: [
        "Added comprehensive privacy policy",
        "Added information about data collection and usage",
        "Clarified user rights and data deletion options",
        "Added patch notes page to track application changes",
      ],
    },
    {
      version: "1.7.0",
      date: "2025-02-10",
      changes: [
        "Integrated Supabase cloud storage",
        "Automatic sync between local storage and cloud",
        "Device-based data storage without login requirement",
        "Added refresh button to manually sync with cloud",
        "Improved offline support with automatic sync when online",
      ],
    },
    {
      version: "1.6.0",
      date: "2025-02-09",
      changes: [
        "Fixed map height issue causing infinite expansion",
        "Improved map container styling and constraints",
        "Enhanced overall app usability",
      ],
    },
    {
      version: "1.5.0",
      date: "2025-02-09",
      changes: [
        "Added travel history feature",
        "Implemented local storage for trip data",
        "Added unique device identifier for data tracking",
        "Created history view with trip details",
        "Added delete and clear all functionality",
      ],
    },
    {
      version: "1.4.0",
      date: "2025-02-08",
      changes: [
        "Added interactive map visualization using Leaflet",
        "Display GPS tracking route on map",
        "Show start and end markers with labels",
        "Real-time route drawing during GPS tracking",
      ],
    },
    {
      version: "1.3.0",
      date: "2025-02-08",
      changes: ["Added donate button to support development", "Integrated donation functionality"],
    },
    {
      version: "1.2.0",
      date: "2025-02-07",
      changes: [
        "Updated fare structure and pricing",
        "Changed currency from PHP to Pesos (₱)",
        "Adjusted base fare and per-kilometer rates",
      ],
    },
    {
      version: "1.1.0",
      date: "2025-02-07",
      changes: [
        "Added GPS tracking functionality",
        "Real-time distance calculation using GPS coordinates",
        "Automatic fare calculation based on tracked distance",
        "Start/stop tracking controls",
      ],
    },
    {
      version: "1.0.0",
      date: "2025-02-06",
      changes: [
        "Initial release of GenSanFareCalculator",
        "Manual distance entry and fare calculation",
        "Customizable fare settings",
        "Dark/light theme support",
        "Responsive PWA design",
      ],
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Patch Notes</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-5 w-5" />
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-200px)]">
        <div className="space-y-6 pr-4">
          {versions.map((version) => (
            <Card key={version.version} className="p-6">
              <div className="border-l-4 border-primary pl-4">
                <div className="flex items-baseline gap-3 mb-3">
                  <h3 className="text-xl font-bold text-foreground">v{version.version}</h3>
                  <span className="text-sm text-muted-foreground">{version.date}</span>
                </div>
                <ul className="space-y-2">
                  {version.changes.map((change, index) => (
                    <li key={index} className="flex gap-3 text-sm">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span className="text-muted-foreground leading-relaxed">{change}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
