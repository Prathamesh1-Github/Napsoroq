import { useState } from 'react';
import { X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ScrapReason {
    _id: string;
    reason: string;
}

interface ScrapReasonMultiSelectProps {
    scrapReasons: ScrapReason[];
    selectedReasons: string[];
    onSelectionChange: (selected: string[]) => void;
    onAddNewReason: (reason: string) => Promise<void>;
    disabled?: boolean;
}

export function ScrapReasonMultiSelect({
    scrapReasons,
    selectedReasons,
    onSelectionChange,
    onAddNewReason,
    disabled = false
}: ScrapReasonMultiSelectProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newReason, setNewReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddReason = async () => {
        if (!newReason.trim()) return;

        setIsSubmitting(true);
        try {
            await onAddNewReason(newReason.trim());
            setNewReason('');
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to add new reason:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleReasonSelect = (reasonId: string) => {
        if (selectedReasons.includes(reasonId)) {
            onSelectionChange(selectedReasons.filter(id => id !== reasonId));
        } else {
            onSelectionChange([...selectedReasons, reasonId]);
        }
    };

    const handleRemoveReason = (reasonId: string) => {
        onSelectionChange(selectedReasons.filter(id => id !== reasonId));
    };

    const getSelectedReasonNames = () => {
        return scrapReasons
            .filter(reason => selectedReasons.includes(reason._id))
            .map(reason => reason.reason);
    };

    return (
        <>
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Select disabled={disabled} onValueChange={handleReasonSelect}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select scrap reasons..." />
                        </SelectTrigger>
                        <SelectContent>
                            {scrapReasons.map((reason) => (
                                <SelectItem
                                    key={reason._id}
                                    value={reason._id}
                                    className={selectedReasons.includes(reason._id) ? 'bg-accent' : ''}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span>{reason.reason}</span>
                                        {selectedReasons.includes(reason._id) && (
                                            <span className="ml-2 text-xs text-muted-foreground">Selected</span>
                                        )}
                                    </div>
                                </SelectItem>
                            ))}
                            <div className="border-t pt-2 mt-2">
                                <Button
    type="button" // ✅ Prevent default submit behavior
    variant="ghost"
    size="sm"
    className="w-full justify-start"
    onClick={() => setIsDialogOpen(true)}
    disabled={disabled}
>
    <Plus className="h-4 w-4 mr-2" />
    Add New Scrap Reason
</Button>

                            </div>
                        </SelectContent>
                    </Select>
                </div>

                {/* Selected Reasons Display */}
                {selectedReasons.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {getSelectedReasonNames().map((reasonName) => {
                            const reasonId = scrapReasons.find(r => r.reason === reasonName)?._id;
                            return (
                                <Badge key={reasonId} variant="secondary" className="flex items-center gap-1">
                                    <span>{reasonName}</span>
                                    <button
                                        type="button"
                                        onClick={() => reasonId && handleRemoveReason(reasonId)}
                                        className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                                        disabled={disabled}
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add New Reason Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Add New Scrap Reason</DialogTitle>
                        <DialogDescription>
                            Enter a new reason for scrap products. This will be available for future use.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="reason">Scrap Reason</Label>
                            <Input
                                id="reason"
                                value={newReason}
                                onChange={(e) => setNewReason(e.target.value)}
                                placeholder="Enter scrap reason..."
                                maxLength={100}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                            disabled={isSubmitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleAddReason}
                            disabled={!newReason.trim() || isSubmitting}
                        >
                            {isSubmitting ? 'Adding...' : 'Add Reason'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}