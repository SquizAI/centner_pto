import Link from 'next/link';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PostNotFound() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-muted p-6">
            <FileQuestion className="h-16 w-16 text-muted-foreground" />
          </div>
        </div>

        <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>

        <p className="text-muted-foreground text-lg mb-8">
          The news post you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>

        <div className="flex gap-4 justify-center">
          <Link href="/news">
            <Button size="lg">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>

        <div className="mt-12 pt-8 border-t">
          <p className="text-sm text-muted-foreground mb-4">
            You might be interested in:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/news"
              className="text-sm text-primary hover:underline"
            >
              Latest News
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/events"
              className="text-sm text-primary hover:underline"
            >
              Upcoming Events
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/about"
              className="text-sm text-primary hover:underline"
            >
              About PTO
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
