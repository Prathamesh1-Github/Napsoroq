import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Wrench,
  Save,
  CheckCircle2,
  Package2
} from 'lucide-react';

interface ManualJobFormSectionProps {
  selectedDate: Date;
  isCompleted: boolean;
  onDataChange: (data: any) => void;
}

interface Product {
  _id: string;
  productName: string;
  productType: 'Product' | 'SemiFinishedProduct';
  manualJobId: string;
  uom: string;
}

export function ManualJobFormSection({ selectedDate, isCompleted, onDataChange }: ManualJobFormSectionProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const [productsRes, semiFinishedRes] = await Promise.all([
        axios.get('https://neura-ops.onrender.com/api/v1/product/with-manual-jobs', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }),
        axios.get('https://neura-ops.onrender.com/api/v1/semifinished/with-manual-jobs', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }),
      ]);

      const semiFinishedProducts: Product[] = semiFinishedRes.data.products.map((item: any) => ({
        _id: item._id,
        productName: item.productName,
        productType: 'SemiFinishedProduct',
        manualJobId: item.manualJobs[0]?.jobId?._id,
        uom: item.uom
      }));

      const finishedProducts: Product[] = productsRes.data.products.map((item: any) => ({
        _id: item._id,
        productName: item.productName,
        productType: 'Product',
        manualJobId: item.manualJobs[0]?.jobId?._id,
        uom: item.uom
      }));

      const allProducts = [...semiFinishedProducts, ...finishedProducts];
      setProducts(allProducts);

      // Initialize form data
      const initialFormData: { [key: string]: any } = {};
      allProducts.forEach((product) => {
        initialFormData[product._id] = {
          productId: product._id,
          productType: product.productType,
          manualJobId: product.manualJobId,
          outputQuantity: 0,
          reworkQuantity: 0,
          scrapQuantity: 0,
          actualTimeTaken: 0,
        };
      });

      setFormData(initialFormData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch manual job products. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleInputChange = (productId: string, field: string, value: number) => {
    setFormData((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const targetDate = new Date(selectedDate);
      
      for (const product of products) {
        const data = {
          ...formData[product._id],
          // Override the createdAt to be the selected date
          createdAt: targetDate.toISOString()
        };
        
        await axios.post('https://neura-ops.onrender.com/api/v1/manual-job-productions', data, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        });
      }
      
      toast({
        title: 'Success',
        description: `Manual job production data saved successfully for ${format(selectedDate, 'PPP')}.`,
      });
      
      onDataChange(formData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save manual job production data.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wrench className="h-6 w-6 text-purple-600" />
            <div>
              <CardTitle className="text-purple-900">Manual Job Production</CardTitle>
              <p className="text-sm text-purple-700 mt-1">Record manual job production data</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            <Button onClick={handleSave} disabled={loading} size="sm">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving..' : 'Save'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <Accordion type="single" collapsible className="space-y-4">
          {products.map((product) => (
            <AccordionItem key={product._id} value={product._id} className="border rounded-lg">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-2">
                  <Package2 className="h-4 w-4" />
                  <span className="font-medium">{product.productName}</span>
                  <Badge variant="outline" className="text-xs">
                    {product.productType === 'Product' ? 'Finished' : 'Semi-Finished'}
                  </Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Output Quantity ({product.uom})</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData[product._id]?.outputQuantity || ''}
                      onChange={(e) =>
                        handleInputChange(product._id, 'outputQuantity', Number(e.target.value))
                      }
                      placeholder={`Enter output quantity in ${product.uom}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Rework Quantity ({product.uom})</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData[product._id]?.reworkQuantity || ''}
                      onChange={(e) =>
                        handleInputChange(product._id, 'reworkQuantity', Number(e.target.value))
                      }
                      placeholder={`Enter rework quantity in ${product.uom}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Scrap Quantity ({product.uom})</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData[product._id]?.scrapQuantity || ''}
                      onChange={(e) =>
                        handleInputChange(product._id, 'scrapQuantity', Number(e.target.value))
                      }
                      placeholder={`Enter scrap quantity in ${product.uom}`}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Time Taken (minutes)</Label>
                    <Input
                      type="number"
                      min="0"
                      value={formData[product._id]?.actualTimeTaken || ''}
                      onChange={(e) =>
                        handleInputChange(product._id, 'actualTimeTaken', Number(e.target.value))
                      }
                      placeholder="Enter time taken in minutes"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  );
}