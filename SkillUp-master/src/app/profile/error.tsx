'use client'; 

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md text-center shadow-2xl shadow-destructive/20">
        <CardHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <CardTitle className="mt-4 text-2xl font-headline">Something went wrong</CardTitle>
          <CardDescription className="mt-2 text-muted-foreground">
            An unexpected error occurred on the profile page.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <p className="text-sm bg-muted p-3 rounded-md text-muted-foreground">
               Error: {error.message}
            </p>
          <Button
            onClick={() => reset()}
          >
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
