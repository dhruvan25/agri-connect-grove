import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon, Leaf, TrendingUp } from "lucide-react";
import { useState } from "react";

const Analytics = () => {
  const [harvestDate, setHarvestDate] = useState<Date>();
  const [selectedCrop, setSelectedCrop] = useState("");
  // allow multiple crops selection
  const [selectedCrops, setSelectedCrops] = useState<string[]>([]);
  // transient select value so we can reset the Select trigger after each pick
  const [selectValue, setSelectValue] = useState("");
  const [soilType, setSoilType] = useState("");
  const [acreage, setAcreage] = useState("");
  const [expectedYield, setExpectedYield] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);

  const crops = ["Tomato", "Onion", "Potato", "Wheat", "Rice"];
  const soilTypes = ["Clay", "Sandy", "Loamy", "Black Soil", "Red Soil"];

  // base mandi prices per quintal (approx)
  const baseMandiPrices: Record<string, number> = {
    Tomato: 2400,
    Onion: 1800,
    Potato: 1200,
    Wheat: 1600,
    Rice: 2000,
  };

  const formatRupee = (v: number) => `₹${v.toLocaleString("en-IN")}`;

  const computeMetrics = () => {
    // fallback: original static values when nothing is provided
    const defaultValues = {
      predictedLow: 2800,
      predictedHigh: 3200,
      mandiPerQ: 2400,
      bulkPerQ: 2950,
      logistics: 12000,
      netProfit: 118000,
      percentGain: 22,
    };

    if (selectedCrops.length === 0) return defaultValues;

    const totalYield = Number(expectedYield) || 0; // in quintals
    const acreageNum = Number(acreage) || 0;

    // factors derived from original numbers: predictedLow ~= mandi*1.166, predictedHigh ~= mandi*1.333, bulk ~= mandi*1.229
    const lowFactor = 1.1666667;
    const highFactor = 1.3333333;
    const bulkFactor = 1.2291667;

    // Distribute yield equally among selected crops if total yield provided
    const perCropYield = selectedCrops.length > 0 && totalYield > 0 ? totalYield / selectedCrops.length : 0;

    let sumPredLowRevenue = 0;
    let sumPredHighRevenue = 0;
    let sumMandiRevenue = 0;
    let sumBulkRevenue = 0;
    let sumMandiPerQ = 0;

    selectedCrops.forEach((c) => {
      const mandi = baseMandiPrices[c] ?? 2000;
      const predLow = mandi * lowFactor;
      const predHigh = mandi * highFactor;
      const bulk = mandi * bulkFactor;

      if (perCropYield > 0) {
        sumPredLowRevenue += predLow * perCropYield;
        sumPredHighRevenue += predHigh * perCropYield;
        sumMandiRevenue += mandi * perCropYield;
        sumBulkRevenue += bulk * perCropYield;
      }

      sumMandiPerQ += mandi;
    });

    // average per-quintal prices
    const mandiPerQ = selectedCrops.length > 0 ? Math.round(sumMandiPerQ / selectedCrops.length) : 0;

    let predictedLow = 0;
    let predictedHigh = 0;
    let totalRevenueDirect = 0;
    let totalRevenueMandi = 0;

    if (totalYield > 0) {
      predictedLow = Math.round(sumPredLowRevenue / totalYield);
      predictedHigh = Math.round(sumPredHighRevenue / totalYield);
      totalRevenueDirect = Math.round(sumBulkRevenue);
      totalRevenueMandi = Math.round(sumMandiRevenue);
    } else {
      // no yield provided: fall back to average per-crop predictions
      const avgPredLow = Math.round((mandiPerQ || 2000) * lowFactor);
      const avgPredHigh = Math.round((mandiPerQ || 2000) * highFactor);
      const avgBulk = Math.round((mandiPerQ || 2000) * bulkFactor);
      predictedLow = avgPredLow;
      predictedHigh = avgPredHigh;
      totalRevenueDirect = avgBulk; // treat as per-quintal placeholder
      totalRevenueMandi = mandiPerQ;
    }

    // logistics: if we have a yield use per-quintal cost, else if acreage provided use acreage-based heuristic
    let logistics = 12000;
    if (totalYield > 0) logistics = Math.round(totalYield * 120); // ₹120 per quintal logistic estimate
    else if (acreageNum > 0) logistics = Math.round(acreageNum * 1000);

    const netProfit = totalRevenueDirect - logistics;
    const percentGain = mandiPerQ > 0 ? Math.round(((Math.round((mandiPerQ * bulkFactor)) - mandiPerQ) / mandiPerQ) * 100) : 0;

    return {
      predictedLow,
      predictedHigh,
      mandiPerQ,
      bulkPerQ: Math.round(mandiPerQ * bulkFactor),
      logistics,
      netProfit,
      percentGain,
    };
  };

  const metrics = computeMetrics();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Card */}
      <Card>
        <CardHeader>
          <CardTitle>Crop Analytics Input</CardTitle>
          <CardDescription>Enter your crop details for price forecast</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Crop</Label>
            <Select value={selectValue} onValueChange={(val) => {
              // toggle crop in selectedCrops
              if (!val) return;
              setSelectedCrops((prev) =>
                prev.includes(val) ? prev.filter((c) => c !== val) : [...prev, val]
              );
              // reset trigger display
              setSelectValue("");
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((crop) => (
                  <SelectItem key={crop} value={crop}>
                    <div className="flex items-center gap-2">
                      <img
                        src={`/crops/${crop.toLowerCase()}.jpg`}
                        alt={crop}
                        className="h-6 w-6 rounded-full object-cover"
                      />
                      {crop}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Selected crops list (small badges) */}
            {selectedCrops.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedCrops.map((c) => (
                  <Badge key={c} className="flex items-center gap-2 py-1 px-2">
                    <span className="flex items-center gap-2">
                      <img src={`/crops/${c.toLowerCase()}.jpg`} alt={c} className="h-4 w-4 rounded-full object-cover" />
                      {c}
                    </span>
                    <button
                      onClick={() => setSelectedCrops((prev) => prev.filter((x) => x !== c))}
                      className="ml-2 text-xs font-medium"
                      aria-label={`Remove ${c}`}
                    >
                      ✕
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Harvest Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {harvestDate ? format(harvestDate, "PPP") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={harvestDate} onSelect={setHarvestDate} />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label>Soil Type</Label>
            <Select value={soilType} onValueChange={setSoilType}>
              <SelectTrigger>
                <SelectValue placeholder="Select soil type" />
              </SelectTrigger>
              <SelectContent>
                {soilTypes.map((soil) => (
                  <SelectItem key={soil} value={soil}>
                    {soil}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Acreage</Label>
            <Input
              type="number"
              placeholder="Area in acres"
              value={acreage}
              onChange={(e) => setAcreage(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Expected Yield (quintals)</Label>
            <Input
              type="number"
              placeholder="Expected yield"
              value={expectedYield}
              onChange={(e) => setExpectedYield(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="organic"
              checked={isOrganic}
              onChange={(e) => setIsOrganic(e.target.checked)}
              className="h-4 w-4"
            />
            <Label htmlFor="organic" className="flex items-center gap-2 cursor-pointer">
              <Leaf className="h-4 w-4 text-organic" />
              Organic Farming
            </Label>
          </div>

          <Button className="w-full">
            <TrendingUp className="h-4 w-4 mr-2" />
            Generate Forecast
          </Button>
        </CardContent>
      </Card>

      {/* Forecast Card */}
      <Card>
        <CardHeader>
          <CardTitle>Price Forecast</CardTitle>
          <CardDescription>AI-powered insights for your crop</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Predicted Price</span>
                {isOrganic && (
                  <Badge variant="default" className="bg-organic">
                    <Leaf className="h-3 w-3 mr-1" />
                    Organic
                  </Badge>
                )}
              </div>
              <p className="text-3xl font-bold text-primary">{formatRupee(metrics.predictedLow)} - {formatRupee(metrics.predictedHigh)}</p>
              <p className="text-sm text-muted-foreground mt-1">Per quintal</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-card border rounded-lg">
                <span className="text-sm">Mandi Market</span>
                <span className="font-medium">{formatRupee(metrics.mandiPerQ)}/quintal</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/5 border border-primary rounded-lg">
                <span className="text-sm font-medium">Bulk Buyer (Direct)</span>
                <span className="font-bold text-primary">{formatRupee(metrics.bulkPerQ)}/quintal</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Best Selling Strategy</h4>
              <p className="text-sm text-muted-foreground">
                Based on current trends, selling directly to bulk buyers will give you {metrics.percentGain}% better
                returns compared to mandi prices. Consider waiting 2-3 weeks post-harvest for
                optimal pricing.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Estimated Profit</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Logistics Cost</p>
                  <p className="text-lg font-bold">{formatRupee(metrics.logistics)}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p className="text-lg font-bold text-primary">{formatRupee(metrics.netProfit)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
