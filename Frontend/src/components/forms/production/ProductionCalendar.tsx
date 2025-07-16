import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock } from 'lucide-react';
import { format, isToday } from 'date-fns';
import axios from 'axios';
import { cn } from '@/lib/utils';

interface ProductionCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTodayClick: () => void;
}

interface DateStatus {
  hasProduction: boolean;
  hasProductProduction: boolean;
  hasManualJob: boolean;
  isComplete: boolean;
}

export function ProductionCalendar({ selectedDate, onDateSelect, onTodayClick }: ProductionCalendarProps) {
  const [open, setOpen] = useState(false);
  const [dateStatuses, setDateStatuses] = useState<Record<string, DateStatus>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDateStatuses();
  }, []);

  if(loading) {
    return <div>Loading...</div>;
  }

  const fetchDateStatuses = async () => {
    setLoading(true);
    try {
      // Fetch data from all three endpoints
      const [productionRes, productProductionRes, manualJobRes] = await Promise.all([
        axios.get('https://neura-ops.onrender.com/api/v1/production/filtered', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }),
        axios.get('https://neura-ops.onrender.com/api/v1/productproduction/productproductionbydates', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        }),
        axios.get('https://neura-ops.onrender.com/api/v1/manual-job-productions', {
          headers: { Authorization: 'Bearer ' + localStorage.getItem('token') }
        })
      ]);

      const productionDates = Object.keys(productionRes.data.productionsByDate || {});
      const productProductionDates = Object.keys(productProductionRes.data.productionsByDate || {});
      const manualJobDates = Object.keys(manualJobRes.data.productionsByDate || {});

      // Create a comprehensive date status map
      const allDates = new Set([...productionDates, ...productProductionDates, ...manualJobDates]);
      const statuses: Record<string, DateStatus> = {};

      allDates.forEach(date => {
        const hasProduction = productionDates.includes(date);
        const hasProductProduction = productProductionDates.includes(date);
        const hasManualJob = manualJobDates.includes(date);

        statuses[date] = {
          hasProduction,
          hasProductProduction,
          hasManualJob,
          isComplete: hasProduction && hasProductProduction && hasManualJob
        };
      });

      setDateStatuses(statuses);
    } catch (error) {
      console.error('Error fetching date statuses:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateStatus = (date: Date): DateStatus => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return dateStatuses[dateStr] || {
      hasProduction: false,
      hasProductProduction: false,
      hasManualJob: false,
      isComplete: false
    };
  };

  // const getDayClassName = (date: Date) => {
  //   const status = getDateStatus(date);
  //   const baseClass = "relative";
    
  //   if (status.isComplete) {
  //     return cn(baseClass, "bg-green-100 text-green-800 hover:bg-green-200");
  //   } else if (status.hasProduction || status.hasProductProduction || status.hasManualJob) {
  //     return cn(baseClass, "bg-yellow-100 text-yellow-800 hover:bg-yellow-200");
  //   } else {
  //     return cn(baseClass, "bg-red-50 text-red-600 hover:bg-red-100");
  //   }
  // };

  // const renderDayContent = (date: Date) => {
  //   const status = getDateStatus(date);
  //   const dayNumber = format(date, 'd');
    
  //   return (
  //     <div className="relative w-full h-full flex items-center justify-center">
  //       <span>{dayNumber}</span>
  //       {(status.hasProduction || status.hasProductProduction || status.hasManualJob) && (
  //         <div className="absolute bottom-0 right-0 flex gap-0.5">
  //           {status.isComplete ? (
  //             <CheckCircle2 className="h-2 w-2 text-green-600" />
  //           ) : (
  //             <AlertCircle className="h-2 w-2 text-yellow-600" />
  //           )}
  //         </div>
  //       )}
  //     </div>
  //   );
  // };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "h-9 justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? (
            <span>{format(selectedDate, 'PPP')}</span>
          ) : (
            <span>Select date</span>
          )}
          {isToday(selectedDate) && (
            <Badge variant="secondary" className="ml-2 text-xs">
              Today
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold">Production Calendar</h4>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onTodayClick();
                setOpen(false);
              }}
              className="gap-2"
            >
              <Clock className="h-3 w-3" />
              Today
            </Button>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-green-100 border border-green-200 rounded"></div>
              <span>Complete</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div>
              <span>Partial</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
              <span>Missing</span>
            </div>
          </div>

          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(date) => {
              if (date) {
                onDateSelect(date);
                setOpen(false);
              }
            }}
            disabled={(date) => date > new Date()}
            modifiers={{
              complete: (date) => getDateStatus(date).isComplete,
              partial: (date) => {
                const status = getDateStatus(date);
                return !status.isComplete && (status.hasProduction || status.hasProductProduction || status.hasManualJob);
              },
              missing: (date) => {
                const status = getDateStatus(date);
                return !status.hasProduction && !status.hasProductProduction && !status.hasManualJob;
              }
            }}
            modifiersClassNames={{
              complete: "bg-green-100 text-green-800 hover:bg-green-200",
              partial: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200", 
              missing: "bg-red-50 text-red-600 hover:bg-red-100"
            }}
            initialFocus
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}