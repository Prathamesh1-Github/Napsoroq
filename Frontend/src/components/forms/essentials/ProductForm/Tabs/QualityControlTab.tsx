import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, ClipboardList, Percent } from 'lucide-react';
import { FormErrorMessage } from '@/components/ui/form-error-message';

interface QualityControlTabProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export function QualityControlTab({ formData, setFormData, errors }: QualityControlTabProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const { value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [key]: type === "number" ? (value ? Number(value) : 0) : value
    }));
  };

  return (
    <Card className="border-chart-1/20">
      <CardHeader className="bg-chart-1/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-chart-1" />
          <CardTitle>Quality Control</CardTitle>
        </div>
        <CardDescription>
          Define quality standards and inspection requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center justify-between space-x-4 rounded-lg border p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-chart-1" />
              <Label htmlFor="qualityCheckRequired" className="font-medium">
                Quality Check Required?
              </Label>
            </div>
            <Switch
              id="qualityCheckRequired"
              checked={formData.qualityCheckRequired}
              onCheckedChange={(checked) => setFormData((prev: any) => ({ ...prev, qualityCheckRequired: checked }))}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="inspectionCriteria">Inspection Criteria</Label>
            </div>
            <Input
              id="inspectionCriteria"
              value={formData.inspectionCriteria}
              onChange={(e) => handleInputChange(e, 'inspectionCriteria')}
              placeholder="Enter inspection criteria"
              className={errors.inspectionCriteria ? "border-destructive" : ""}
              disabled={!formData.qualityCheckRequired}
            />
            {errors.inspectionCriteria && <FormErrorMessage>{errors.inspectionCriteria}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="defectTolerance">Defect Tolerance (%)</Label>
            </div>
            <Input
              id="defectTolerance"
              type="number"
              value={formData.defectTolerance}
              onChange={(e) => handleInputChange(e, 'defectTolerance')}
              placeholder="Enter defect tolerance"
              className={errors.defectTolerance ? "border-destructive" : ""}
              disabled={!formData.qualityCheckRequired}
            />
            {errors.defectTolerance && <FormErrorMessage>{errors.defectTolerance}</FormErrorMessage>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}