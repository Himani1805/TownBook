import * as React from 'react';
import { format, parse } from 'date-fns';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/Popover';

export function TimePicker({
  value,
  onChange,
  placeholder = 'Select time',
  disabled = false,
  className,
  interval = 30,
  minTime,
  maxTime,
  timeFormat = 'h:mm a',
  showSeconds = false,
  ...props
}) {
  const [open, setOpen] = React.useState(false);
  
  // Generate time options based on interval
  const generateTimeOptions = () => {
    const times = [];
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    let current = new Date(startDate);
    
    while (current <= endDate) {
      times.push(new Date(current));
      current = new Date(current.getTime() + interval * 60 * 1000);
    }
    
    return times;
  };
  
  const timeOptions = generateTimeOptions();
  
  const handleSelect = (time) => {
    onChange(time);
    setOpen(false);
  };
  
  const handleCustomTimeChange = (e) => {
    const [hours, minutes] = e.target.value.split(':');
    if (hours && minutes) {
      const newTime = value ? new Date(value) : new Date();
      newTime.setHours(parseInt(hours, 10));
      newTime.setMinutes(parseInt(minutes, 10));
      newTime.setSeconds(0);
      onChange(newTime);
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
          <Clock className="mr-2 h-4 w-4" />
          {value ? (
            format(value, timeFormat)
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="max-h-[300px] overflow-y-auto p-2">
          <div className="grid grid-cols-3 gap-1">
            {timeOptions.map((time, i) => {
              const timeStr = format(time, 'h:mm a');
              const isSelected = value && format(value, 'HH:mm') === format(time, 'HH:mm');
              
              // Apply min/max time filters
              if (minTime && time < minTime) return null;
              if (maxTime && time > maxTime) return null;
              
              return (
                <Button
                  key={i}
                  variant={isSelected ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-20 p-0 text-xs"
                  onClick={() => handleSelect(time)}
                >
                  {timeStr}
                </Button>
              );
            })}
          </div>
          
          <div className="mt-4 border-t pt-3">
            <div className="flex items-center justify-between px-2">
              <span className="text-sm font-medium">Custom time:</span>
              <input
                type="time"
                value={value ? format(value, 'HH:mm') : ''}
                onChange={handleCustomTimeChange}
                className="rounded-md border border-input bg-background px-2 py-1 text-sm"
                step={interval * 60}
                min={minTime ? format(minTime, 'HH:mm') : undefined}
                max={maxTime ? format(maxTime, 'HH:mm') : undefined}
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// 24-hour time picker variant
export function TimePicker24h({
  value,
  onChange,
  ...props
}) {
  return (
    <TimePicker
      value={value}
      onChange={onChange}
      timeFormat="HH:mm"
      {...props}
    />
  );
}

// Time range picker
export function TimeRangePicker({
  value: { start, end },
  onChange,
  ...props
}) {
  const handleStartChange = (time) => {
    onChange({ start: time, end });
  };
  
  const handleEndChange = (time) => {
    onChange({ start, end: time });
  };
  
  return (
    <div className="flex items-center space-x-2">
      <TimePicker
        value={start}
        onChange={handleStartChange}
        maxTime={end}
        {...props}
      />
      <span className="text-muted-foreground">to</span>
      <TimePicker
        value={end}
        onChange={handleEndChange}
        minTime={start}
        {...props}
      />
    </div>
  );
}
