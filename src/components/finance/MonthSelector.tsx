import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatMonthYear } from '@/lib/format';

interface MonthSelectorProps {
  month: number;
  year: number;
  onChange: (month: number, year: number) => void;
}

export function MonthSelector({ month, year, onChange }: MonthSelectorProps) {
  const handlePrevMonth = () => {
    if (month === 1) {
      onChange(12, year - 1);
    } else {
      onChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onChange(1, year + 1);
    } else {
      onChange(month + 1, year);
    }
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return month === now.getMonth() + 1 && year === now.getFullYear();
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <div className="px-4 py-2 rounded-lg bg-secondary min-w-[160px] text-center">
        <span className="font-medium capitalize">{formatMonthYear(month, year)}</span>
      </div>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={handleNextMonth}
        disabled={isCurrentMonth()}
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
