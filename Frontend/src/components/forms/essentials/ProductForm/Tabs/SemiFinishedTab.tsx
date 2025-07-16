import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Component, Plus, BeerIcon as NumberIcon, X } from 'lucide-react';
import { FormErrorMessage } from '@/components/ui/form-error-message';

interface SemiFinishedTabProps {
  formData: any;
  semiFinishedProducts: any[];
  selectedSemiFinishedProduct: string;
  setSelectedSemiFinishedProduct: (id: string) => void;
  selectedSemiFinishedProductQuantity: number;
  setSelectedSemiFinishedProductQuantity: (qty: number) => void;
  handleSemiFinishedProductChange: () => void;
  removeSemiFinishedProduct: (id: string) => void;
  errors: Record<string, string>;
}

export function SemiFinishedTab({
  formData,
  semiFinishedProducts,
  selectedSemiFinishedProduct,
  setSelectedSemiFinishedProduct,
  selectedSemiFinishedProductQuantity,
  setSelectedSemiFinishedProductQuantity,
  handleSemiFinishedProductChange,
  removeSemiFinishedProduct,
  errors
}: SemiFinishedTabProps) {
  return (
    <Card className="border-chart-5/20">
      <CardHeader className="bg-chart-5/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Component className="h-5 w-5 text-chart-5" />
          <CardTitle>Semi-Finished Components</CardTitle>
        </div>
        <CardDescription>
          Add semi-finished parts required for product assembly
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {formData.semiFinishedComponents && formData.semiFinishedComponents.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Component className="h-4 w-4 text-chart-5" />
              Added Components
            </h3>
            <div className="divide-y">
              {formData.semiFinishedComponents.map((component: any) => {
                const product = semiFinishedProducts.find(p => p._id === component.productId);
                return (
                  <div key={component.productId} className="flex justify-between items-center py-3 px-2 hover:bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-chart-5/10 flex items-center justify-center">
                        <Component className="h-4 w-4 text-chart-5" />
                      </div>
                      <div>
                        <p className="font-medium">{product?.productName || 'Unknown'}</p>
                        <p className="text-sm text-muted-foreground">
                          {product?.unitOfMeasure ? `${component.quantity} ${product.unitOfMeasure}` : `${component.quantity} units`}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeSemiFinishedProduct(component.productId)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4 bg-muted/10 p-4 rounded-lg">
          <h3 className="font-semibold">Add New Component</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Semi-Finished Product</Label>
              <Select value={selectedSemiFinishedProduct} onValueChange={setSelectedSemiFinishedProduct}>
                <SelectTrigger className={errors.selectedSemiFinishedProduct ? "border-destructive" : ""}>
                  <SelectValue placeholder="Select a semi-finished product" />
                </SelectTrigger>
                <SelectContent>
                  {semiFinishedProducts.map((product) => (
                    <SelectItem key={product._id} value={product._id}>
                      {product.productName} ({product.unitOfMeasure || 'N/A'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.selectedSemiFinishedProduct && <FormErrorMessage>{errors.selectedSemiFinishedProduct}</FormErrorMessage>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <NumberIcon className="h-4 w-4 text-muted-foreground" />
                <Label>Quantity</Label>
              </div>
              <Input
                type="number"
                min="1"
                value={selectedSemiFinishedProductQuantity}
                onChange={(e) => setSelectedSemiFinishedProductQuantity(Number(e.target.value))}
                className={errors.selectedSemiFinishedProductQuantity ? "border-destructive" : ""}
              />
              {errors.selectedSemiFinishedProductQuantity && <FormErrorMessage>{errors.selectedSemiFinishedProductQuantity}</FormErrorMessage>}
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleSemiFinishedProductChange}
            className="gap-2 mt-2"
            disabled={!selectedSemiFinishedProduct}
          >
            <Plus className="h-4 w-4" /> Add Component
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}   