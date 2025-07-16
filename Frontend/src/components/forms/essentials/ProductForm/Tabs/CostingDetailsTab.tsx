import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calculator, IndianRupee, Users, Cog, Building2, Percent } from 'lucide-react';
import { FormErrorMessage } from '@/components/ui/form-error-message';

interface CostingDetailsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export function CostingDetailsTab({ formData, setFormData, errors }: CostingDetailsTabProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const { value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [key]: type === "number" ? (value ? Number(value) : 0) : value
    }));
  };

  return (
    <Card className="border-accent/20">
      <CardHeader className="bg-accent/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-accent-foreground" />
          <CardTitle>Costing Details</CardTitle>
        </div>
        <CardDescription>
          Enter the costing information for accurate pricing
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="totalMaterialCost">Total Material Cost (₹)</Label>
            </div>
            <Input
              id="totalMaterialCost"
              type="number"
              value={formData.totalMaterialCost}
              onChange={(e) => handleInputChange(e, 'totalMaterialCost')}
              placeholder="Enter material cost"
              className={errors.totalMaterialCost ? "border-destructive" : ""}
            />
            {errors.totalMaterialCost && <FormErrorMessage>{errors.totalMaterialCost}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="laborCost">Labor Cost per Unit (₹)</Label>
            </div>
            <Input
              id="laborCost"
              type="number"
              value={formData.laborCost}
              onChange={(e) => handleInputChange(e, 'laborCost')}
              placeholder="Enter labor cost"
              className={errors.laborCost ? "border-destructive" : ""}
            />
            {errors.laborCost && <FormErrorMessage>{errors.laborCost}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Cog className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="machineCost">Machine Cost per Unit (₹)</Label>
            </div>
            <Input
              id="machineCost"
              type="number"
              value={formData.machineCost}
              onChange={(e) => handleInputChange(e, 'machineCost')}
              placeholder="Enter machine cost"
              className={errors.machineCost ? "border-destructive" : ""}
            />
            {errors.machineCost && <FormErrorMessage>{errors.machineCost}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="overheadCost">Overhead Cost per Unit (₹)</Label>
            </div>
            <Input
              id="overheadCost"
              type="number"
              value={formData.overheadCost}
              onChange={(e) => handleInputChange(e, 'overheadCost')}
              placeholder="Enter overhead cost"
              className={errors.overheadCost ? "border-destructive" : ""}
            />
            {errors.overheadCost && <FormErrorMessage>{errors.overheadCost}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calculator className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="totalProductionCost">Total Production Cost (₹)</Label>
            </div>
            <Input
              id="totalProductionCost"
              type="number"
              value={formData.totalProductionCost}
              onChange={(e) => handleInputChange(e, 'totalProductionCost')}
              placeholder="Enter total production cost"
              className={errors.totalProductionCost ? "border-destructive" : ""}
            />
            {errors.totalProductionCost && <FormErrorMessage>{errors.totalProductionCost}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="profitMargin">Profit Margin (%)</Label>
            </div>
            <Input
              id="profitMargin"
              type="number"
              value={formData.profitMargin}
              onChange={(e) => handleInputChange(e, 'profitMargin')}
              placeholder="Enter profit margin"
              className={errors.profitMargin ? "border-destructive" : ""}
            />
            {errors.profitMargin && <FormErrorMessage>{errors.profitMargin}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="finalSellingPrice">Final Selling Price per Unit (₹)</Label>
            </div>
            <Input
              id="finalSellingPrice"
              type="number"
              value={formData.finalSellingPrice}
              onChange={(e) => handleInputChange(e, 'finalSellingPrice')}
              placeholder="Enter final selling price"
              className={errors.finalSellingPrice ? "border-destructive" : ""}
            />
            {errors.finalSellingPrice && <FormErrorMessage>{errors.finalSellingPrice}</FormErrorMessage>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}