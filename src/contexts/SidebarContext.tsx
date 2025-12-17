import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
  mounted: boolean;
}

const SidebarContext = createContext<SidebarContextType | null>(null);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    if (saved !== null) {
      setIsCollapsed(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebarCollapsed', JSON.stringify(newState));
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar, mounted }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}
