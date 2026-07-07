// GlobalPageContext.tsx
// Tracks the user's current location across the entire DCT Platform
// and exposes the full context payload (features, APIs, stories, screens,
// business rules, batches, business objects, integrations) to any component.

import React, { createContext, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  PAGE_CONTEXT_REGISTRY,
  PageContextEntry,
  resolvePageContext,
} from "@/lib/pageContextRegistry";

interface GlobalPageContextValue {
  currentPath: string;
  pageContext: PageContextEntry | null;
  isDiscoveryPage: boolean;
  isBatchPage: boolean;
  isGatePage: boolean;
}

const GlobalPageContext = createContext<GlobalPageContextValue>({
  currentPath: "/",
  pageContext: null,
  isDiscoveryPage: false,
  isBatchPage: false,
  isGatePage: false,
});

export function GlobalPageProvider({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [pageContext, setPageContext] = useState<PageContextEntry | null>(null);

  useEffect(() => {
    const ctx = resolvePageContext(location);
    setPageContext(ctx);
  }, [location]);

  const isDiscoveryPage = location.startsWith("/discovery");
  const isBatchPage = /^\/batch\/[^/]+$/.test(location);
  const isGatePage = location.startsWith("/gate");

  return (
    <GlobalPageContext.Provider
      value={{
        currentPath: location,
        pageContext,
        isDiscoveryPage,
        isBatchPage,
        isGatePage,
      }}
    >
      {children}
    </GlobalPageContext.Provider>
  );
}

export function useGlobalPageContext() {
  return useContext(GlobalPageContext);
}

export { PAGE_CONTEXT_REGISTRY };
