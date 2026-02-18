import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "DONOR" | "HOSPITAL" | "NGO" | "ADMIN";

interface User {
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  bloodGroup?: string;
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "medipole-user",
    }
  )
);
