import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AuthStatus, User } from "../../domain/auth";
import { authService } from "../../services/auth/authService";

export interface AuthContextValue {
  status: AuthStatus;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>(authService.getStatus());
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    // Listen to changes in authService
    const unsubscribe = authService.subscribe((newStatus, newUser) => {
      if (isMounted) {
        setStatus(newStatus);
        setUser(newUser);
      }
    });

    // Run initial auth sanity check on app launch
    const checkSanity = async () => {
      try {
        await authService.checkAuthSanity();
      } catch {
        // Handled internally by checkAuthSanity
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void checkSanity();

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    return await authService.login(email, password);
  }, []);

  const logout = useCallback(async () => {
    await authService.logout("unauthenticated");
  }, []);

  return (
    <AuthContext.Provider
      value={{
        status,
        user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
