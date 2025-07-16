import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface TimeInputProps {
  label: string;
  value: number | null; // Value in minutes
  onChange: (valueInMinutes: number) => void;
  icon?: React.ElementType;
  required?: boolean;
}

export function TimeInput({
  label,
  value,
  onChange,
  icon: Icon = Clock,
  required = false
}: TimeInputProps) {
  const [hours, setHours] = useState<number>(0);
  const [minutes, setMinutes] = useState<number>(0);
  const [seconds, setSeconds] = useState<number>(0);

  // Convert minutes to h:m:s when value changes externally
  useEffect(() => {
    if (value === null) {
      setHours(0);
      setMinutes(0);
      setSeconds(0);
      return;
    }

    const totalMinutes = Math.max(0, value);
    const calculatedHours = Math.floor(totalMinutes / 60);
    const calculatedMinutes = Math.floor(totalMinutes % 60);
    const calculatedSeconds = Math.round((totalMinutes % 1) * 60);

    setHours(calculatedHours);
    setMinutes(calculatedMinutes);
    setSeconds(calculatedSeconds);
  }, [value]);

  // Convert h:m:s to minutes when any input changes
  const handleTimeChange = (
    newHours: number,
    newMinutes: number,
    newSeconds: number
  ) => {
    const totalMinutes =
      newHours * 60 +
      newMinutes +
      newSeconds / 60;

    onChange(totalMinutes);
  };

  return (
    <div className="space-y-2">
      <Label className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="grid grid-cols-3 gap-2">
        <div className="relative">
          <Input
            type="number"
            min="0"
            value={hours || ''}
            onChange={(e) => {
              const newValue = parseInt(e.target.value) || 0;
              setHours(newValue);
              handleTimeChange(newValue, minutes, seconds);
            }}
            className="pr-8 transition-all focus:ring-2 focus:ring-primary/20"
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            hrs
          </span>
        </div>

        <div className="relative">
          <Input
            type="number"
            min="0"
            max="59"
            value={minutes || ''}
            onChange={(e) => {
              const newValue = parseInt(e.target.value) || 0;
              setMinutes(newValue);
              handleTimeChange(hours, newValue, seconds);
            }}
            className="pr-8 transition-all focus:ring-2 focus:ring-primary/20"
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            min
          </span>
        </div>

        <div className="relative">
          <Input
            type="number"
            min="0"
            max="59"
            value={seconds || ''}
            onChange={(e) => {
              const newValue = parseInt(e.target.value) || 0;
              setSeconds(newValue);
              handleTimeChange(hours, minutes, newValue);
            }}
            className="pr-8 transition-all focus:ring-2 focus:ring-primary/20"
            placeholder="0"
          />
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            sec
          </span>
        </div>
      </div>
    </div>
  );
}