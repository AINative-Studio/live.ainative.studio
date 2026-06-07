import Link from 'next/link';
import { FileQuestion, Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <FileQuestion className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
        <p className="text-4xl font-bold mb-2" aria-hidden="true">404</p>
        <h1 className="text-xl font-semibold text-muted-foreground mb-6">Page not found</h1>
        <div className="flex gap-3 justify-center">
          <Button asChild><Link href="/"><Home className="w-4 h-4 mr-2" />Go home</Link></Button>
          <Button variant="outline" asChild><Link href="/search"><Search className="w-4 h-4 mr-2" />Search</Link></Button>
        </div>
      </div>
    </div>
  );
}
