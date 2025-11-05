import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, TrendingUp, Leaf } from "lucide-react";
import { format } from "date-fns";

const Analytics = () => {
  const [harvestDate, setHarvestDate] = useState<Date>();
  const [selectedCrop, setSelectedCrop] = useState("");
  const [soilType, setSoilType] = useState("");
  const [acreage, setAcreage] = useState("");
  const [expectedYield, setExpectedYield] = useState("");
  const [isOrganic, setIsOrganic] = useState(false);

  const crops = ["Tomato", "Onion", "Potato", "Wheat", "Rice"];
  const soilTypes = ["Clay", "Sandy", "Loamy", "Black Soil", "Red Soil"];

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
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
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
              <p className="text-3xl font-bold text-primary">₹2,800 - ₹3,200</p>
              <p className="text-sm text-muted-foreground mt-1">Per quintal</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-card border rounded-lg">
                <span className="text-sm">Mandi Market</span>
                <span className="font-medium">₹2,400/quintal</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-primary/5 border border-primary rounded-lg">
                <span className="text-sm font-medium">Bulk Buyer (Direct)</span>
                <span className="font-bold text-primary">₹2,950/quintal</span>
              </div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Best Selling Strategy</h4>
              <p className="text-sm text-muted-foreground">
                Based on current trends, selling directly to bulk buyers will give you 22% better
                returns compared to mandi prices. Consider waiting 2-3 weeks post-harvest for
                optimal pricing.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Estimated Profit</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Logistics Cost</p>
                  <p className="text-lg font-bold">₹12,000</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <p className="text-xs text-muted-foreground">Net Profit</p>
                  <p className="text-lg font-bold text-primary">₹1,18,000</p>
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
