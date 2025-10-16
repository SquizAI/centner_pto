import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from 'lucide-react'
import Link from 'next/link'

export default function EventNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 flex items-center justify-center">
      <Card className="max-w-md mx-4">
        <CardContent className="pt-6 text-center space-y-4">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Event Not Found</h1>
          <p className="text-muted-foreground">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Button asChild>
            <Link href="/calendar">
              Back to Calendar
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
