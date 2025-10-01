"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Info } from "lucide-react"

interface FareSettingsProps {
  baseFare: number
  baseDistance: number
  ratePerKm: number
  currency: string
  onBaseFareChange: (value: number) => void
  onBaseDistanceChange: (value: number) => void
  onRatePerKmChange: (value: number) => void
  onCurrencyChange: (value: string) => void
  onClose: () => void
}

export function FareSettings({
  baseFare,
  baseDistance,
  ratePerKm,
  currency,
  onBaseFareChange,
  onBaseDistanceChange,
  onRatePerKmChange,
  onCurrencyChange,
  onClose,
}: FareSettingsProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h2 className="text-2xl font-bold text-foreground">Fare Settings</h2>
      </div>

      <Card className="p-6 bg-primary/5 border-primary/20">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
            <Info className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Customize the fare structure and currency to match your local transportation rates. These settings will be
              saved for future calculations.
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="currency" className="text-base font-medium">
              Currency
            </Label>
            <p className="text-xs text-muted-foreground mb-2">Select your preferred currency symbol</p>
            <Select value={currency} onValueChange={onCurrencyChange}>
              <SelectTrigger className="h-14 text-xl font-semibold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="₱">₱ - Philippine Peso</SelectItem>
                <SelectItem value="$">$ - US Dollar</SelectItem>
                <SelectItem value="€">€ - Euro</SelectItem>
                <SelectItem value="£">£ - British Pound</SelectItem>
                <SelectItem value="¥">¥ - Japanese Yen</SelectItem>
                <SelectItem value="₹">₹ - Indian Rupee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseFare" className="text-base font-medium">
              Base Fare
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              The fare charged for the first {baseDistance} kilometer(s)
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {currency}
              </span>
              <Input
                id="baseFare"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={baseFare}
                onChange={(e) => onBaseFareChange(Number.parseFloat(e.target.value) || 0)}
                className="text-xl h-14 pl-10 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="baseDistance" className="text-base font-medium">
              Base Distance
            </Label>
            <p className="text-xs text-muted-foreground mb-2">The number of kilometers covered by the base fare</p>
            <div className="relative">
              <Input
                id="baseDistance"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={baseDistance}
                onChange={(e) => onBaseDistanceChange(Number.parseFloat(e.target.value) || 0)}
                className="text-xl h-14 pr-12 font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">km</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="ratePerKm" className="text-base font-medium">
              Rate per Kilometer
            </Label>
            <p className="text-xs text-muted-foreground mb-2">
              The amount charged for each kilometer beyond the base distance
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                {currency}
              </span>
              <Input
                id="ratePerKm"
                type="number"
                inputMode="decimal"
                step="0.1"
                value={ratePerKm}
                onChange={(e) => onRatePerKmChange(Number.parseFloat(e.target.value) || 0)}
                className="text-xl h-14 pl-10 pr-12 font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">/km</span>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4 bg-muted/50">
        <h3 className="font-semibold text-sm mb-3 text-foreground">Example Calculation</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">First {baseDistance} km</span>
            <span className="font-medium text-foreground">
              {currency}
              {baseFare.toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Additional {(10 - baseDistance).toFixed(1)} km × {currency}
              {ratePerKm.toFixed(2)}
            </span>
            <span className="font-medium text-foreground">
              {currency}
              {((10 - baseDistance) * ratePerKm).toFixed(2)}
            </span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between">
            <span className="font-semibold text-foreground">Total (10 km)</span>
            <span className="font-bold text-primary">
              {currency}
              {(baseFare + (10 - baseDistance) * ratePerKm).toFixed(2)}
            </span>
          </div>
        </div>
      </Card>

      <Button onClick={onClose} className="w-full h-12 text-base font-semibold">
        Save & Close
      </Button>
    </div>
  )
}
