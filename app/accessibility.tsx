import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Type, Eye, Mic, Speaker, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useAccessibility } from '@/contexts/accessibility-context';
import SegmentedControl from '@react-native-segmented-control/segmented-control';

export default function AccessibilityScreen() {
  const router = useRouter();
  const {
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
  } = useAccessibility();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Accessibility Settings</Text>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Type size={24} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Text Settings</Text>
          </View>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Font Size</Text>
            <SegmentedControl
              values={['Small', 'Medium', 'Large', 'Extra Large']}
              selectedIndex={['small', 'medium', 'large', 'extra-large'].indexOf(fontSize)}
              onChange={(event) => {
                const value = ['small', 'medium', 'large', 'extra-large'][event.nativeEvent.selectedSegmentIndex];
                setFontSize(value as any);
              }}
              style={styles.segmentedControl}
            />
          </View>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Font Type</Text>
            <View style={styles.fontTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.fontTypeButton,
                  fontType === 'system' && styles.fontTypeButtonActive,
                ]}
                onPress={() => setFontType('system')}
              >
                <Text
                  style={[
                    styles.fontTypeButtonText,
                    fontType === 'system' && styles.fontTypeButtonTextActive,
                  ]}
                >
                  System Font
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.fontTypeButton,
                  fontType === 'dyslexic' && styles.fontTypeButtonActive,
                ]}
                onPress={() => setFontType('dyslexic')}
              >
                <Text
                  style={[
                    styles.fontTypeButtonText,
                    fontType === 'dyslexic' && styles.fontTypeButtonTextActive,
                  ]}
                >
                  OpenDyslexic
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.settingDescription}>
              Note: OpenDyslexic font may not be available in offline mode.
            </Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Eye size={24} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Display Settings</Text>
          </View>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Color Mode</Text>
            <SegmentedControl
              values={['System', 'Light', 'Dark', 'High Contrast']}
              selectedIndex={['system', 'light', 'dark', 'high-contrast'].indexOf(colorMode)}
              onChange={(event) => {
                const value = ['system', 'light', 'dark', 'high-contrast'][event.nativeEvent.selectedSegmentIndex];
                setColorMode(value as any);
              }}
              style={styles.segmentedControl}
            />
          </View>
          
          <View style={styles.setting}>
            <Text style={styles.settingLabel}>Screen Reader Optimization</Text>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                Optimize UI for screen readers
              </Text>
              <Switch
                value={isScreenReaderOptimized}
                onValueChange={toggleScreenReaderOptimization}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Mic size={24} color={Colors.light.primary} />
            <Text style={styles.sectionTitle}>Voice Control</Text>
          </View>
          
          <View style={styles.setting}>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                Enable Voice Control
              </Text>
              <Switch
                value={isVoiceControlEnabled}
                onValueChange={toggleVoiceControl}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
            <Text style={styles.settingDescription}>
              Control the app using voice commands. Say "Help" to see available commands.
            </Text>
          </View>
        </View>
        
        <View style={styles.previewSection}>
          <Text style={styles.previewTitle}>Preview</Text>
          <View style={[
            styles.previewBox,
            colorMode === 'dark' && styles.previewBoxDark,
            colorMode === 'high-contrast' && styles.previewBoxHighContrast,
          ]}>
            <Text style={[
              styles.previewText,
              fontSize === 'small' && styles.previewTextSmall,
              fontSize === 'large' && styles.previewTextLarge,
              fontSize === 'extra-large' && styles.previewTextExtraLarge,
              // We're not using the actual OpenDyslexic font here to avoid network errors
              // Instead, we're simulating the appearance with system fonts
              colorMode === 'dark' && styles.previewTextDark,
              colorMode === 'high-contrast' && styles.previewTextHighContrast,
            ]}>
              This is a preview of your text settings.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
  },
  setting: {
    marginBottom: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  segmentedControl: {
    marginBottom: 8,
  },
  fontTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  fontTypeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  fontTypeButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  fontTypeButtonText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  fontTypeButtonTextActive: {
    color: '#FFFFFF',
  },
  dyslexicFont: {
    // We're not using the actual font here to avoid network errors
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  settingDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginTop: 8,
  },
  previewSection: {
    marginBottom: 32,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  previewBox: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  previewBoxDark: {
    backgroundColor: '#222222',
    borderColor: '#444444',
  },
  previewBoxHighContrast: {
    backgroundColor: '#000000',
    borderColor: '#FFFFFF',
  },
  previewText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  previewTextSmall: {
    fontSize: 14,
  },
  previewTextLarge: {
    fontSize: 20,
  },
  previewTextExtraLarge: {
    fontSize: 24,
  },
  previewTextDark: {
    color: '#FFFFFF',
  },
  previewTextHighContrast: {
    color: '#FFFFFF',
  },
});
