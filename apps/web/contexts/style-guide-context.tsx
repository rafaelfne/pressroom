'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { StyleToken } from '@/lib/types/style-system';

type StyleGuideContextValue = {
  tokens: StyleToken[];
  styleGuideId: string | null;
};

const StyleGuideContext = createContext<StyleGuideContextValue>({
  tokens: [],
  styleGuideId: null,
});

export function StyleGuideProvider({
  tokens,
  styleGuideId,
  children,
}: {
  tokens: StyleToken[];
  styleGuideId: string | null;
  children: ReactNode;
}) {
  return (
    <StyleGuideContext.Provider value={{ tokens, styleGuideId }}>
      {children}
    </StyleGuideContext.Provider>
  );
}

export function useStyleGuide() {
  return useContext(StyleGuideContext);
}
