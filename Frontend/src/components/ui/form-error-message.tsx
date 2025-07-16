import { cn } from "@/lib/utils";

interface FormErrorMessageProps {
    children: React.ReactNode;
    className?: string;
}

export function FormErrorMessage({ children, className }: FormErrorMessageProps) {
    return (
        <p className={cn("text-sm font-medium text-destructive mt-1", className)}>
            {children}
        </p>
    );
}