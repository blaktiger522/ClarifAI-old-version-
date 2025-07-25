import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { FileText, Mail as MailIcon, Heart, ChevronRight, Info, Globe, Mic, GitBranch, Search, Accessibility } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface SettingsSectionProps {
  title: string;
  items: {
    icon: React.ReactNode;
    title: string;
    subtitle?: string;
    route?: string;
    onPress: () => void;
  }[];
}

function SettingsSection({ title, items }: SettingsSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionContent}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.sectionItem,
              index === items.length - 1 && styles.sectionItemLast,
            ]}
            onPress={item.onPress}
          >
            <View style={styles.sectionItemContent}>
              <View style={styles.sectionItemIcon}>{item.icon}</View>
              <View style={styles.sectionItemText}>
                <Text style={styles.sectionItemTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.sectionItemSubtitle}>{item.subtitle}</Text>
                )}
              </View>
            </View>
            <ChevronRight size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const router = useRouter();

  const handlePrivacyPolicy = () => {
    Linking.openURL('https://example.com/privacy');
  };

  const handleTerms = () => {
    Linking.openURL('https://example.com/terms');
  };

  const handleContact = () => {
    Linking.openURL('mailto:support@example.com');
  };

  const handleAbout = () => {
    // You could navigate to an About screen here
  };

  const handleAcknowledgements = () => {
    // You could navigate to an Acknowledgements screen here
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Settings</Text>

        <SettingsSection
          title="Features"
          items={[
            {
              icon: <Globe size={24} color={Colors.light.primary} />,
              title: "Text Recognition Settings",
              subtitle: "Configure handwriting recognition",
              onPress: () => router.push('/language-settings'),
            },
            {
              icon: <Mic size={24} color={Colors.light.primary} />,
              title: "Voice Annotations",
              subtitle: "Manage voice notes settings",
              onPress: () => router.push('/voice-annotation/placeholder'),
            },
            {
              icon: <GitBranch size={24} color={Colors.light.primary} />,
              title: "Visualization Settings",
              subtitle: "Customize visualization options",
              onPress: () => router.push('/visualization/placeholder'),
            },
            {
              icon: <Search size={24} color={Colors.light.primary} />,
              title: "Research Settings",
              subtitle: "Configure research sources",
              onPress: () => router.push('/research/placeholder'),
            },

            {
              icon: <Accessibility size={24} color={Colors.light.primary} />,
              title: "Accessibility",
              subtitle: "Customize for your needs",
              onPress: () => router.push('/accessibility'),
            },
          ]}
        />

        <SettingsSection
          title="Legal"
          items={[
            {
              icon: <FileText size={24} color={Colors.light.primary} />,
              title: "Privacy Policy",
              onPress: handlePrivacyPolicy,
            },
            {
              icon: <FileText size={24} color={Colors.light.primary} />,
              title: "Terms of Service",
              onPress: handleTerms,
            },
          ]}
        />

        <SettingsSection
          title="Support"
          items={[
            {
              icon: <MailIcon size={24} color={Colors.light.primary} />,
              title: "Contact Us",
              subtitle: "Get help or send feedback",
              onPress: handleContact,
            },
          ]}
        />

        <SettingsSection
          title="About"
          items={[
            {
              icon: <Info size={24} color={Colors.light.primary} />,
              title: "About ClarifAI",
              subtitle: "Version 1.0.0",
              onPress: handleAbout,
            },
            {
              icon: <Heart size={24} color={Colors.light.primary} />,
              title: "Acknowledgements",
              subtitle: "Credits and open source licenses",
              onPress: handleAcknowledgements,
            },
          ]}
        />
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
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  sectionContent: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    overflow: 'hidden',
  },
  sectionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sectionItemLast: {
    borderBottomWidth: 0,
  },
  sectionItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionItemIcon: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  sectionItemText: {
    flex: 1,
  },
  sectionItemTitle: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 2,
  },
  sectionItemSubtitle: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
});
