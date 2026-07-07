import React, { createContext, useContext, useState, useEffect } from "react";

export type AllowlistedUser = {
  id: string;
  name: string;
  role: string;
};

export const ALLOWLISTED_USERS: AllowlistedUser[] = [
  { id: "sarah-johnson",  name: "Sarah Johnson",  role: "Administrator"    },
  { id: "michael-chen",   name: "Michael Chen",   role: "Legal Counsel"    },
  { id: "john-smith",     name: "John Smith",     role: "Tax Analyst"      },
  { id: "emily-davis",    name: "Emily Davis",    role: "Tax Analyst"      },
  { id: "product-owner",  name: "Product Owner",  role: "Product Owner"    },
  { id: "provision-lead", name: "Provision Lead", role: "Provision BA"     },
  { id: "state-lead",     name: "State Lead",     role: "State BA"         },
  { id: "jenniver",       name: "Jenniver",       role: "Sr. Business Analyst" },
];

type AuthContextType = {
  user: AllowlistedUser | null;
  signIn: (userId: string) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const SESSION_KEY = "dct_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AllowlistedUser | null>(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AllowlistedUser;
        if (ALLOWLISTED_USERS.find((u) => u.id === parsed.id)) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  useEffect(() => {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const signIn = (userId: string) => {
    const found = ALLOWLISTED_USERS.find((u) => u.id === userId);
    if (found) setUser(found);
  };

  const signOut = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
