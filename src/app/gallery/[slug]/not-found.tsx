import Link from 'next/link';
import { ArrowLeft, ImageOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AlbumNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md text-center">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted">
          <ImageOff className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
        </div>

        <h1 className="text-4xl font-bold mb-4">Album Not Found</h1>

        <p className="text-muted-foreground text-lg mb-8">
          The photo album you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/gallery">
            <Button variant="default" className="w-full sm:w-auto">
              Browse All Albums
            </Button>
          </Link>

          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
