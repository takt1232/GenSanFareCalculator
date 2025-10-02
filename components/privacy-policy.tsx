"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Shield, Database, Trash2, Cloud, Smartphone } from "lucide-react"

interface PrivacyPolicyProps {
  onClose: () => void
}

export function PrivacyPolicy({ onClose }: PrivacyPolicyProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">Privacy Policy</h2>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <ScrollArea className="h-[calc(100vh-12rem)]">
        <div className="space-y-6 pr-4">
          {/* Introduction */}
          <Card className="p-6 bg-muted/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              GenSanFareCalculator is committed to protecting your privacy. This policy explains what data we collect
              and how it's used.
            </p>
          </Card>

          {/* Data Collection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">What Data We Collect</h3>
            </div>
            <Card className="p-5">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">GPS Coordinates:</strong> When you use GPS tracking, we collect
                    your location data including starting point, destination, and the route traveled.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">Distance & Fare:</strong> We store the distance traveled and
                    calculated fare for each trip.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">Device Identifier:</strong> A unique ID is generated for your
                    device to sync your data across sessions.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">Timestamps:</strong> We record when each trip was saved.
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Purpose */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Why We Collect This Data</h3>
            </div>
            <Card className="p-5 bg-primary/5 border-primary/20">
              <p className="text-sm text-foreground leading-relaxed">
                The <strong>sole purpose</strong> of collecting this data is to{" "}
                <strong>test the accuracy of the application</strong>. We analyze trip data to ensure our fare
                calculations and GPS tracking are working correctly and to improve the app's performance.
              </p>
            </Card>
          </div>

          {/* Storage */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">How We Store Your Data</h3>
            </div>
            <Card className="p-5">
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">Local Storage:</strong> Your trip data is stored on your device
                    for offline access.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">Cloud Storage:</strong> Data is synced to our secure cloud
                    database (Supabase) to prevent data loss and enable future features.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  <span>
                    <strong className="text-foreground">No Authentication Required:</strong> We don't require login or
                    personal information. Your data is tied only to your device ID.
                  </span>
                </li>
              </ul>
            </Card>
          </div>

          {/* Data Control */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold text-foreground">Your Data Control</h3>
            </div>
            <Card className="p-5 bg-accent/50">
              <div className="space-y-3 text-sm text-foreground">
                <p className="leading-relaxed">
                  You have <strong>full control</strong> over your data. You can delete your trip history at any time:
                </p>
                <ul className="space-y-2 ml-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">1.</span>
                    <span>
                      <strong>Delete Individual Trips:</strong> Tap the trash icon on any trip in your history to delete
                      it.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">2.</span>
                    <span>
                      <strong>Clear All History:</strong> Use the "Clear All History" button to delete all your trips at
                      once.
                    </span>
                  </li>
                </ul>
                <p className="leading-relaxed pt-2 text-muted-foreground">
                  Deleting trips removes them from both your device and our cloud database permanently.
                </p>
              </div>
            </Card>
          </div>

          {/* Data Sharing */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">Data Sharing</h3>
            <Card className="p-5">
              <p className="text-sm text-muted-foreground leading-relaxed">
                We <strong>do not share, sell, or distribute</strong> your data to any third parties. Your trip data is
                used exclusively for testing and improving the accuracy of this application.
              </p>
            </Card>
          </div>

          {/* Contact */}
          <Card className="p-5 bg-muted/30">
            <p className="text-xs text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Questions?</strong> If you have any concerns about your privacy or how
              your data is handled, please contact us through the app's support channels.
            </p>
          </Card>

          <div className="pb-4">
            <p className="text-xs text-center text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
