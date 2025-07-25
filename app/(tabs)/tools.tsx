import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { WifiOff, Zap, Sparkles, Lightbulb, Palette, Share2, Mic, FileText, Database } from 'lucide-react-native';
import Colors from '@/constants/colors';

export default function ToolsScreen() {
  const router = useRouter();

  const tools = [
    {
      id: 'offline',
      title: 'Offline Mode',
      description: 'Access and manage your saved transcriptions when offline',
      icon: <WifiOff size={24} color={Colors.light.primary} />,
      route: '/offline',
    },
    {
      id: 'handwriting',
      title: 'Handwriting Settings',
      description: 'Configure handwriting recognition preferences',
      icon: <FileText size={24} color={Colors.light.primary} />,
      route: '/language-settings',
    },
    {
      id: 'accessibility',
      title: 'Accessibility',
      description: 'Customize app appearance and behavior for better accessibility',
      icon: <Palette size={24} color={Colors.light.primary} />,
      route: '/accessibility',
    },
    {
      id: 'integrations',
      title: 'Integrations',
      description: 'Connect with other apps and services',
      icon: <Database size={24} color={Colors.light.primary} />,
      route: '/integrations',
    },
    {
      id: 'voice',
      title: 'Voice Annotation',
      description: 'Add voice notes to your transcriptions',
      icon: <Mic size={24} color={Colors.light.primary} />,
      route: '/voice-annotation/new',
    },
    {
      id: 'share',
      title: 'Collaboration',
      description: 'Share and collaborate on transcriptions with others',
      icon: <Share2 size={24} color={Colors.light.primary} />,
      route: '/transcription/share/latest',
    },
    {
      id: 'research',
      title: 'Research Assistant',
      description: 'Get contextual information and research for your content',
      icon: <Lightbulb size={24} color={Colors.light.primary} />,
      route: '/research/new',
    },
    {
      id: 'visualization',
      title: 'Visualization',
      description: 'Visualize your notes with mind maps and concept graphs',
      icon: <Sparkles size={24} color={Colors.light.primary} />,
      route: '/visualization/new',
    },
  ];

  const handleToolPress = (route: string) => {
    router.push(route);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Tools & Utilities</Text>
      <Text style={styles.subtitle}>Enhance your handwriting recognition experience with these powerful tools</Text>
      
      <View style={styles.toolsGrid}>
        {tools.map((tool) => (
          <TouchableOpacity
            key={tool.id}
            style={styles.toolCard}
            onPress={() => handleToolPress(tool.route)}
          >
            <View style={styles.iconContainer}>
              {tool.icon}
            </View>
            <Text style={styles.toolTitle}>{tool.title}</Text>
            <Text style={styles.toolDescription}>{tool.description}</Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.promoCard}>
        <Zap size={24} color="#FFFFFF" />
        <Text style={styles.promoTitle}>Upgrade to Pro</Text>
        <Text style={styles.promoDescription}>
          Get unlimited transcriptions, advanced AI features, and priority support
        </Text>
        <TouchableOpacity style={styles.promoButton}>
          <Text style={styles.promoButtonText}>Learn More</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  toolCard: {
    width: '47%',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: Colors.light.text,
  },
  toolDescription: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    lineHeight: 18,
  },
  promoCard: {
    backgroundColor: Colors.light.primary,
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 8,
  },
  promoDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  promoButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  promoButtonText: {
    color: Colors.light.primary,
    fontWeight: '600',
    fontSize: 14,
  },
});
