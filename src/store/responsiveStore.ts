import { create } from "zustand";
import * as SecureStore from "expo-secure-store";

const STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: "app_sidebar_collapsed",
} as const;

type SidebarState = "expanded" | "collapsed";

interface ResponsiveState {
  isSidebarCollapsed: SidebarState;
  isHydrated: boolean;

  hydrate: () => Promise<void>;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;
}

const getStorageValue = async (key: string): Promise<string | null> => {
  try {
    const value = await SecureStore.getItemAsync(key);
    if (value !== null) return value;
  } catch {
    // Ignore errors
  }

  // Fallback to localStorage for web
  if (typeof localStorage !== "undefined") {
    return localStorage.getItem(key);
  }

  return null;
};

const setStorageValue = async (key: string, value: string): Promise<void> => {
  try {
    await SecureStore.setItemAsync(key, value);
  } catch {
    // Ignore errors
  }

  // Fallback to localStorage for web
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(key, value);
  }
};

export const useResponsiveStore = create<ResponsiveState>((set, get) => ({
  isSidebarCollapsed: "expanded",
  isHydrated: false,

  hydrate: async () => {
    try {
      const stored = await getStorageValue(STORAGE_KEYS.SIDEBAR_COLLAPSED);
      if (stored === "collapsed" || stored === "expanded") {
        set({ isSidebarCollapsed: stored, isHydrated: true });
      } else {
        set({ isHydrated: true });
      }
    } catch {
      set({ isHydrated: true });
    }
  },

  toggleSidebar: () => {
    const current = get().isSidebarCollapsed;
    const newState: SidebarState =
      current === "expanded" ? "collapsed" : "expanded";
    set({ isSidebarCollapsed: newState });
    setStorageValue(STORAGE_KEYS.SIDEBAR_COLLAPSED, newState);
  },

  setSidebarCollapsed: (collapsed: boolean) => {
    const newState: SidebarState = collapsed ? "collapsed" : "expanded";
    set({ isSidebarCollapsed: newState });
    setStorageValue(STORAGE_KEYS.SIDEBAR_COLLAPSED, newState);
  },

  expandSidebar: () => {
    set({ isSidebarCollapsed: "expanded" });
    setStorageValue(STORAGE_KEYS.SIDEBAR_COLLAPSED, "expanded");
  },

  collapseSidebar: () => {
    set({ isSidebarCollapsed: "collapsed" });
    setStorageValue(STORAGE_KEYS.SIDEBAR_COLLAPSED, "collapsed");
  },
}));

export default useResponsiveStore;
