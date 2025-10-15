'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function PostError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Post page error:', error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto text-center py-16">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <h1 className="text-3xl font-bold mb-4">Failed to Load Post</h1>

        <p className="text-muted-foreground text-lg mb-8">
          We encountered an error while loading this news post. This could be a temporary issue.
        </p>

        {error.message && (
          <div className="bg-muted p-4 rounded-lg mb-8 text-sm text-left">
            <p className="font-mono text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Button
            onClick={reset}
            size="lg"
          >
            Try Again
          </Button>

          <Link href="/news">
            <Button
              variant="outline"
              size="lg"
            >
              Back to News
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground mt-8">
          If the problem persists, please contact{' '}
          <a
            href="mailto:support@centneracademy.com"
            className="text-primary hover:underline"
          >
            support@centneracademy.com
          </a>
        </p>
      </div>
    </div>
  );
}
