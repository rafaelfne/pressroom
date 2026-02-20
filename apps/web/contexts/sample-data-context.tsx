'use client';

import { createContext, useContext, type ReactNode } from 'react';

const SampleDataContext = createContext<Record<string, unknown> | undefined>(undefined);

export function SampleDataProvider({
  value,
  children,
}: {
  value: Record<string, unknown>;
  children: ReactNode;
}) {
  return <SampleDataContext.Provider value={value}>{children}</SampleDataContext.Provider>;
}

export function useSampleData(): Record<string, unknown> | undefined {
  return useContext(SampleDataContext);
}
