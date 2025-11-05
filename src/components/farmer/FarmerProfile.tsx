import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FarmerProfile = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [location, setLocation] = useState("");
  const [farmType, setFarmType] = useState("");
  const [crops, setCrops] = useState(""); // comma-separated
  const [farmSize, setFarmSize] = useState("");
  const [cropsList, setCropsList] = useState<{
    name: string;
    harvestDate?: string;
    expectedYield?: string;
    image_url?: string | null;
    localPreview?: string | null;
  }[]>([]);

  // transient inputs for adding a crop
  const [newCropName, setNewCropName] = useState("");
  const [newHarvestDate, setNewHarvestDate] = useState("");
  const [newExpectedYield, setNewExpectedYield] = useState("");
  const [newImageFile, setNewImageFile] = useState<File | null>(null);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;
      const userId = session.user.id;
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("full_name, location, farm_type, business_name, farm_size, phone")
        .eq("user_id", userId)
        .single();

      if (error) {
        // no profile yet is fine
        console.debug("No profile:", error.message);
      }

      if (profileData) {
        setFullName(profileData.full_name || "");
        setLocation(profileData.location || "");
        setFarmType(profileData.farm_type || "");
        setFarmSize(profileData.farm_size ? String(profileData.farm_size) : "");

        // business_name used for crops storage; attempt to parse JSON, otherwise treat as comma list
        const bn = profileData.business_name || "";
        if (bn) {
          try {
            const parsed = JSON.parse(bn);
            if (Array.isArray(parsed)) {
              setCropsList(
                (parsed as unknown[]).map((p) => {
                  const obj = p as Record<string, unknown>;
                  return {
                    name: typeof obj.name === "string" ? obj.name : String(p),
                    harvestDate: typeof obj.harvestDate === "string" ? obj.harvestDate : "",
                    expectedYield: obj.expectedYield ? String(obj.expectedYield) : "",
                    image_url: typeof obj.image_url === "string" ? obj.image_url : null,
                  };
                }),
              );
            } else if (typeof parsed === "string") {
              setCrops(parsed);
              const parts = parsed.split(",").map((s: string) => s.trim()).filter(Boolean);
              setCropsList(parts.map((p: string) => ({ name: p })));
            }
          } catch (e) {
            // not JSON, treat as comma-separated list
            setCrops(bn);
            const parts = bn.split(",").map((s: string) => s.trim()).filter(Boolean);
            setCropsList(parts.map((p: string) => ({ name: p })));
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File | null, userId: string) => {
    if (!file) return null;

    try {
      const path = `crop-images/${userId}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from("crop-images").upload(path, file, { cacheControl: "3600", upsert: false });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("crop-images").getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      console.error("Upload error", err);
      return null;
    }
  };

  const handleAddCrop = async () => {
    if (!newCropName.trim()) {
      toast.error("Enter a crop name");
      return;
    }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const userId = session?.user.id;
      let imageUrl: string | null = null;
      if (newImageFile && userId) {
        const uploaded = await handleImageUpload(newImageFile, userId);
        if (uploaded) imageUrl = uploaded;
      }

      setCropsList((s) => [
        ...s,
        {
          name: newCropName.trim(),
          harvestDate: newHarvestDate || undefined,
          expectedYield: newExpectedYield || undefined,
          image_url: imageUrl,
          localPreview: newImageFile ? URL.createObjectURL(newImageFile) : null,
        },
      ]);

      // reset inputs
      setNewCropName("");
      setNewHarvestDate("");
      setNewExpectedYield("");
      setNewImageFile(null);
      toast.success("Crop added");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add crop");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCrop = (idx: number) => {
    setCropsList((s) => s.filter((_, i) => i !== idx));
  };

  useEffect(() => {
    if (open) fetchProfile();
  }, [open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Not authenticated");
        return;
      }
      const userId = session.user.id;

      const businessNamePayload = cropsList.length > 0 ? JSON.stringify(cropsList) : crops;

      const payload = {
        user_id: userId,
        full_name: fullName,
        location: location,
        farm_type: farmType,
        business_name: businessNamePayload,
        farm_size: farmSize ? Number(farmSize) : null,
      };

      const { error } = await supabase.from("profiles").upsert(payload, { returning: "representation" });

      if (error) throw error;

      toast.success("Profile saved");
      setEditing(false);
      setOpen(false);
    } catch (err: unknown) {
      let message = "Failed to save profile";
      if (err instanceof Error && err.message) message = err.message;
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-8">
          Profile
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Farmer Profile</DialogTitle>
          <DialogDescription>Basic details used across the farmer portal</DialogDescription>
        </DialogHeader>

        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Manage your account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Full name</Label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!editing} />
            </div>

            <div>
              <Label>Location</Label>
              <Input value={location} onChange={(e) => setLocation(e.target.value)} disabled={!editing} />
            </div>

            <div>
              <Label>Type of Farmer</Label>
              <Input value={farmType} onChange={(e) => setFarmType(e.target.value)} disabled={!editing} />
            </div>

            <div>
              <Label>Crops (comma separated)</Label>
              <Input value={crops} onChange={(e) => setCrops(e.target.value)} disabled={!editing} />
            </div>

            <div>
              <Label>Farm size (acres)</Label>
              <Input type="number" value={farmSize} onChange={(e) => setFarmSize(e.target.value)} disabled={!editing} />
            </div>

            {/* Crops management */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Crops & Harvest</h4>
              {cropsList.length === 0 && <p className="text-sm text-muted-foreground">No crops added yet.</p>}
              <div className="space-y-2">
                {cropsList.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {c.image_url || c.localPreview ? (
                        <img src={c.localPreview ?? c.image_url ?? ""} alt={c.name} className="h-10 w-10 rounded object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted" />
                      )}
                      <div>
                        <div className="font-medium">{c.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {c.harvestDate ? `Harvest: ${c.harvestDate}` : "No harvest date"}
                          {c.expectedYield ? ` • Yield: ${c.expectedYield}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {editing && (
                        <Button variant="ghost" onClick={() => handleRemoveCrop(idx)}>
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {editing && (
                <div className="p-3 border rounded-lg">
                  <h5 className="text-sm font-medium mb-2">Add crop</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <Label>Crop name</Label>
                      <Input value={newCropName} onChange={(e) => setNewCropName(e.target.value)} />
                    </div>
                    <div>
                      <Label>Harvest date</Label>
                      <Input type="date" value={newHarvestDate} onChange={(e) => setNewHarvestDate(e.target.value)} />
                    </div>
                    <div>
                      <Label>Expected yield (quintals)</Label>
                      <Input type="number" value={newExpectedYield} onChange={(e) => setNewExpectedYield(e.target.value)} />
                    </div>
                    <div>
                      <Label>Crop image</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setNewImageFile(e.target.files ? e.target.files[0] : null)} />
                    </div>
                  </div>
                  <div className="flex justify-end mt-3">
                    <Button onClick={handleAddCrop} disabled={loading}>{loading ? "Adding..." : "Add Crop"}</Button>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end">
              {!editing ? (
                <Button onClick={() => setEditing(true)}>Edit</Button>
              ) : (
                <>
                  <Button variant="outline" onClick={() => setEditing(false)} disabled={loading}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FarmerProfile;
