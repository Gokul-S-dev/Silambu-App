import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import * as auth from "@/services/auth";
import type { User } from "@/types";
import { getStorageItemAsync } from "@/utils/storage";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string,
    childName?: string,
    childAge?: string,
  ) => Promise<void>;
  loginWithGoogle: (idToken?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchToken = async () => {
    try {
      const t = await getStorageItemAsync("access_token");
      setToken(t);
    } catch {}
  };

  useEffect(() => {
    auth.getCurrentUser().then((currentUser) => {
      setUser(currentUser);
      fetchToken().then(() => setIsLoading(false));
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user),
      isLoading,
      async login(email, password) {
        setUser(await auth.login(email, password));
        await fetchToken();
      },
      async signup(name, email, phone, password, childName, childAge) {
        setUser(await auth.signup(name, email, phone, password, childName, childAge));
        await fetchToken();
      },
      async loginWithGoogle(idToken) {
        setUser(await auth.loginWithGoogle(idToken));
        await fetchToken();
      },
      async logout() {
        await auth.logout();
        setUser(null);
        setToken(null);
      },
    }),
    [isLoading, user, token],
  );


  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
