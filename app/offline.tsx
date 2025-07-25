import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { WifiOff, ArrowLeft, ExternalLink, Terminal, Server, Smartphone, Laptop, RefreshCw, Zap, Brain } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { getRecommendedAITools } from '@/utils/api';

export default function OfflineScreen() {
  const router = useRouter();
  const aiTools = getRecommendedAITools();

  const handleBack = () => {
    router.back();
  };

  const openExpoTunnelDocs = () => {
    Linking.openURL('https://docs.expo.dev/guides/sharing-preview/#expo-dev-client');
  };

  const openNetworkTroubleshooting = () => {
    Linking.openURL('https://docs.expo.dev/troubleshooting/networking/');
  };

  const openToolUrl = (url: string) => {
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <WifiOff size={48} color={Colors.light.error} />
        <Text style={styles.title}>Connection Troubleshooting</Text>
        <Text style={styles.subtitle}>
          Solutions for common connection issues in development
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offline vs Online Features</Text>
        
        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Zap size={24} color={Colors.light.success} />
            <Text style={styles.featureTitle}>Basic Enhancement (Works Offline)</Text>
          </View>
          <Text style={styles.featureDescription}>
            Basic enhancement features work without an internet connection:
          </Text>
          
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Fixing capitalization at the beginning of sentences</Text>
            <Text style={styles.bulletPoint}>• Correcting common spacing issues</Text>
            <Text style={styles.bulletPoint}>• Fixing common typos and abbreviations</Text>
            <Text style={styles.bulletPoint}>• Ensuring proper paragraph breaks</Text>
            <Text style={styles.bulletPoint}>• Basic punctuation fixes</Text>
          </View>
        </View>
        
        <View style={styles.featureCard}>
          <View style={styles.featureHeader}>
            <Brain size={24} color={Colors.light.error} />
            <Text style={styles.featureTitle}>Smart Enhancement (Requires Internet)</Text>
          </View>
          <Text style={styles.featureDescription}>
            These advanced features require an internet connection:
          </Text>
          
          <View style={styles.bulletPoints}>
            <Text style={styles.bulletPoint}>• Smart enhancement with AI</Text>
            <Text style={styles.bulletPoint}>• Number clarification</Text>
            <Text style={styles.bulletPoint}>• Completing missing words</Text>
            <Text style={styles.bulletPoint}>• Clarifying complex terminology</Text>
            <Text style={styles.bulletPoint}>• Context-aware corrections</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recommended AI Tools</Text>
        <Text style={styles.sectionDescription}>
          Free tools you can integrate for enhanced text processing:
        </Text>
        
        {aiTools.map((tool, index) => (
          <TouchableOpacity 
            key={index}
            style={styles.toolCard}
            onPress={() => openToolUrl(tool.url)}
          >
            <View style={styles.toolHeader}>
              <Text style={styles.toolName}>{tool.name}</Text>
              {tool.free && (
                <View style={styles.freeBadge}>
                  <Text style={styles.freeBadgeText}>Free</Text>
                </View>
              )}
            </View>
            <Text style={styles.toolDescription}>{tool.description}</Text>
            <View style={styles.toolLink}>
              <ExternalLink size={14} color={Colors.light.primary} />
              <Text style={styles.toolLinkText}>View Documentation</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Issues</Text>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Terminal size={24} color={Colors.light.primary} />
            <Text style={styles.cardTitle}>Expo Server Connection</Text>
          </View>
          <Text style={styles.cardDescription}>
            The most common issue is that your device cannot connect to the Expo development server.
            This happens when your device and computer are on different networks or when there are
            firewall restrictions.
          </Text>
          
          <View style={styles.solution}>
            <Text style={styles.solutionTitle}>Solution: Use Expo Tunnel</Text>
            <Text style={styles.solutionDescription}>
              The most reliable solution is to use Expo's tunnel feature:
            </Text>
            
            <View style={styles.codeBlock}>
              <Text style={styles.code}>npx expo start --tunnel</Text>
            </View>
            
            <Text style={styles.solutionDescription}>
              This creates a secure tunnel that works even if your device and computer are on different networks.
            </Text>
            
            <TouchableOpacity style={styles.linkButton} onPress={openExpoTunnelDocs}>
              <Text style={styles.linkButtonText}>Learn more about Expo Tunnel</Text>
              <ExternalLink size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Server size={24} color={Colors.light.primary} />
            <Text style={styles.cardTitle}>Network Configuration</Text>
          </View>
          <Text style={styles.cardDescription}>
            Your device and computer must be on the same network for direct connections to work.
            Corporate networks, VPNs, and certain WiFi configurations can block the necessary connections.
          </Text>
          
          <View style={styles.solution}>
            <Text style={styles.solutionTitle}>Solutions:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Make sure your device and computer are on the same WiFi network</Text>
              <Text style={styles.bulletPoint}>• Disable VPNs or proxies that might be active</Text>
              <Text style={styles.bulletPoint}>• Try using a personal hotspot instead of corporate WiFi</Text>
              <Text style={styles.bulletPoint}>• Check if your computer's firewall is blocking connections</Text>
              <Text style={styles.bulletPoint}>• Try connecting your device via USB and enable USB debugging</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Smartphone size={24} color={Colors.light.primary} />
            <Text style={styles.cardTitle}>Device-Specific Issues</Text>
          </View>
          <Text style={styles.cardDescription}>
            Different devices have different networking behaviors that can affect connectivity.
          </Text>
          
          <View style={styles.solution}>
            <Text style={styles.solutionTitle}>Android Solutions:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Enable "Developer Options" and "USB Debugging"</Text>
              <Text style={styles.bulletPoint}>• Try using the Android emulator instead of a physical device</Text>
              <Text style={styles.bulletPoint}>• For emulators, the server address is 10.0.2.2 instead of localhost</Text>
            </View>
            
            <Text style={[styles.solutionTitle, styles.marginTop]}>iOS Solutions:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Make sure your iOS device is not in Low Power Mode</Text>
              <Text style={styles.bulletPoint}>• Try using the iOS simulator instead of a physical device</Text>
              <Text style={styles.bulletPoint}>• Check if Screen Time or Content Restrictions are limiting connectivity</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Laptop size={24} color={Colors.light.primary} />
            <Text style={styles.cardTitle}>Development Environment</Text>
          </View>
          <Text style={styles.cardDescription}>
            Issues with your development environment can also cause connection problems.
          </Text>
          
          <View style={styles.solution}>
            <Text style={styles.solutionTitle}>Solutions:</Text>
            <View style={styles.bulletPoints}>
              <Text style={styles.bulletPoint}>• Restart the Expo development server</Text>
              <Text style={styles.bulletPoint}>• Clear the Metro bundler cache: npx expo start -c</Text>
              <Text style={styles.bulletPoint}>• Make sure you're using the latest version of Expo Go</Text>
              <Text style={styles.bulletPoint}>• Check if your project has any network configuration in app.json</Text>
              <Text style={styles.bulletPoint}>• Try using a different terminal or command prompt</Text>
            </View>
          </View>
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Commands</Text>
        
        <View style={styles.commandCard}>
          <Text style={styles.commandTitle}>Start with Tunnel (Recommended)</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>npx expo start --tunnel</Text>
          </View>
        </View>
        
        <View style={styles.commandCard}>
          <Text style={styles.commandTitle}>Clear Cache and Start</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>npx expo start -c</Text>
          </View>
        </View>
        
        <View style={styles.commandCard}>
          <Text style={styles.commandTitle}>Start with LAN URL</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>npx expo start --lan</Text>
          </View>
        </View>
        
        <View style={styles.commandCard}>
          <Text style={styles.commandTitle}>Start with Local URL Only</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.code}>npx expo start --localhost</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actions}>
        <Button 
          title="Back to App" 
          onPress={handleBack}
          icon={<ArrowLeft size={20} color="#FFFFFF" />}
          style={styles.backButton}
        />
        
        <Button 
          title="View Network Troubleshooting" 
          onPress={openNetworkTroubleshooting}
          variant="outline"
          icon={<ExternalLink size={20} color={Colors.light.primary} />}
          style={styles.docsButton}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginTop: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  sectionDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 16,
  },
  featureCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 8,
  },
  toolCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  freeBadge: {
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  freeBadgeText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: '500',
  },
  toolDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  toolLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolLinkText: {
    fontSize: 14,
    color: Colors.light.primary,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  solution: {
    marginTop: 16,
  },
  solutionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  solutionDescription: {
    fontSize: 14,
    color: Colors.light.text,
    lineHeight: 20,
  },
  codeBlock: {
    backgroundColor: Colors.light.codeBackground,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  code: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 14,
    color: Colors.light.code,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  linkButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    marginRight: 8,
  },
  marginTop: {
    marginTop: 16,
  },
  commandCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  commandTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginBottom: 8,
  },
  actions: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32,
  },
  backButton: {
    marginBottom: 12,
  },
  docsButton: {
    marginBottom: 12,
  },
});
