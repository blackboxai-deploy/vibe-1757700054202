'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
        <div className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="h-9 w-9 p-0 relative"
      title="Toggle theme"
    >
      {/* Sun icon */}
      <div className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0">
        <div className="w-4 h-4 border-2 border-current rounded-full relative">
          <div className="absolute -top-1 left-1/2 w-0.5 h-2 bg-current transform -translate-x-1/2 -translate-y-full" />
          <div className="absolute -bottom-1 left-1/2 w-0.5 h-2 bg-current transform -translate-x-1/2 translate-y-full" />
          <div className="absolute -left-1 top-1/2 w-2 h-0.5 bg-current transform -translate-y-1/2 -translate-x-full" />
          <div className="absolute -right-1 top-1/2 w-2 h-0.5 bg-current transform -translate-y-1/2 translate-x-full" />
        </div>
      </div>
      {/* Moon icon */}
      <div className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100">
        <div className="w-4 h-4 bg-current rounded-full relative overflow-hidden">
          <div className="absolute top-1 right-1 w-3 h-3 bg-background rounded-full" />
        </div>
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}