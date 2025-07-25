import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, TouchableOpacity, ScrollView, Image, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Cloud, Calendar, CheckSquare, FileText, ExternalLink } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useIntegrationStore } from '@/store/integration-store';
import Button from '@/components/Button';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  isConnected: boolean;
  isPremium?: boolean;
}

export default function IntegrationsScreen() {
  const router = useRouter();
  const { connectedIntegrations, connectIntegration, disconnectIntegration } = useIntegrationStore();
  
  const integrations: Integration[] = [
    {
      id: 'google-drive',
      name: 'Google Drive',
      description: 'Sync and backup your transcriptions to Google Drive',
      icon: <Cloud size={24} color={Colors.light.primary} />,
      isConnected: connectedIntegrations.includes('google-drive'),
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      description: 'Save transcriptions to your Dropbox account',
      icon: <Cloud size={24} color={Colors.light.primary} />,
      isConnected: connectedIntegrations.includes('dropbox'),
    },
    {
      id: 'google-calendar',
      name: 'Google Calendar',
      description: 'Create calendar events from your transcriptions',
      icon: <Calendar size={24} color={Colors.light.primary} />,
      isConnected: connectedIntegrations.includes('google-calendar'),
    },
    {
      id: 'todoist',
      name: 'Todoist',
      description: 'Extract tasks from transcriptions to Todoist',
      icon: <CheckSquare size={24} color={Colors.light.primary} />,
      isConnected: connectedIntegrations.includes('todoist'),
      isPremium: true,
    },
    {
      id: 'notion',
      name: 'Notion',
      description: 'Send transcriptions to your Notion workspace',
      icon: <FileText size={24} color={Colors.light.primary} />,
      isConnected: connectedIntegrations.includes('notion'),
      isPremium: true,
    },
  ];

  const handleToggleIntegration = (id: string, isCurrentlyConnected: boolean) => {
    if (isCurrentlyConnected) {
      Alert.alert(
        'Disconnect Integration',
        `Are you sure you want to disconnect ${integrations.find(i => i.id === id)?.name}?`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disconnect',
            style: 'destructive',
            onPress: () => disconnectIntegration(id),
          },
        ]
      );
    } else {
      // Check if premium
      const integration = integrations.find(i => i.id === id);
      if (integration?.isPremium) {
        Alert.alert(
          'Premium Feature',
          'This integration requires a premium subscription.',
          [
            {
              text: 'Cancel',
              style: 'cancel',
            },
            {
              text: 'Upgrade',
              onPress: () => {
                // In a real app, this would navigate to a subscription screen
                Alert.alert('Subscription', 'This would navigate to subscription options');
              },
            },
          ]
        );
        return;
      }
      
      // Mock connection flow
      Alert.alert(
        'Connect Integration',
        `You'll be redirected to authorize ${integration?.name}`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Continue',
            onPress: () => {
              // In a real app, this would open OAuth flow
              setTimeout(() => {
                connectIntegration(id);
                Alert.alert('Success', `Connected to ${integration?.name}`);
              }, 1000);
            },
          },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Integrations</Text>
        <Text style={styles.subtitle}>
          Connect your favorite apps to enhance your transcription workflow
        </Text>
        
        <View style={styles.integrationsContainer}>
          {integrations.map((integration) => (
            <View key={integration.id} style={styles.integrationCard}>
              <View style={styles.integrationHeader}>
                <View style={styles.integrationIconContainer}>
                  {integration.icon}
                </View>
                <View style={styles.integrationInfo}>
                  <View style={styles.integrationNameContainer}>
                    <Text style={styles.integrationName}>{integration.name}</Text>
                    {integration.isPremium && (
                      <View style={styles.premiumBadge}>
                        <Text style={styles.premiumBadgeText}>Premium</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.integrationDescription}>
                    {integration.description}
                  </Text>
                </View>
                <Switch
                  value={integration.isConnected}
                  onValueChange={() => handleToggleIntegration(integration.id, integration.isConnected)}
                  trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                  thumbColor="#FFFFFF"
                  disabled={integration.isPremium && !integration.isConnected}
                />
              </View>
              
              {integration.isConnected && (
                <View style={styles.integrationSettings}>
                  <Text style={styles.settingsTitle}>Settings</Text>
                  
                  <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingName}>Auto-sync</Text>
                    <Switch
                      value={true}
                      onValueChange={() => {}}
                      trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                      thumbColor="#FFFFFF"
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingName}>Sync frequency</Text>
                    <View style={styles.settingValue}>
                      <Text style={styles.settingValueText}>Daily</Text>
                      <ExternalLink size={16} color={Colors.light.textSecondary} />
                    </View>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.settingItem}>
                    <Text style={styles.settingName}>Folder location</Text>
                    <View style={styles.settingValue}>
                      <Text style={styles.settingValueText}>Handwrite AI</Text>
                      <ExternalLink size={16} color={Colors.light.textSecondary} />
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
        
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Integrations</Text>
          <Text style={styles.infoText}>
            Integrations allow you to connect Handwrite AI with other apps and services to enhance your workflow. Connect to cloud storage for automatic backups, create calendar events from your notes, or extract tasks to your favorite task manager.
          </Text>
          <Text style={styles.infoText}>
            Premium integrations require a subscription. Upgrade to access all integrations and premium features.
          </Text>
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
  integrationsContainer: {
    marginBottom: 24,
  },
  integrationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  integrationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  integrationIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  integrationInfo: {
    flex: 1,
  },
  integrationNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  integrationName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 8,
  },
  premiumBadge: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: Colors.light.secondary + '20',
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.secondary,
  },
  integrationDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  integrationSettings: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  settingsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingName: {
    fontSize: 14,
    color: Colors.light.text,
  },
  settingValue: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValueText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginRight: 4,
  },
  infoCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 24,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
});
