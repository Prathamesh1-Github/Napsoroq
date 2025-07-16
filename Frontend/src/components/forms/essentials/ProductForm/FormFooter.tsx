import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save, Loader2 } from 'lucide-react';

interface FormFooterProps {
  handlePrevious: () => void;
  handleNext: () => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  activeTab: string;
  isLastTab: boolean;
  isFirstTab: boolean;
  isSubmitting: boolean;
}

export function FormFooter({ 
  handlePrevious, 
  handleNext, 
  handleSubmit,
  isLastTab,
  isFirstTab,
  isSubmitting
}: FormFooterProps) {
  return (
    <div className="flex items-center justify-between border-t bg-muted/30 p-6">
      <Button
        type="button"
        variant="outline"
        onClick={handlePrevious}
        disabled={isFirstTab}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Previous
      </Button>
      
      <div className="flex gap-2">
        {isLastTab ? (
          <Button 
            type="button" 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Product
              </>
            )}
          </Button>
        ) : (
          <Button 
            type="button" 
            onClick={handleNext}
            className="gap-2"
          >
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}