import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cog, Timer, Plus, PackageCheck } from 'lucide-react';
import { FormErrorMessage } from '@/components/ui/form-error-message';

interface ProductionTabProps {
  formData: any;
  machines: any[];
  selectedMachine: string;
  setSelectedMachine: (id: string) => void;
  machineCycleTime: number;
  setMachineCycleTime: (time: number) => void;
  productsProducedInOneCycleTime: number;
  setProductsProducedInOneCycleTime: (qty: number) => void;
  handleMachineChange: () => void;
  errors: Record<string, string>;
}

export function ProductionTab({
  formData,
  machines,
  selectedMachine,
  setSelectedMachine,
  machineCycleTime,
  setMachineCycleTime,
  productsProducedInOneCycleTime,
  setProductsProducedInOneCycleTime,
  handleMachineChange,
  errors
}: ProductionTabProps) {
  return (
    <Card className="border-chart-3/20">
      <CardHeader className="bg-chart-3/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Cog className="h-5 w-5 text-chart-3" />
          <CardTitle>Production Details</CardTitle>
        </div>
        <CardDescription>
          Configure machines and production parameters
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {formData.machines && formData.machines.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Cog className="h-4 w-4 text-chart-3" />
              Selected Machines
            </h3>
            <div className="divide-y">
              {formData.machines.map((machine: any, index: number) => {
                const machineDetails = machines.find(m => m.machineId === machine.machineId);
                return (
                  <div key={index} className="py-3 px-2 hover:bg-muted/50 rounded-md space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-chart-3/10 flex items-center justify-center">
                          <Cog className="h-4 w-4 text-chart-3" />
                        </div>
                        <div>
                          <p className="font-medium">{machineDetails ? machineDetails.machineName : "Unknown Machine"}</p>
                          <p className="text-sm text-muted-foreground">ID: {machine.machineId}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2 ml-10">
                      <span className="bg-chart-3/10 text-chart-3 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <Timer className="h-3 w-3" /> {machine.cycleTime} mins
                      </span>
                      <span className="bg-chart-3/10 text-chart-3 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <PackageCheck className="h-3 w-3" /> {machine.productsProducedInOneCycleTime} units/cycle
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4 bg-muted/10 p-4 rounded-lg">
          <h3 className="font-semibold">Add New Machine</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Machine</Label>
              <Select value={selectedMachine} onValueChange={setSelectedMachine}>
                <SelectTrigger className={errors.selectedMachine ? "border-destructive" : ""}>
                  <SelectValue placeholder="Choose a machine" />
                </SelectTrigger>
                <SelectContent>
                  {machines.map(machine => (
                    <SelectItem key={machine.machineId} value={machine.machineId}>
                      {machine.machineName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.selectedMachine && <FormErrorMessage>{errors.selectedMachine}</FormErrorMessage>}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <Label>Cycle Time (mins)</Label>
              </div>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={machineCycleTime}
                onChange={(e) => setMachineCycleTime(Number(e.target.value))}
                className={errors.machineCycleTime ? "border-destructive" : ""}
              />
              {errors.machineCycleTime && <FormErrorMessage>{errors.machineCycleTime}</FormErrorMessage>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-muted-foreground" />
                <Label>Products Produced in One Cycle</Label>
              </div>
              <Input
                type="number"
                min="1"
                value={productsProducedInOneCycleTime}
                onChange={(e) => setProductsProducedInOneCycleTime(Number(e.target.value))}
                className={errors.productsProducedInOneCycleTime ? "border-destructive" : ""}
              />
              {errors.productsProducedInOneCycleTime && <FormErrorMessage>{errors.productsProducedInOneCycleTime}</FormErrorMessage>}
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleMachineChange}
            className="gap-2 mt-2"
            disabled={!selectedMachine}
          >
            <Plus className="h-4 w-4" /> Add Machine
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}