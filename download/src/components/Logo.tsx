import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <CalendarDays className="h-6 w-6 text-foreground" />
      <span className="text-xl font-bold tracking-tight text-foreground">TimeWise</span>
    </div>
  );
}
