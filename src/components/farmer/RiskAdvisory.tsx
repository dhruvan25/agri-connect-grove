import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bug, CloudRain, TrendingDown, Truck } from "lucide-react";
import { useState } from "react";

const RiskAdvisory = () => {
  const crops = ["Tomato", "Onion", "Potato", "Wheat", "Rice"];
  const [selectedCrop, setSelectedCrop] = useState<string>(crops[0]);

  return (
    <div className="space-y-6">
      {/* Overall Risk header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overall Risk</CardTitle>
              <CardDescription>Summary of the current risk level for selected crop</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="text-sm bg-destructive text-destructive-foreground">HIGH</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-w-xs">
            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
              <SelectTrigger>
                <SelectValue placeholder="Select crop" />
              </SelectTrigger>
              <SelectContent>
                {crops.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk dashboard grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex items-center gap-2">
            <CloudRain className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-sm">Weather Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">HIGH</div>
            <div className="text-sm text-muted-foreground">Heavy rain expected</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-amber-600" />
            <CardTitle className="text-sm">Market Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">MEDIUM</div>
            <div className="text-sm text-muted-foreground">Price volatility</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-red-600" />
            <CardTitle className="text-sm">Pest/Disease Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">MEDIUM</div>
            <div className="text-sm text-muted-foreground">Aphid pressure rising</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-green-600" />
            <CardTitle className="text-sm">Logistics Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">LOW</div>
            <div className="text-sm text-muted-foreground">Transport normal</div>
          </CardContent>
        </Card>
      </div>

      {/* Advisory feed */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Actionable Advice</h3>
        <Alert>
          <CloudRain className="h-5 w-5 mr-3" />
          <div>
            <AlertTitle>Prevent waterlogging</AlertTitle>
            <AlertDescription>
              Check drainage channels and avoid overwatering. Move seedlings to higher ground if possible.
            </AlertDescription>
          </div>
        </Alert>
        <Alert>
          <TrendingDown className="h-5 w-5 mr-3" />
          <div>
            <AlertTitle>Stagger sales</AlertTitle>
            <AlertDescription>
              If prices are volatile, consider staggered sales to reduce exposure to price drops.
            </AlertDescription>
          </div>
        </Alert>
      </div>

      {/* Safety & Learning */}
      <div className="space-y-3">
        <h3 className="text-lg font-medium">Safety & Learning</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Fungal Disease Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Short guide on identifying and preventing fungal diseases.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Safe Pesticide Use</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Best practices for safe and effective pesticide application.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default RiskAdvisory;
