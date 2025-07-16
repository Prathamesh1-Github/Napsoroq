import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductDetailsTab } from './Tabs/ProductDetailsTab';
import { CostingDetailsTab } from './Tabs/CostingDetailsTab';
import { InventoryDetailsTab } from './Tabs/InventoryDetailsTab';
import { QualityControlTab } from './Tabs/QualityControlTab';
import { RawMaterialsTab } from './Tabs/RawMaterialsTab';
import { ProductionTab } from './Tabs/ProductionTab';
import { ManualJobsTab } from './Tabs/ManualJobsTab';
import { SemiFinishedTab } from './Tabs/SemiFinishedTab';
import { 
  Package, 
  Calculator, 
  BarChartHorizontal, 
  CheckCircle, 
  Boxes,
  Cog, 
  Users,
  Component
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: any;
  setFormData: (data: any) => void;
  rawMaterials: any[];
  machines: any[];
  selectedMaterial: string;
  setSelectedMaterial: (id: string) => void;
  materialQuantity: number;
  setMaterialQuantity: (qty: number) => void;
  handleMaterialChange: () => void;
  selectedMachine: string;
  setSelectedMachine: (id: string) => void;
  machineCycleTime: number;
  setMachineCycleTime: (time: number) => void;
  productsProducedInOneCycleTime: number;
  setProductsProducedInOneCycleTime: (qty: number) => void;
  handleMachineChange: () => void;
  manualJobs: any[];
  selectedManualJob: string;
  setSelectedManualJob: (id: string) => void;
  manualTimePerUnit: number;
  setManualTimePerUnit: (time: number) => void;
  handleAddManualJob: () => void;
  semiFinishedProducts: any[];
  selectedSemiFinishedProduct: string;
  setSelectedSemiFinishedProduct: (id: string) => void;
  selectedSemiFinishedProductQuantity: number;
  setSelectedSemiFinishedProductQuantity: (qty: number) => void;
  handleSemiFinishedProductChange: () => void;
  removeSemiFinishedProduct: (id: string) => void;
  errors: Record<string, Record<string, string>>;
  workflowSteps: any[];
}

// Map tab IDs to user-friendly display names and icons
const tabConfig = [
  { id: 'productDetails', name: 'Product', icon: Package },
  { id: 'costingDetails', name: 'Costing', icon: Calculator },
  { id: 'inventoryDetails', name: 'Inventory', icon: BarChartHorizontal },
  { id: 'qualityControl', name: 'Quality', icon: CheckCircle },
  { id: 'rawMaterials', name: 'Materials', icon: Boxes },
  { id: 'production', name: 'Production', icon: Cog },
  { id: 'manualJobs', name: 'Jobs', icon: Users },
  { id: 'semiFinished', name: 'Components', icon: Component }
];

export function FormTabs({
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  rawMaterials,
  machines,
  selectedMaterial,
  setSelectedMaterial,
  materialQuantity,
  setMaterialQuantity,
  handleMaterialChange,
  selectedMachine,
  setSelectedMachine,
  machineCycleTime,
  setMachineCycleTime,
  productsProducedInOneCycleTime,
  setProductsProducedInOneCycleTime,
  handleMachineChange,
  manualJobs,
  selectedManualJob,
  setSelectedManualJob,
  manualTimePerUnit,
  setManualTimePerUnit,
  handleAddManualJob,
  semiFinishedProducts,
  selectedSemiFinishedProduct,
  setSelectedSemiFinishedProduct,
  selectedSemiFinishedProductQuantity,
  setSelectedSemiFinishedProductQuantity,
  handleSemiFinishedProductChange,
  removeSemiFinishedProduct,
  errors,
}: FormTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <div className="sticky top-0 z-10 bg-card px-4 pt-4">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-8">
          {tabConfig.map(({ id, name, icon: Icon }) => {
            const hasErrors = errors[id] && Object.keys(errors[id]).length > 0;
            
            return (
              <TabsTrigger 
                key={id} 
                value={id}
                className={cn(
                  "flex flex-col gap-1 py-3 relative",
                  hasErrors && "text-destructive",
                )}
              >
                {hasErrors && (
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
                    !
                  </span>
                )}
                <Icon className={cn(
                  "h-5 w-5 mx-auto",
                  activeTab === id ? "text-primary" : "text-muted-foreground",
                  hasErrors && "text-destructive"
                )} />
                <span className="text-xs font-medium">{name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </div>

      <div className="p-6">
        <TabsContent value="productDetails" className="mt-0">
          <ProductDetailsTab 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors.productDetails || {}}
          />
        </TabsContent>
        
        <TabsContent value="costingDetails" className="mt-0">
          <CostingDetailsTab 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors.costingDetails || {}}
          />
        </TabsContent>
        
        <TabsContent value="inventoryDetails" className="mt-0">
          <InventoryDetailsTab 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors.inventoryDetails || {}}
          />
        </TabsContent>
        
        <TabsContent value="qualityControl" className="mt-0">
          <QualityControlTab 
            formData={formData} 
            setFormData={setFormData} 
            errors={errors.qualityControl || {}}
          />
        </TabsContent>
        
        <TabsContent value="rawMaterials" className="mt-0">
          <RawMaterialsTab 
            formData={formData}
            rawMaterials={rawMaterials}
            selectedMaterial={selectedMaterial}
            setSelectedMaterial={setSelectedMaterial}
            materialQuantity={materialQuantity}
            setMaterialQuantity={setMaterialQuantity}
            handleMaterialChange={handleMaterialChange}
            errors={errors.rawMaterials || {}}
          />
        </TabsContent>
        
        <TabsContent value="production" className="mt-0">
          <ProductionTab 
            formData={formData}
            machines={machines}
            selectedMachine={selectedMachine}
            setSelectedMachine={setSelectedMachine}
            machineCycleTime={machineCycleTime}
            setMachineCycleTime={setMachineCycleTime}
            productsProducedInOneCycleTime={productsProducedInOneCycleTime}
            setProductsProducedInOneCycleTime={setProductsProducedInOneCycleTime}
            handleMachineChange={handleMachineChange}
            errors={errors.production || {}}
          />
        </TabsContent>
        
        <TabsContent value="manualJobs" className="mt-0">
          <ManualJobsTab 
            formData={formData}
            manualJobs={manualJobs}
            selectedManualJob={selectedManualJob}
            setSelectedManualJob={setSelectedManualJob}
            manualTimePerUnit={manualTimePerUnit}
            setManualTimePerUnit={setManualTimePerUnit}
            handleAddManualJob={handleAddManualJob}
            errors={errors.manualJobs || {}}
          />
        </TabsContent>
        
        <TabsContent value="semiFinished" className="mt-0">
          <SemiFinishedTab 
            formData={formData}
            semiFinishedProducts={semiFinishedProducts}
            selectedSemiFinishedProduct={selectedSemiFinishedProduct}
            setSelectedSemiFinishedProduct={setSelectedSemiFinishedProduct}
            selectedSemiFinishedProductQuantity={selectedSemiFinishedProductQuantity}
            setSelectedSemiFinishedProductQuantity={setSelectedSemiFinishedProductQuantity}
            handleSemiFinishedProductChange={handleSemiFinishedProductChange}
            removeSemiFinishedProduct={removeSemiFinishedProduct}
            errors={errors.semiFinished || {}}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
}