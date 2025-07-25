import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Globe } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useLanguageStore } from '@/store/language-store';

export default function LanguageSettingsScreen() {
  const router = useRouter();
  const { isAutoDetectEnabled, toggleAutoDetect } = useLanguageStore();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Language Settings</Text>
      </View>

      <View style={styles.autoDetectContainer}>
        <View style={styles.autoDetectContent}>
          <Globe size={24} color={Colors.light.primary} />
          <View style={styles.autoDetectTextContainer}>
            <Text style={styles.autoDetectTitle}>Auto-detect Handwriting</Text>
            <Text style={styles.autoDetectDescription}>
              Automatically detect text in your handwritten notes
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            styles.autoDetectButton,
            isAutoDetectEnabled && styles.autoDetectButtonActive,
          ]}
          onPress={toggleAutoDetect}
        >
          <Text
            style={[
              styles.autoDetectButtonText,
              isAutoDetectEnabled && styles.autoDetectButtonTextActive,
            ]}
          >
            {isAutoDetectEnabled ? 'On' : 'Off'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>English Only</Text>
        <Text style={styles.infoDescription}>
          This application currently supports English language only. Our handwriting recognition system is optimized for English text.
        </Text>
      </View>

      <View style={styles.tipContainer}>
        <Text style={styles.tipTitle}>Tips for Better Recognition</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>1.</Text>
          <Text style={styles.tipText}>Write clearly with good spacing between words</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>2.</Text>
          <Text style={styles.tipText}>Use good lighting when capturing handwritten notes</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>3.</Text>
          <Text style={styles.tipText}>Keep the camera steady and aligned with the text</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipNumber}>4.</Text>
          <Text style={styles.tipText}>For best results, write on lined or grid paper</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  autoDetectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  autoDetectContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  autoDetectTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  autoDetectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  autoDetectDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  autoDetectButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  autoDetectButtonActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  autoDetectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
  },
  autoDetectButtonTextActive: {
    color: '#FFFFFF',
  },
  infoContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.textSecondary,
  },
  tipContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tipTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  tipNumber: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
    width: 24,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: Colors.light.text,
    flex: 1,
  },
});
