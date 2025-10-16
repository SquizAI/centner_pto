'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek, addWeeks, subWeeks, addDays, subDays } from 'date-fns';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CalendarEvent, CalendarView, EVENT_TYPE_CONFIG, EventType } from '@/types/calendar.types';

interface CalendarProps {
  events: CalendarEvent[];
  view?: CalendarView;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  selectedDate?: Date;
  className?: string;
}

export function Calendar({
  events,
  view = 'month',
  onDateSelect,
  onEventClick,
  selectedDate,
  className,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(selectedDate || new Date());
  const [currentView, setCurrentView] = React.useState<CalendarView>(view);

  // Get calendar dates based on current view
  const getCalendarDates = React.useCallback(() => {
    if (currentView === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const calendarStart = startOfWeek(monthStart);
      const calendarEnd = endOfWeek(monthEnd);

      return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    } else if (currentView === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);

      return eachDayOfInterval({ start: weekStart, end: weekEnd });
    } else {
      // Day view
      return [currentDate];
    }
  }, [currentDate, currentView]);

  const calendarDates = getCalendarDates();

  // Get events for a specific date
  const getEventsForDate = (date: Date): CalendarEvent[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.event_date);
      return isSameDay(eventDate, date);
    });
  };

  // Get event type from event
  const getEventType = (event: CalendarEvent): EventType => {
    return (event.event_type as EventType) || 'other';
  };

  // Navigation handlers
  const handlePrevious = () => {
    if (currentView === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subDays(currentDate, 1));
    }
  };

  const handleNext = () => {
    if (currentView === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (currentView === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Get header text based on view
  const getHeaderText = () => {
    if (currentView === 'month') {
      return format(currentDate, 'MMMM yyyy');
    } else if (currentView === 'week') {
      const weekStart = startOfWeek(currentDate);
      const weekEnd = endOfWeek(currentDate);
      return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
    } else {
      return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  return (
    <div className={cn('flex flex-col space-y-4', className)}>
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" aria-hidden="true" />
          <h2 className="text-2xl font-bold tracking-tight">{getHeaderText()}</h2>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* View Switcher */}
          <div className="hidden sm:flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button
              variant={currentView === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('month')}
              className="text-xs"
            >
              Month
            </Button>
            <Button
              variant={currentView === 'week' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('week')}
              className="text-xs"
            >
              Week
            </Button>
            <Button
              variant={currentView === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCurrentView('day')}
              className="text-xs"
            >
              Day
            </Button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="text-sm"
            >
              Today
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                onClick={handlePrevious}
                aria-label="Previous"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleNext}
                aria-label="Next"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="rounded-lg border bg-card overflow-hidden">
        {currentView === 'month' && (
          <div className="grid grid-cols-7 gap-px bg-border">
            {/* Week day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div
                key={day}
                className="bg-muted px-2 py-3 text-center text-sm font-semibold"
              >
                <span className="hidden sm:inline">{day}</span>
                <span className="sm:hidden">{day.charAt(0)}</span>
              </div>
            ))}

            {/* Calendar dates */}
            <AnimatePresence mode="wait">
              {calendarDates.map((date, index) => {
                const dateEvents = getEventsForDate(date);
                const isCurrentMonth = isSameMonth(date, currentDate);
                const isTodayDate = isToday(date);
                const isSelected = selectedDate && isSameDay(date, selectedDate);

                return (
                  <motion.button
                    key={date.toISOString()}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.01 }}
                    onClick={() => handleDateClick(date)}
                    className={cn(
                      'bg-card min-h-20 sm:min-h-28 p-1 sm:p-2 text-left hover:bg-accent/5 transition-colors relative',
                      !isCurrentMonth && 'text-muted-foreground bg-muted/50',
                      isSelected && 'ring-2 ring-primary ring-inset'
                    )}
                    aria-label={`${format(date, 'MMMM d, yyyy')}${dateEvents.length > 0 ? `, ${dateEvents.length} event${dateEvents.length === 1 ? '' : 's'}` : ''}`}
                  >
                    <div className="flex flex-col h-full">
                      <time
                        dateTime={date.toISOString()}
                        className={cn(
                          'text-sm sm:text-base font-medium mb-1',
                          isTodayDate && 'flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 bg-primary text-primary-foreground rounded-full'
                        )}
                      >
                        {format(date, 'd')}
                      </time>

                      {/* Event indicators */}
                      {dateEvents.length > 0 && (
                        <div className="flex-1 flex flex-col gap-1">
                          {dateEvents.slice(0, 2).map((event) => {
                            const eventType = getEventType(event);
                            const config = EVENT_TYPE_CONFIG[eventType];
                            return (
                              <div
                                key={event.id}
                                className={cn(
                                  'hidden sm:flex text-xs px-1.5 py-0.5 rounded truncate',
                                  config.bgColor,
                                  config.textColor
                                )}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (onEventClick) onEventClick(event);
                                }}
                              >
                                {event.title}
                              </div>
                            );
                          })}

                          {/* Event count badge for mobile or overflow */}
                          {dateEvents.length > 0 && (
                            <div className="flex items-center gap-1 mt-auto">
                              {dateEvents.slice(0, 3).map((event) => {
                                const eventType = getEventType(event);
                                const config = EVENT_TYPE_CONFIG[eventType];
                                return (
                                  <div
                                    key={event.id}
                                    className={cn(
                                      'sm:hidden w-2 h-2 rounded-full',
                                      config.bgColor.replace('/10', '')
                                    )}
                                    aria-hidden="true"
                                  />
                                );
                              })}
                              {dateEvents.length > 2 && (
                                <span className="hidden sm:inline text-xs text-muted-foreground">
                                  +{dateEvents.length - 2} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}

        {/* Week View */}
        {currentView === 'week' && (
          <div className="divide-y">
            {calendarDates.map((date) => {
              const dateEvents = getEventsForDate(date);
              const isTodayDate = isToday(date);
              const isSelected = selectedDate && isSameDay(date, selectedDate);

              return (
                <div
                  key={date.toISOString()}
                  className={cn(
                    'p-4 hover:bg-accent/5 transition-colors',
                    isSelected && 'bg-accent/10'
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-20 text-center">
                      <div className="text-sm font-semibold text-muted-foreground">
                        {format(date, 'EEE')}
                      </div>
                      <time
                        dateTime={date.toISOString()}
                        className={cn(
                          'inline-flex items-center justify-center w-10 h-10 mt-1 text-xl font-bold rounded-full',
                          isTodayDate && 'bg-primary text-primary-foreground'
                        )}
                      >
                        {format(date, 'd')}
                      </time>
                    </div>

                    <div className="flex-1 space-y-2">
                      {dateEvents.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No events</p>
                      ) : (
                        dateEvents.map((event) => {
                          const eventType = getEventType(event);
                          const config = EVENT_TYPE_CONFIG[eventType];
                          return (
                            <button
                              key={event.id}
                              onClick={() => onEventClick && onEventClick(event)}
                              className={cn(
                                'w-full text-left p-3 rounded-lg border transition-all hover:shadow-md',
                                config.bgColor,
                                'border-transparent'
                              )}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold truncate">{event.title}</h4>
                                  {event.location && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {event.location}
                                    </p>
                                  )}
                                </div>
                                <Badge variant="outline" className={cn('flex-shrink-0', config.textColor)}>
                                  {config.label}
                                </Badge>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Day View */}
        {currentView === 'day' && (
          <div className="p-6">
            {getEventsForDate(currentDate).length === 0 ? (
              <div className="text-center py-12">
                <CalendarIcon className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No events scheduled for this day</p>
              </div>
            ) : (
              <div className="space-y-4">
                {getEventsForDate(currentDate).map((event) => {
                  const eventType = getEventType(event);
                  const config = EVENT_TYPE_CONFIG[eventType];
                  return (
                    <button
                      key={event.id}
                      onClick={() => onEventClick && onEventClick(event)}
                      className={cn(
                        'w-full text-left p-4 rounded-lg border transition-all hover:shadow-lg',
                        config.bgColor,
                        'border-transparent'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={config.textColor}>
                              {config.label}
                            </Badge>
                            {event.status === 'cancelled' && (
                              <Badge variant="destructive">Cancelled</Badge>
                            )}
                          </div>
                          <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                          {event.description && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {event.description}
                            </p>
                          )}
                          {event.location && (
                            <p className="text-sm font-medium">{event.location}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Loading skeleton
export function CalendarSkeleton() {
  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="flex items-center gap-2">
          <div className="h-9 w-32 bg-muted animate-pulse rounded" />
          <div className="h-9 w-24 bg-muted animate-pulse rounded" />
        </div>
      </div>

      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="bg-muted px-2 py-3 h-12" />
          ))}
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="bg-card min-h-28 p-2">
              <div className="h-6 w-6 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
