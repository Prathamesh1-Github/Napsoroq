import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Timer, Plus } from 'lucide-react';
import { FormErrorMessage } from '@/components/ui/form-error-message';

interface ManualJobsTabProps {
  formData: any;
  manualJobs: any[];
  selectedManualJob: string;
  setSelectedManualJob: (id: string) => void;
  manualTimePerUnit: number;
  setManualTimePerUnit: (time: number) => void;
  handleAddManualJob: () => void;
  errors: Record<string, string>;
}

export function ManualJobsTab({
  formData,
  manualJobs,
  selectedManualJob,
  setSelectedManualJob,
  manualTimePerUnit,
  setManualTimePerUnit,
  handleAddManualJob,
  errors
}: ManualJobsTabProps) {
  return (
    <Card className="border-chart-4/20">
      <CardHeader className="bg-chart-4/5 rounded-t-lg">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-chart-4" />
          <CardTitle>Assign Manual Jobs</CardTitle>
        </div>
        <CardDescription>
          Add manual operations required for product manufacturing
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-6">
        {formData.manualJobs && formData.manualJobs.length > 0 && (
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-4 w-4 text-chart-4" />
              Selected Manual Jobs
            </h3>
            <div className="divide-y">
              {formData.manualJobs.map((job: any, index: number) => {
                const jobDetails = manualJobs.find(j => j._id === job.jobId);
                return (
                  <div key={index} className="flex justify-between items-center py-3 px-2 hover:bg-muted/50 rounded-md">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-chart-4/10 flex items-center justify-center">
                        <Users className="h-4 w-4 text-chart-4" />
                      </div>
                      <div>
                        <p className="font-medium">{jobDetails ? jobDetails.jobName : 'Unknown Job'}</p>
                        <p className="text-sm text-muted-foreground">ID: {job.jobId}</p>
                      </div>
                    </div>
                    <span className="bg-chart-4/10 text-chart-4 px-2 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                      <Timer className="h-3 w-3" /> {job.expectedTimePerUnit} mins
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-4 bg-muted/10 p-4 rounded-lg">
          <h3 className="font-semibold">Add New Manual Job</h3>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Select Manual Job</Label>
              <Select value={selectedManualJob} onValueChange={setSelectedManualJob}>
                <SelectTrigger className={errors.selectedManualJob ? "border-destructive" : ""}>
                  <SelectValue placeholder="Choose a manual job" />
                </SelectTrigger>
                <SelectContent>
                  {manualJobs.map(job => (
                    <SelectItem key={job._id} value={job._id}>
                      {job.jobName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.selectedManualJob && <FormErrorMessage>{errors.selectedManualJob}</FormErrorMessage>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Timer className="h-4 w-4 text-muted-foreground" />
                <Label>Expected Time Per Unit (mins)</Label>
              </div>
              <Input
                type="number"
                min="0"
                step="0.1"
                value={manualTimePerUnit}
                onChange={(e) => setManualTimePerUnit(Number(e.target.value))}
                className={errors.manualTimePerUnit ? "border-destructive" : ""}
              />
              {errors.manualTimePerUnit && <FormErrorMessage>{errors.manualTimePerUnit}</FormErrorMessage>}
            </div>
          </div>

          <Button 
            type="button" 
            onClick={handleAddManualJob}
            className="gap-2 mt-2"
            disabled={!selectedManualJob}
          >
            <Plus className="h-4 w-4" /> Add Manual Job
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}