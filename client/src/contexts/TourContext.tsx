// TourContext — global state for the ExecTour guided simulation
// Allows any component (e.g. Home page button) to open/close the tour
// while the overlay is mounted at the App level and persists across route changes.

import { createContext, useContext, useState } from "react";

interface TourContextValue {
  tourOpen: boolean;
  openTour: () => void;
  closeTour: () => void;
}

const TourContext = createContext<TourContextValue>({
  tourOpen: false,
  openTour: () => {},
  closeTour: () => {},
});

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [tourOpen, setTourOpen] = useState(false);
  return (
    <TourContext.Provider value={{
      tourOpen,
      openTour: () => setTourOpen(true),
      closeTour: () => setTourOpen(false),
    }}>
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  return useContext(TourContext);
}
