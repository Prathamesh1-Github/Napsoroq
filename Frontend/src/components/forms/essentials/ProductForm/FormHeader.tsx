import { Button } from '@/components/ui/button';
import { ArrowLeft, Package } from 'lucide-react';

interface FormHeaderProps {
  navigate: (path: string) => void;
}

export function FormHeader({ navigate }: FormHeaderProps) {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Product Details Entry</h1>
          <p className="text-muted-foreground">Fill out the information to add a new product</p>
        </div>
      </div>
      <Button variant="outline" onClick={() => navigate('/')} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>
    </div>
  );
}