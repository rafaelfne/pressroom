'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { InheritedStyles } from '@/lib/types/style-system';

export const InheritedStylesContext = createContext<Partial<InheritedStyles>>({});

export function InheritedStylesProvider({
  styles,
  children,
}: {
  styles: Partial<InheritedStyles>;
  children: ReactNode;
}) {
  const parentStyles = useInheritedStyles();
  const definedStyles = Object.fromEntries(Object.entries(styles).filter(([, v]) => v !== undefined));
  const mergedStyles = { ...parentStyles, ...definedStyles };
  return <InheritedStylesContext.Provider value={mergedStyles}>{children}</InheritedStylesContext.Provider>;
}

export function useInheritedStyles(): Partial<InheritedStyles> {
  return useContext(InheritedStylesContext);
}
