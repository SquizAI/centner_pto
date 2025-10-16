import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarIcon } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Events Calendar</h1>
            <p className="text-muted-foreground">Upcoming events across all campuses</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar View Skeleton */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-xl sm:text-2xl">Calendar</CardTitle>
                    <CardDescription className="text-sm">View events by month, week, or day</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-[hsl(var(--preschool))] text-white text-xs">Preschool</Badge>
                    <Badge className="bg-[hsl(var(--elementary))] text-white text-xs">Elementary</Badge>
                    <Badge className="bg-[hsl(var(--middle-high))] text-white text-xs">Middle/High</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-[500px] sm:h-[550px] lg:h-[650px] flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upcoming Events Skeleton */}
          <div className="space-y-6">
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-primary" />
                  Upcoming Events
                </CardTitle>
                <CardDescription>Click on the calendar to view details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <Skeleton className="h-5 w-3/4" />
                        <Skeleton className="h-5 w-16" />
                      </div>
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
