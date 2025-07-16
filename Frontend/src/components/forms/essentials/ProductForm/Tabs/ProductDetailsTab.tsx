import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Info, Hash, Package, Tag, Scale, CreditCard, Ruler } from 'lucide-react';
import { FormErrorMessage } from '@/components/ui/form-error-message';

interface ProductDetailsTabProps {
  formData: any;
  setFormData: (data: any) => void;
  errors: Record<string, string>;
}

export function ProductDetailsTab({ formData, setFormData, errors }: ProductDetailsTabProps) {
  const uomOptions = ["Kg", "g", "L", "ml", "units", "pcs"];
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, key: string) => {
    const { value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [key]: type === "number" ? (value ? Number(value) : 0) : value
    }));
  };

  return (
    <Card className="border-primary/10">
      <CardHeader className="bg-primary/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <CardTitle>Product Details</CardTitle>
        </div>
        <CardDescription>
          Enter the basic information about your product
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="productId">Product ID</Label>
            </div>
            <Input
              id="productId"
              value={formData.productId}
              onChange={(e) => handleInputChange(e, 'productId')}
              placeholder="Enter product ID"
              className={errors.productId ? "border-destructive" : ""}
            />
            {errors.productId && <FormErrorMessage>{errors.productId}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="productName">Product Name</Label>
            </div>
            <Input
              id="productName"
              value={formData.productName}
              onChange={(e) => handleInputChange(e, 'productName')}
              placeholder="Enter product name"
              className={errors.productName ? "border-destructive" : ""}
            />
            {errors.productName && <FormErrorMessage>{errors.productName}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="productCategory">Product Category</Label>
            </div>
            <Input
              id="productCategory"
              value={formData.productCategory}
              onChange={(e) => handleInputChange(e, 'productCategory')}
              placeholder="Enter product category"
              className={errors.productCategory ? "border-destructive" : ""}
            />
            {errors.productCategory && <FormErrorMessage>{errors.productCategory}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="productSKU">Product SKU</Label>
            </div>
            <Input
              id="productSKU"
              value={formData.productSKU}
              onChange={(e) => handleInputChange(e, 'productSKU')}
              placeholder="Enter product SKU"
              className={errors.productSKU ? "border-destructive" : ""}
            />
            {errors.productSKU && <FormErrorMessage>{errors.productSKU}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="uom">Unit of Measurement</Label>
            </div>
            <Select
              value={formData.uom}
              onValueChange={(value) => setFormData((prev: any) => ({ ...prev, uom: value }))}
            >
              <SelectTrigger 
                id="uom"
                className={errors.uom ? "border-destructive" : ""}
              >
                <SelectValue placeholder="Select unit of measurement" />
              </SelectTrigger>
              <SelectContent>
                {uomOptions.map((option) => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.uom && <FormErrorMessage>{errors.uom}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="productVariant">Product Variant</Label>
            </div>
            <Input
              id="productVariant"
              value={formData.productVariant}
              onChange={(e) => handleInputChange(e, 'productVariant')}
              placeholder="Enter product variant"
              className={errors.productVariant ? "border-destructive" : ""}
            />
            {errors.productVariant && <FormErrorMessage>{errors.productVariant}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="sellingPrice">Selling Price (₹)</Label>
            </div>
            <Input
              id="sellingPrice"
              type="number"
              value={formData.sellingPrice}
              onChange={(e) => handleInputChange(e, 'sellingPrice')}
              placeholder="Enter selling price"
              className={errors.sellingPrice ? "border-destructive" : ""}
            />
            {errors.sellingPrice && <FormErrorMessage>{errors.sellingPrice}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="batchSize">Production Batch Size</Label>
            </div>
            <Input
              id="batchSize"
              type="number"
              value={formData.batchSize}
              onChange={(e) => handleInputChange(e, 'batchSize')}
              placeholder="Enter batch size"
              className={errors.batchSize ? "border-destructive" : ""}
            />
            {errors.batchSize && <FormErrorMessage>{errors.batchSize}</FormErrorMessage>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="productWeight">Product Weight (grams/Kg)</Label>
            </div>
            <Input
              id="productWeight"
              type="number"
              value={formData.productWeight}
              onChange={(e) => handleInputChange(e, 'productWeight')}
              placeholder="Enter product weight"
              className={errors.productWeight ? "border-destructive" : ""}
            />
            {errors.productWeight && <FormErrorMessage>{errors.productWeight}</FormErrorMessage>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}