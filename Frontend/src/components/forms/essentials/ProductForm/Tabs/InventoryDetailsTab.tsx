import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BarChart3, PackageCheck, BarChartHorizontal, Timer, PackagePlus } from 'lucide-react';
import { FormErrorMessage } from '@/components/ui/form-error-message';

interface InventoryDetailsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export function InventoryDetailsTab({ formData, setFormData, errors }: InventoryDetailsTabProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const { value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [key]: type === "number" ? (value ? Number(value) : 0) : value
    }));
  };

  return (
    <Card className="border-secondary/20">
      <CardHeader className="bg-secondary/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-secondary-foreground" />
          <CardTitle>Inventory Details</CardTitle>
        </div>
        <CardDescription>
          Manage your product inventory levels and thresholds
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="currentStock">Current Stock Available</Label>
            </div>
            <Input
              id="currentStock"
              type="number"
              value={formData.currentStock}
              onChange={(e) => handleInputChange(e, 'currentStock')}
              placeholder="Enter current stock"
              className={errors.currentStock ? "border-destructive" : ""}
            />
            {errors.currentStock && <FormErrorMessage>{errors.currentStock}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BarChartHorizontal className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="minimumStockLevel">Minimum Stock Level</Label>
            </div>
            <Input
              id="minimumStockLevel"
              type="number"
              value={formData.minimumStockLevel}
              onChange={(e) => handleInputChange(e, 'minimumStockLevel')}
              placeholder="Enter minimum stock level"
              className={errors.minimumStockLevel ? "border-destructive" : ""}
            />
            {errors.minimumStockLevel && <FormErrorMessage>{errors.minimumStockLevel}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <PackagePlus className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="reorderPoint">Reorder Point</Label>
            </div>
            <Input
              id="reorderPoint"
              type="number"
              value={formData.reorderPoint}
              onChange={(e) => handleInputChange(e, 'reorderPoint')}
              placeholder="Enter reorder point"
              className={errors.reorderPoint ? "border-destructive" : ""}
            />
            {errors.reorderPoint && <FormErrorMessage>{errors.reorderPoint}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="leadTime">Lead Time (Days)</Label>
            </div>
            <Input
              id="leadTime"
              type="number"
              value={formData.leadTime}
              onChange={(e) => handleInputChange(e, 'leadTime')}
              placeholder="Enter lead time"
              className={errors.leadTime ? "border-destructive" : ""}
            />
            {errors.leadTime && <FormErrorMessage>{errors.leadTime}</FormErrorMessage>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}