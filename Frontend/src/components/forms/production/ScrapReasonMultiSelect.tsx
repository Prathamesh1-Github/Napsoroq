import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface ScrapReason {
  _id: string;
  reason: string;
}

interface ScrapReasonMultiSelectProps {
  scrapReasons: ScrapReason[];
  selectedReasons: string[];
  onSelectionChange: (selectedReasons: string[]) => void;
  onAddNewReason: (reason: string) => Promise<void>;
}

export function ScrapReasonMultiSelect({
  scrapReasons,
  selectedReasons,
  onSelectionChange,
  onAddNewReason
}: ScrapReasonMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [newReason, setNewReason] = useState('');
  const [addingNew, setAddingNew] = useState(false);

  const handleAddNewReason = async () => {
    if (!newReason.trim()) return;
    
    setAddingNew(true);
    try {
      await onAddNewReason(newReason.trim());
      setNewReason('');
    } catch (error) {
      console.error('Failed to add new reason:', error);
    } finally {
      setAddingNew(false);
    }
  };

  const toggleReason = (reasonId: string) => {
    const newSelection = selectedReasons.includes(reasonId)
      ? selectedReasons.filter(id => id !== reasonId)
      : [...selectedReasons, reasonId];
    onSelectionChange(newSelection);
  };

  const removeReason = (reasonId: string) => {
    onSelectionChange(selectedReasons.filter(id => id !== reasonId));
  };

  const getSelectedReasonNames = () => {
    return selectedReasons
      .map(id => scrapReasons.find(r => r._id === id)?.reason)
      .filter(Boolean);
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedReasons.length > 0
              ? `${selectedReasons.length} reason(s) selected`
              : "Select scrap reasons..."
            }
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Search reasons..." />
            <CommandEmpty>No reasons found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {scrapReasons.map((reason) => (
                <CommandItem
                  key={reason._id}
                  onSelect={() => toggleReason(reason._id)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedReasons.includes(reason._id) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {reason.reason}
                </CommandItem>
              ))}
            </CommandGroup>
            <div className="border-t p-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new reason..."
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNewReason()}
                />
                <Button
                  size="sm"
                  onClick={handleAddNewReason}
                  disabled={!newReason.trim() || addingNew}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Selected reasons display */}
      {selectedReasons.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {getSelectedReasonNames().map((reasonName, index) => {
            const reasonId = selectedReasons[index];
            return (
              <Badge key={reasonId} variant="secondary" className="text-xs">
                {reasonName}
                <button
                  onClick={() => removeReason(reasonId)}
                  className="ml-1 hover:bg-muted rounded-full"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}