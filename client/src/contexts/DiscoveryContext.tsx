// DiscoveryContext.tsx
// Tracks the currently active Discovery Center page and exposes its
// full context data to any component in the tree — primarily the Control Panel.
//
// Usage:
//   const { activeDiscoveryContext, isDiscoveryActive } = useDiscovery();

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import {
  getDiscoveryContext,
  isDiscoveryRoute,
  type DiscoveryPageContext,
} from "@/lib/discoveryRegistry";

interface DiscoveryContextValue {
  /** Full context object for the current Discovery page, or null if not on a Discovery page */
  activeDiscoveryContext: DiscoveryPageContext | null;
  /** True when the user is currently viewing any Discovery Center page */
  isDiscoveryActive: boolean;
  /** The raw pathname of the current Discovery page */
  activeDiscoveryPath: string | null;
}

const DiscoveryCtx = createContext<DiscoveryContextValue>({
  activeDiscoveryContext: null,
  isDiscoveryActive: false,
  activeDiscoveryPath: null,
});

export function DiscoveryProvider({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [value, setValue] = useState<DiscoveryContextValue>(() => {
    const ctx = getDiscoveryContext(location);
    return {
      activeDiscoveryContext: ctx,
      isDiscoveryActive: isDiscoveryRoute(location),
      activeDiscoveryPath: isDiscoveryRoute(location) ? location : null,
    };
  });

  useEffect(() => {
    const ctx = getDiscoveryContext(location);
    setValue({
      activeDiscoveryContext: ctx,
      isDiscoveryActive: isDiscoveryRoute(location),
      activeDiscoveryPath: isDiscoveryRoute(location) ? location : null,
    });
  }, [location]);

  return <DiscoveryCtx.Provider value={value}>{children}</DiscoveryCtx.Provider>;
}

export function useDiscovery(): DiscoveryContextValue {
  return useContext(DiscoveryCtx);
}
