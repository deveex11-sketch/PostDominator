"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  date: Date | null;
  onDateChange: (date: Date | null) => void;
}

export function DateTimePicker({ date, onDateChange }: DateTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    date || undefined
  );
  const [timeValue, setTimeValue] = useState(() => {
    if (date) {
      return format(date, "HH:mm");
    }
    const defaultTime = new Date();
    defaultTime.setHours(defaultTime.getHours() + 1);
    return format(defaultTime, "HH:mm");
  });

  // Sync with external date changes
  useEffect(() => {
    if (date) {
      const dateOnly = new Date(date);
      dateOnly.setHours(0, 0, 0, 0);
      const currentDateOnly = selectedDate ? new Date(selectedDate) : null;
      if (currentDateOnly) {
        currentDateOnly.setHours(0, 0, 0, 0);
      }
      
      // Only update if the date part is different
      if (!currentDateOnly || dateOnly.getTime() !== currentDateOnly.getTime()) {
        setSelectedDate(date);
        setTimeValue(format(date, "HH:mm"));
      }
    } else if (!date) {
      setSelectedDate(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date]);

  const handleDateSelect = (newDate: Date | undefined) => {
    if (newDate) {
      setSelectedDate(newDate);
      // Combine selected date with time
      if (timeValue) {
        const [hours, minutes] = timeValue.split(":").map(Number);
        const combinedDate = new Date(newDate);
        combinedDate.setHours(hours || 0, minutes || 0, 0, 0);
        onDateChange(combinedDate);
      } else {
        // If no time is set, set to current time or 1 hour from now
        const combinedDate = new Date(newDate);
        const now = new Date();
        combinedDate.setHours(now.getHours() + 1, 0, 0, 0);
        setTimeValue(format(combinedDate, "HH:mm"));
        onDateChange(combinedDate);
      }
    } else {
      setSelectedDate(undefined);
      onDateChange(null);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setTimeValue(newTime);
    
    if (selectedDate && newTime) {
      const [hours, minutes] = newTime.split(":").map(Number);
      const combinedDate = new Date(selectedDate);
      combinedDate.setHours(hours || 0, minutes || 0, 0, 0);
      onDateChange(combinedDate);
    }
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 size-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              disabled={(date) => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return date < today;
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-2">
        <Label htmlFor="time" className="text-sm font-medium">
          Time
        </Label>
        <div className="relative">
          <Clock className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="time"
            type="time"
            value={timeValue}
            onChange={handleTimeChange}
            className="pl-9"
          />
        </div>
      </div>

      {date && (
        <div className="rounded-md bg-muted/50 p-3">
          <p className="text-muted-foreground text-xs font-medium">Scheduled for:</p>
          <p className="text-sm font-semibold">{format(date, "PPP 'at' p")}</p>
        </div>
      )}
    </div>
  );
}
