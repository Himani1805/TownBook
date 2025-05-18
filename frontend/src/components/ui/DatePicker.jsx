import * as React from 'react';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Calendar } from '@/components/ui/Calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled = false,
  className,
  fromDate,
  toDate,
  showTimeSelect = false,
  timeIntervals = 30,
  timeCaption = 'Time',
  dateFormat = 'PPP',
  timeFormat = 'p',
  showTimeSelectOnly = false,
  minTime,
  maxTime,
  ...props
}) {
  const [open, setOpen] = React.useState(false);

  const handleSelect = (date) => {
    onChange(date);
    if (!showTimeSelect) {
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? (
            format(value, showTimeSelect ? `${dateFormat} ${timeFormat}` : dateFormat)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleSelect}
          disabled={disabled}
          initialFocus
          fromDate={fromDate}
          toDate={toDate}
          {...props}
        />
        {showTimeSelect && (
          <div className="border-t border-border p-3">
            <div className="flex items-center space-x-2">
              <input
                type="time"
                value={value ? format(value, 'HH:mm') : ''}
                onChange={(e) => {
                  const [hours, minutes] = e.target.value.split(':');
                  const newDate = value ? new Date(value) : new Date();
                  newDate.setHours(parseInt(hours, 10));
                  newDate.setMinutes(parseInt(minutes, 10));
                  onChange(newDate);
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                step={timeIntervals * 60}
                min={minTime}
                max={maxTime}
              />
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

export function DateRangePicker({
  value: { from, to },
  onChange,
  placeholder = 'Pick a date range',
  disabled = false,
  className,
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className={cn('grid gap-2', className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !from && 'text-muted-foreground',
              className
            )}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {from ? (
              to ? (
                <>
                  {format(from, 'LLL dd, y')} - {format(to, 'LLL dd, y')}
                </>
              ) : (
                format(from, 'LLL dd, y')
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={from}
            selected={{ from, to }}
            onSelect={({ from, to }) => {
              onChange({ from, to });
              if (from && to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
