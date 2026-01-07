import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface BrandingInfo {
  name: string;
  website: string;
  social: {
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    github?: string;
    youtube?: string;
    tiktok?: string;
  };
}

interface BrandingPreferences {
  enabled: boolean;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  showName: boolean;
  showWebsite: boolean;
  showSocial: boolean;
  fontSize: number;
  fontFamily: string;
  color: string;
  opacity: number;
  padding: number;
  socialIconSize: number;
  socialLayout: 'horizontal' | 'vertical';
}

interface BrandingStore {
  info: BrandingInfo;
  preferences: BrandingPreferences;
  
  // Actions
  updateInfo: (updates: Partial<BrandingInfo>) => void;
  updateSocial: (platform: string, value: string) => void;
  updatePreferences: (updates: Partial<BrandingPreferences>) => void;
  resetToDefaults: () => void;
}

const defaultInfo: BrandingInfo = {
  name: '',
  website: '',
  social: {},
};

const defaultPreferences: BrandingPreferences = {
  enabled: false,
  position: 'bottom-right',
  showName: true,
  showWebsite: true,
  showSocial: true,
  fontSize: 14,
  fontFamily: 'Inter',
  color: '#ffffff',
  opacity: 0.8,
  padding: 24,
  socialIconSize: 20,
  socialLayout: 'horizontal',
};

export const useBrandingStore = create<BrandingStore>()(
  persist(
    (set) => ({
      info: defaultInfo,
      preferences: defaultPreferences,
      
      updateInfo: (updates) => set((state) => ({
        info: { ...state.info, ...updates },
      })),
      
      updateSocial: (platform, value) => set((state) => ({
        info: {
          ...state.info,
          social: { ...state.info.social, [platform]: value },
        },
      })),
      
      updatePreferences: (updates) => set((state) => ({
        preferences: { ...state.preferences, ...updates },
      })),
      
      resetToDefaults: () => set({
        info: defaultInfo,
        preferences: defaultPreferences,
      }),
    }),
    {
      name: 'yvcode-branding',
    }
  )
);
