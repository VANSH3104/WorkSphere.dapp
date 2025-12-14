import * as React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/app/(module)/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(() => {
    // Prefer an explicit month prop if provided, otherwise try selected (if present),
    // falling back to today. Use runtime checks to avoid TypeScript errors.
    if ("month" in props && props.month) {
      return props.month as Date;
    }
    if ("selected" in props) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const sel = (props as any).selected;
      if (Array.isArray(sel)) {
        return (sel[0] as Date) ?? new Date();
      }
      return (sel as Date) ?? new Date();
    }
    return new Date();
  });

  const handlePreviousYear = () => {
    const newDate = new Date(month);
    newDate.setFullYear(newDate.getFullYear() - 1);
    setMonth(newDate);
  };

  const handleNextYear = () => {
    const newDate = new Date(month);
    newDate.setFullYear(newDate.getFullYear() + 1);
    setMonth(newDate);
  };

  const handlePreviousMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() - 1);
    setMonth(newDate);
  };

  const handleNextMonth = () => {
    const newDate = new Date(month);
    newDate.setMonth(newDate.getMonth() + 1);
    setMonth(newDate);
  };

  return (
    <div className="bg-background rounded-lg shadow-lg border border-border">
      {/* Custom Header with Year Navigation */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30 rounded-t-lg">
        <button
          onClick={handlePreviousYear}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Previous Year"
          type="button"
        >
          <ChevronsLeft className="h-4 w-4 text-foreground-muted" />
        </button>

        <button
          onClick={handlePreviousMonth}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Previous Month"
          type="button"
        >
          <ChevronLeft className="h-4 w-4 text-foreground-muted" />
        </button>

        <div className="text-center flex-1">
          <div className="text-lg font-semibold text-foreground">
            {month.toLocaleDateString('en-US', { month: 'long' })}
          </div>
          <div className="text-sm text-foreground-muted font-medium">
            {month.getFullYear()}
          </div>
        </div>

        <button
          onClick={handleNextMonth}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Next Month"
          type="button"
        >
          <ChevronRight className="h-4 w-4 text-foreground-muted" />
        </button>

        <button
          onClick={handleNextYear}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          title="Next Year"
          type="button"
        >
          <ChevronsRight className="h-4 w-4 text-foreground-muted" />
        </button>
      </div>

      {/* DayPicker */}
      <DayPicker
        month={month}
        onMonthChange={setMonth}
        showOutsideDays={showOutsideDays}
        className={cn("p-4", className)}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "hidden", // Hide default caption since we have custom header
          caption_label: "text-sm font-medium",
          nav: "hidden", // Hide default navigation
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-muted-foreground rounded-md w-10 font-semibold text-xs uppercase tracking-wide",
          row: "flex w-full mt-2",
          cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent/50",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-10 w-10 p-0 font-normal rounded-md aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-gradient-to-br from-neon-cyan to-neon-purple text-white hover:from-neon-cyan/90 hover:to-neon-purple/90 focus:from-neon-cyan/90 focus:to-neon-purple/90 font-semibold shadow-md",
          day_today: "bg-accent text-accent-foreground font-bold border-2 border-primary",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50 cursor-not-allowed",
          day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{}}
        {...props}
      />

      {/* Quick Actions */}
      <div className="px-4 py-3 border-t border-border bg-muted/30 rounded-b-lg">
        <button
          onClick={() => {
            const today = new Date();
            setMonth(today);
            if ('onSelect' in props && typeof props.onSelect === 'function') {
              (props.onSelect as (date: Date) => void)(today);
            }
          }}
          type="button"
          className="w-full py-2 text-sm font-medium text-primary hover:bg-accent rounded-md transition-colors"
        >
          Today: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </button>
      </div>
    </div>
  );
}

Calendar.displayName = "Calendar";

export { Calendar };