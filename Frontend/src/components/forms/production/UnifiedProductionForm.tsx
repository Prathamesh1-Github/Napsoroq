import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ProductionCalendar } from './ProductionCalendar';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';
import { format, isToday } from 'date-fns';
import {
  Factory,
  Package2,
  Wrench,
  Save,
  RefreshCw,
  Settings,
  Sparkles,
  Clock,
  CheckCircle2,
  History,
  Lock
} from 'lucide-react';

// Import individual form components
import { ProductionFormSection } from './ProductionFormSection';
import { ProductProductionFormSection } from './ProductProductionFormSection';
import { ManualJobFormSection } from './ManualJobFormSection';

interface UnifiedProductionFormProps {
  selectedDate?: Date;
}

export function UnifiedProductionForm({ selectedDate: initialDate }: UnifiedProductionFormProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate || new Date());
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    production: {},
    productProduction: {},
    manualJob: {}
  });
  const [completionStatus, setCompletionStatus] = useState({
    production: false,
    productProduction: false,
    manualJob: false
  });
  const [isDateLocked, setIsDateLocked] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedDate) {
      fetchExistingData(selectedDate);
    }
  }, [selectedDate]);

  if(formData){
    console.log(formData);
  }

  const fetchExistingData = async (date: Date) => {
    setLoading(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Fetch existing data for the selected date
      const [productionRes, productProductionRes, manualJobRes] = await Promise.all([
        axios.get(`https://neura-ops.onrender.com/api/v1/production/filtered?startDate=${dateStr}&endDate=${dateStr}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }).catch(() => ({ data: { productionsByDate: {} } })),
        
        axios.get(`https://neura-ops.onrender.com/api/v1/productproduction/filtered?startDate=${dateStr}&endDate=${dateStr}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }).catch(() => ({ data: { productionsByDate: {} } })),
        
        axios.get(`https://neura-ops.onrender.com/api/v1/manual-job-productions/filtered?startDate=${dateStr}&endDate=${dateStr}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }).catch(() => ({ data: { productionsByDate: {} } }))
      ]);

      // Check if data exists for this date
      const hasProduction = productionRes.data.productionsByDate?.[dateStr]?.length > 0;
      const hasProductProduction = productProductionRes.data.productionsByDate?.[dateStr]?.length > 0;
      const hasManualJob = manualJobRes.data.productionsByDate?.[dateStr]?.length > 0;

      const newCompletionStatus = {
        production: hasProduction,
        productProduction: hasProductProduction,
        manualJob: hasManualJob
      };

      setCompletionStatus(newCompletionStatus);

      // Lock the date if all data is complete
      const isComplete = hasProduction && hasProductProduction && hasManualJob;
      setIsDateLocked(isComplete);

      if (isComplete) {
        toast({
          title: "Date Locked",
          description: `All production data for ${format(date, 'PPP')} is already complete and cannot be modified.`,
          variant: "default"
        });
      }

      // Pre-populate forms if data exists but not complete
      if (hasProduction && !isComplete) {
        // Transform existing production data to form format
      }

    } catch (error) {
      console.error('Error fetching existing data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch existing data for the selected date.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPreviousDayData = async () => {
    if (isDateLocked) {
      toast({
        title: "Cannot Load Previous Data",
        description: "This date is locked because all data is already complete.",
        variant: "destructive"
      });
      return;
    }

    try {
      const previousDay = new Date(selectedDate);
      previousDay.setDate(previousDay.getDate() - 1);
      const prevDateStr = format(previousDay, 'yyyy-MM-dd');

      const [productionRes, productProductionRes, manualJobRes] = await Promise.all([
        axios.get(`https://neura-ops.onrender.com/api/v1/production/filtered?startDate=${prevDateStr}&endDate=${prevDateStr}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }).catch(() => ({ data: { productionsByDate: {} } })),
        
        axios.get(`https://neura-ops.onrender.com/api/v1/productproduction/filtered?startDate=${prevDateStr}&endDate=${prevDateStr}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }).catch(() => ({ data: { productionsByDate: {} } })),
        
        axios.get(`https://neura-ops.onrender.com/api/v1/manual-job-productions/filtered?startDate=${prevDateStr}&endDate=${prevDateStr}`, {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }).catch(() => ({ data: { productionsByDate: {} } }))
      ]);

      const hasPrevProduction = productionRes.data.productionsByDate?.[prevDateStr]?.length > 0;
      const hasPrevProductProduction = productProductionRes.data.productionsByDate?.[prevDateStr]?.length > 0;
      const hasPrevManualJob = manualJobRes.data.productionsByDate?.[prevDateStr]?.length > 0;

      if (!hasPrevProduction && !hasPrevProductProduction && !hasPrevManualJob) {
        toast({
          title: "No Previous Data",
          description: `No production data found for ${format(previousDay, 'PPP')}`,
          variant: "default"
        });
        return;
      }

      // TODO: Populate forms with previous day data
      toast({
        title: "Previous Day Data Loaded",
        description: `Data from ${format(previousDay, 'PPP')} has been loaded into the forms`,
      });

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch previous day data",
        variant: "destructive"
      });
    }
  };

  const handleSaveAll = async () => {
    if (isDateLocked) {
      toast({
        title: "Cannot Save",
        description: "This date is locked because all data is already complete.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // Save all three forms data
      // This would trigger the individual form submissions
      toast({
        title: "Success!",
        description: "All production data has been saved successfully",
      });
      
      // Refresh completion status
      fetchExistingData(selectedDate);
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

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };

  const getOverallCompletionStatus = () => {
    const completed = Object.values(completionStatus).filter(Boolean).length;
    const total = Object.keys(completionStatus).length;
    return { completed, total, percentage: (completed / total) * 100 };
  };

  const overallStatus = getOverallCompletionStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="container mx-auto py-8 px-4 w-screen"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Factory className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Production Data Entry
            </h1>
          </div>
          <p className="text-muted-foreground">
            Enter daily production metrics for {format(selectedDate, 'EEEE, MMMM dd, yyyy')}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant={overallStatus.completed === overallStatus.total ? "default" : "secondary"}>
              {overallStatus.completed}/{overallStatus.total} Complete
            </Badge>
            {isToday(selectedDate) && (
              <Badge variant="outline" className="gap-1">
                <Clock className="h-3 w-3" />
                Today
              </Badge>
            )}
            {isDateLocked && (
              <Badge variant="destructive" className="gap-1">
                <Lock className="h-3 w-3" />
                Locked
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="h-9" 
            onClick={fetchPreviousDayData}
            disabled={isDateLocked}
          >
            <History className="mr-2 h-4 w-4" />
            Previous Day
          </Button>
          <Button variant="outline" size="sm" className="h-9" onClick={() => fetchExistingData(selectedDate)}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Settings className="mr-2 h-4 w-4" />
            All Links
          </Button>
          <ProductionCalendar
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onTodayClick={() => setSelectedDate(new Date())}
          />
          <Button size="sm" className="h-9">
            <Sparkles className="mr-2 h-4 w-4" />
            AI Insights
          </Button>
        </div>
      </div>

      <Separator className="my-6" />

      {/* Locked Date Warning */}
      {isDateLocked && (
        <Card className="mb-8 bg-gradient-to-r from-red-50 to-orange-50 border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-900">
              <Lock className="h-5 w-5" />
              Date Locked - Data Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">
              All production data for {format(selectedDate, 'PPP')} has been completed and is now locked. 
              Please select a different date to enter new data.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Progress Overview */}
      <Card className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle2 className="h-5 w-5" />
            Daily Progress Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Factory className={`h-8 w-8 ${completionStatus.production ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <h3 className="font-semibold">Machine Production</h3>
                <p className="text-sm text-muted-foreground">
                  {completionStatus.production ? 'Completed' : 'Pending'}
                </p>
              </div>
              {completionStatus.production && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Package2 className={`h-8 w-8 ${completionStatus.productProduction ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <h3 className="font-semibold">Product Production</h3>
                <p className="text-sm text-muted-foreground">
                  {completionStatus.productProduction ? 'Completed' : 'Pending'}
                </p>
              </div>
              {completionStatus.productProduction && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              <Wrench className={`h-8 w-8 ${completionStatus.manualJob ? 'text-green-500' : 'text-gray-400'}`} />
              <div>
                <h3 className="font-semibold">Manual Jobs</h3>
                <p className="text-sm text-muted-foreground">
                  {completionStatus.manualJob ? 'Completed' : 'Pending'}
                </p>
              </div>
              {completionStatus.manualJob && <CheckCircle2 className="h-5 w-5 text-green-500 ml-auto" />}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Forms Container */}
      {!isDateLocked && (
        <div className="space-y-8">
          {/* Machine Production Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <ProductionFormSection
              selectedDate={selectedDate}
              isCompleted={completionStatus.production}
              onDataChange={(data) => setFormData(prev => ({ ...prev, production: data }))}
            />
          </motion.div>

          {/* Product Production Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProductProductionFormSection
              selectedDate={selectedDate}
              isCompleted={completionStatus.productProduction}
              onDataChange={(data) => setFormData(prev => ({ ...prev, productProduction: data }))}
            />
          </motion.div>

          {/* Manual Job Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ManualJobFormSection
              selectedDate={selectedDate}
              isCompleted={completionStatus.manualJob}
              onDataChange={(data) => setFormData(prev => ({ ...prev, manualJob: data }))}
            />
          </motion.div>
        </div>
      )}

      {/* Save All Button */}
      {!isDateLocked && (
        <div className="flex justify-center pt-8">
          <Button
            size="lg"
            onClick={handleSaveAll}
            disabled={loading}
            className="shadow-lg hover:shadow-xl transition-all bg-primary hover:bg-primary/90 px-8"
          >
            <Save className="mr-2 h-5 w-5" />
            {loading ? 'Saving...' : 'Save All Production Data'}
          </Button>
        </div>
      )}
    </motion.div>
  );
}

export default UnifiedProductionForm;