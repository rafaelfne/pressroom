'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function TemplateSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchValue, setSearchValue] = useState(
    searchParams.get('search') || '',
  );

  // Debounced search update
  const updateSearch = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      if (value) {
        params.set('search', value);
      } else {
        params.delete('search');
      }

      // Reset to page 1 when searching
      params.delete('page');

      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchValue !== (searchParams.get('search') || '')) {
        updateSearch(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchParams, updateSearch]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Search templates..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="pl-9"
        />
      </div>
    </div>
  );
}
