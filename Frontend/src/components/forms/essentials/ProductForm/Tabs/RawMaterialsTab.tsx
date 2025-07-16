import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Boxes, Plus, BeerIcon as NumberIcon } from 'lucide-react';
import { FormErrorMessage } from '@/components/ui/form-error-message';

interface RawMaterialsTabProps {
  formData: any;
  rawMaterials: any[];
  selectedMaterial: string;
  setSelectedMaterial: (id: string) => void;
  materialQuantity: number;
  setMaterialQuantity: (qty: number) => void;
  handleMaterialChange: () => void;
  errors: Record<string, string>;
}

export function RawMaterialsTab({
  formData,
  rawMaterials,
  selectedMaterial,
  setSelectedMaterial,
  materialQuantity,
  setMaterialQuantity,
  handleMaterialChange,
  errors
}: RawMaterialsTabProps) {
  return (
    <Card className="border-chart-2/20">
      <CardHeader className="bg-chart-2/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Boxes className="h-5 w-5 text-chart-2" />
          <CardTitle>Raw Materials Required</CardTitle>
        </div>
        <CardDescription>
          Select the raw materials needed for production
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {formData.rawMaterials.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Boxes className="h-4 w-4 text-chart-2" />
              Added Raw Materials
            </h3>
            <div className="divide-y">
              {formData.rawMaterials.map((material: any, index: number) => {
                const materialDetails = rawMaterials.find(m => m.rawMaterialCode === material.rawMaterialId);
                return (
                  <div key={index} className="flex justify-between items-center py-3 px-2 hover:bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center">
                        <Boxes className="h-4 w-4 text-chart-2" />
                      </div>
                      <div>
                        <p className="font-medium">{materialDetails ? materialDetails.rawMaterialName : "Unknown Material"}</p>
                        <p className="text-sm text-muted-foreground">ID: {material.rawMaterialId}</p>
                      </div>
                    </div>
                    <span className="bg-chart-2/10 text-chart-2 px-2 py-1 rounded-full text-sm font-medium">
                      {material.quantity} units
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4 bg-muted/10 p-4 rounded-lg">
          <h3 className="font-semibold">Add New Raw Material</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Raw Material</Label>
              <Select value={selectedMaterial} onValueChange={setSelectedMaterial}>
                <SelectTrigger className={errors.selectedMaterial ? "border-destructive" : ""}>
                  <SelectValue placeholder="Choose a raw material" />
                </SelectTrigger>
                <SelectContent>
                  {rawMaterials.map(material => (
                    <SelectItem key={material.rawMaterialCode} value={material.rawMaterialCode}>
                      {material.rawMaterialName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.selectedMaterial && <FormErrorMessage>{errors.selectedMaterial}</FormErrorMessage>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <NumberIcon className="h-4 w-4 text-muted-foreground" />
                <Label>Quantity</Label>
              </div>
              <Input
                type="number"
                min="1"
                value={materialQuantity}
                onChange={(e) => setMaterialQuantity(Number(e.target.value))}
                className={errors.materialQuantity ? "border-destructive" : ""}
              />
              {errors.materialQuantity && <FormErrorMessage>{errors.materialQuantity}</FormErrorMessage>}
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleMaterialChange}
            className="gap-2 mt-2"
            disabled={!selectedMaterial}
          >
            <Plus className="h-4 w-4" /> Add Material
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}