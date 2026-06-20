import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AppConfig {
  appName: string;
  schoolName: string;
  logoUrl: string | null;
  notificationsEnabled: boolean;
}

interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AppConfig>({
    appName: 'Jurnal Ngajar',
    schoolName: 'SMKN 1 Tambelang',
    logoUrl: null,
    notificationsEnabled: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem('sijarma_config');
    if (stored) {
      try {
        setConfig((prev) => ({ ...prev, ...JSON.parse(stored) }));
      } catch (e) {
        console.error("Failed to parse config");
      }
    }
  }, []);

  const updateConfig = (newConfig: Partial<AppConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...newConfig };
      localStorage.setItem('sijarma_config', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig }}>
      {children}
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
