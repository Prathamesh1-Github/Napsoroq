import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrapReasonMultiSelect } from '../ScrapReasonMultiSelect';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Package2,
  Save,
  CheckCircle2,
  Calculator,
  AlertTriangle
} from 'lucide-react';

interface ProductProductionFormSectionProps {
  selectedDate: Date;
  isCompleted: boolean;
  onDataChange: (data: any) => void;
}

interface ProductData {
  _id: string;
  productName: string;
  uom: string;
}

interface ScrapReason {
  _id: string;
  reason: string;
}

export function ProductProductionFormSection({ selectedDate, isCompleted, onDataChange }: ProductProductionFormSectionProps) {
  const [finishedProducts, setFinishedProducts] = useState<ProductData[]>([]);
  const [semiFinishedProducts, setSemiFinishedProducts] = useState<ProductData[]>([]);
  const [scrapReasons, setScrapReasons] = useState<ScrapReason[]>([]);
  const [formData, setFormData] = useState<{ [key: string]: any }>({});
  const [estimatedUsage, setEstimatedUsage] = useState<{ [key: string]: number }>({});
  const [actualUsage, setActualUsage] = useState<{ [key: string]: number }>({});
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [finishedRes, semiRes, scrapRes] = await Promise.all([
        axios.get("https://neura-ops.onrender.com/api/v1/product/with-machines", {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }),
        axios.get("https://neura-ops.onrender.com/api/v1/semifinished/with-machines", {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }),
        axios.get("https://neura-ops.onrender.com/api/v1/scrapreasons", {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        })
      ]);

      setFinishedProducts(finishedRes.data.products);
      setSemiFinishedProducts(semiRes.data.products);
      setScrapReasons(scrapRes.data || []);

      // Initialize form data
      const combined = [...finishedRes.data.products, ...semiRes.data.products];
      const initialFormData: { [key: string]: any } = {};
      combined.forEach((product: ProductData) => {
        initialFormData[product._id] = {
          totalUnitsProduced: null,
          goodUnitsProduced: null,
          goodUnitsWithoutRework: null,
          scrapUnits: null,
          scrapReasons: [],
          productId: product._id
        };
      });
      setFormData(initialFormData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch product data",
        variant: "destructive"
      });
    }
  };

  const handleCalculate = async () => {
    try {
      const { data } = await axios.post(
        'https://neura-ops.onrender.com/api/v1/productproduction/estimated',
        Object.values(formData),
        {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        }
      );

      setEstimatedUsage(data.estimatedMaterialUsage || {});
      setActualUsage(data.estimatedMaterialUsage || {});

      toast({
        title: "Success",
        description: "Estimated usage calculated successfully",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to calculate estimated usage",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const allProducts = [...finishedProducts, ...semiFinishedProducts];
      const targetDate = new Date(selectedDate);

      await Promise.all(allProducts.map(product => {
        const isSemiFinished = semiFinishedProducts.some(p => p._id === product._id);
        const form = {
          ...formData[product._id],
          productType: isSemiFinished ? 'SemiFinishedProduct' : 'Product',
          estimatedMaterialUsed: estimatedUsage,
          actualMaterialUsed: actualUsage,
          // Override the createdAt to be the selected date
          createdAt: targetDate.toISOString()
        };

        return axios.post('https://neura-ops.onrender.com/api/v1/productproduction/', form, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') },
        });
      }));

      toast({
        title: "Success",
        description: `Product production data saved successfully for ${format(selectedDate, 'PPP')}`,
      });

      onDataChange(formData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save production data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const renderProductAccordion = (title: string, products: ProductData[]) => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      <Accordion type="single" collapsible className="space-y-2">
        {products.map(product => (
          <AccordionItem key={product._id} value={product._id} className="border rounded-lg">
            <AccordionTrigger className="px-4 hover:no-underline">
              <div className="flex items-center gap-2">
                <Package2 className="h-4 w-4" />
                <span className="font-medium">{product.productName}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Total Quantity Produced ({product.uom})</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData[product._id]?.totalUnitsProduced ?? ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [product._id]: { ...prev[product._id], totalUnitsProduced: Number(e.target.value) || null }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Good Quantity Produced ({product.uom})</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData[product._id]?.goodUnitsProduced ?? ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [product._id]: { ...prev[product._id], goodUnitsProduced: Number(e.target.value) || null }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Good Quantity Without Rework ({product.uom})</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData[product._id]?.goodUnitsWithoutRework ?? ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [product._id]: { ...prev[product._id], goodUnitsWithoutRework: Number(e.target.value) || null }
                    }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Scrap Quantity ({product.uom})</Label>
                  <Input
                    type="number"
                    min="0"
                    value={formData[product._id]?.scrapUnits ?? ''}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      [product._id]: { ...prev[product._id], scrapUnits: Number(e.target.value) || null }
                    }))}
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Scrap Reasons
                </Label>
                <ScrapReasonMultiSelect
                  scrapReasons={scrapReasons}
                  selectedReasons={formData[product._id]?.scrapReasons ?? []}
                  onSelectionChange={(selectedReasons) => 
                    setFormData(prev => ({
                      ...prev,
                      [product._id]: { ...prev[product._id], scrapReasons: selectedReasons }
                    }))
                  }
                  onAddNewReason={async (reason) => {
                    try {
                      const response = await axios.post(
                        'https://neura-ops.onrender.com/api/v1/scrapreasons',
                        { reason },
                        { headers: { Authorization: 'Bearer ' + localStorage.getItem('token') } }
                      );
                      setScrapReasons(prev => [...prev, response.data.scrapReason]);
                    } catch {
                      throw new Error('Failed to add scrap reason');
                    }
                  }}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );

  return (
    <Card className="shadow-lg border-2">
      <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package2 className="h-6 w-6 text-green-600" />
            <div>
              <CardTitle className="text-green-900">Product Production Data</CardTitle>
              <p className="text-sm text-green-700 mt-1">Record production for semi-finished and finished products</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isCompleted && (
              <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
            <Button onClick={handleCalculate} variant="outline" size="sm">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate
            </Button>
            <Button onClick={handleSave} disabled={loading} size="sm">
              <Save className="mr-2 h-4 w-4" />
              {loading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-6 space-y-6">
        {renderProductAccordion("Semi-Finished Products", semiFinishedProducts)}
        {renderProductAccordion("Finished Products", finishedProducts)}

        {/* Material Usage Section */}
        {Object.keys(estimatedUsage).length > 0 && (
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">Material Usage Estimation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(estimatedUsage).map(([matId, qty]) => (
                  <div key={matId} className="space-y-2">
                    <Label>{matId}</Label>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Estimated: {qty} units</p>
                      <Input
                        type="number"
                        min="0"
                        placeholder="Enter actual usage"
                        value={actualUsage[matId] || ''}
                        onChange={(e) => setActualUsage(prev => ({
                          ...prev,
                          [matId]: Number(e.target.value) || 0
                        }))}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}