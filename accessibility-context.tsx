import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type FontSize = 'small' | 'medium' | 'large' | 'extra-large';
type FontType = 'system' | 'dyslexic';
type ColorMode = 'light' | 'dark' | 'high-contrast' | 'system';

interface AccessibilityContextType {
  fontSize: FontSize;
  fontType: FontType;
  colorMode: ColorMode;
  isVoiceControlEnabled: boolean;
  isScreenReaderOptimized: boolean;
  setFontSize: (size: FontSize) => void;
  setFontType: (type: FontType) => void;
  setColorMode: (mode: ColorMode) => void;
  toggleVoiceControl: () => void;
  toggleScreenReaderOptimization: () => void;
  actualColorMode: 'light' | 'dark' | 'high-contrast'; // Computed color mode
  getFontFamily: () => string; // New function to get the appropriate font family
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [fontSize, setFontSize] = useState<FontSize>('medium');
  const [fontType, setFontType] = useState<FontType>('system');
  const [colorMode, setColorMode] = useState<ColorMode>('system');
  const [isVoiceControlEnabled, setIsVoiceControlEnabled] = useState(false);
  const [isScreenReaderOptimized, setIsScreenReaderOptimized] = useState(false);

  // Compute the actual color mode based on settings and system
  const actualColorMode = React.useMemo(() => {
    if (colorMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return colorMode;
  }, [colorMode, systemColorScheme]);

  // Function to get the appropriate font family based on settings
  const getFontFamily = () => {
    // Always return system font to avoid network errors with OpenDyslexic
    // We'll handle the dyslexic font differently in the UI
    return 'System';
  };

  // Load settings from storage on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const storedSettings = await AsyncStorage.getItem('accessibility-settings');
        if (storedSettings) {
          const settings = JSON.parse(storedSettings);
          setFontSize(settings.fontSize || 'medium');
          setFontType(settings.fontType || 'system');
          setColorMode(settings.colorMode || 'system');
          setIsVoiceControlEnabled(settings.isVoiceControlEnabled || false);
          setIsScreenReaderOptimized(settings.isScreenReaderOptimized || false);
        }
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        const settings = {
          fontSize,
          fontType,
          colorMode,
          isVoiceControlEnabled,
          isScreenReaderOptimized,
        };
        await AsyncStorage.setItem('accessibility-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save accessibility settings:', error);
      }
    };

    saveSettings();
  }, [fontSize, fontType, colorMode, isVoiceControlEnabled, isScreenReaderOptimized]);

  const toggleVoiceControl = () => {
    setIsVoiceControlEnabled(prev => !prev);
  };

  const toggleScreenReaderOptimization = () => {
    setIsScreenReaderOptimized(prev => !prev);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        fontType,
        colorMode,
        isVoiceControlEnabled,
        isScreenReaderOptimized,
        setFontSize,
        setFontType,
        setColorMode,
        toggleVoiceControl,
        toggleScreenReaderOptimization,
        actualColorMode,
        getFontFamily,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
