import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, ScrollView, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Share2, Users, Lock, Globe, Copy, Mail } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import Button from '@/components/Button';
import { useCollaborationStore } from '@/store/collaboration-store';

export default function ShareTranscriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transcriptions } = useTranscriptionStore();
  const { shareTranscription, getCollaborators } = useCollaborationStore();
  
  const [email, setEmail] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [allowEditing, setAllowEditing] = useState(false);
  const [shareLink, setShareLink] = useState('');
  
  const transcription = transcriptions.find(t => t.id === id);
  const collaborators = getCollaborators(id || '');

  if (!transcription) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Transcription not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    );
  }

  const handleShare = () => {
    if (email && !email.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address');
      return;
    }

    // Generate a mock share link
    const mockShareLink = `https://handwrite.ai/share/${transcription.id}`;
    setShareLink(mockShareLink);

    if (email) {
      // In a real app, this would send an email invitation
      Alert.alert(
        'Invitation Sent',
        `An invitation has been sent to ${email}`,
        [{ text: 'OK' }]
      );
      setEmail('');
    }

    // Update collaboration status in store
    shareTranscription(transcription.id, {
      isPublic,
      allowEditing,
      sharedWith: email ? [...collaborators, email] : collaborators
    });
  };

  const handleCopyLink = () => {
    if (!shareLink) {
      const newShareLink = `https://handwrite.ai/share/${transcription.id}`;
      setShareLink(newShareLink);
    }
    
    // In a real app, this would copy to clipboard
    Alert.alert('Link Copied', 'Share link copied to clipboard');
  };

  const handleCollaborate = () => {
    router.push(`/transcription/collaborate/${transcription.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Share "{transcription.title}"</Text>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Share2 size={24} color={Colors.light.primary} />
            <Text style={styles.cardTitle}>Share Options</Text>
          </View>
          
          <View style={styles.setting}>
            <View style={styles.settingHeader}>
              <Globe size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Public Access</Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                Anyone with the link can view
              </Text>
              <Switch
                value={isPublic}
                onValueChange={setIsPublic}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
          
          <View style={styles.setting}>
            <View style={styles.settingHeader}>
              <Lock size={20} color={Colors.light.text} />
              <Text style={styles.settingLabel}>Edit Permissions</Text>
            </View>
            <View style={styles.switchContainer}>
              <Text style={styles.switchLabel}>
                Allow others to edit
              </Text>
              <Switch
                value={allowEditing}
                onValueChange={setAllowEditing}
                trackColor={{ false: Colors.light.border, true: Colors.light.primary }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View>
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Mail size={24} color={Colors.light.primary} />
            <Text style={styles.cardTitle}>Invite by Email</Text>
          </View>
          
          <TextInput
            style={styles.emailInput}
            value={email}
            onChangeText={setEmail}
            placeholder="Enter email address"
            placeholderTextColor={Colors.light.placeholder}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          
          <Button
            title="Send Invitation"
            onPress={handleShare}
            style={styles.button}
          />
        </View>
        
        {shareLink ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Copy size={24} color={Colors.light.primary} />
              <Text style={styles.cardTitle}>Share Link</Text>
            </View>
            
            <View style={styles.linkContainer}>
              <Text style={styles.link} numberOfLines={1}>
                {shareLink}
              </Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyLink}
              >
                <Copy size={20} color={Colors.light.primary} />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
        
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Users size={24} color={Colors.light.primary} />
            <Text style={styles.cardTitle}>Collaboration</Text>
          </View>
          
          <Text style={styles.collaborationText}>
            Enable real-time collaboration to work together with others on this transcription.
          </Text>
          
          <Button
            title="Manage Collaborators"
            onPress={handleCollaborate}
            variant="outline"
            style={styles.button}
          />
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
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 12,
  },
  setting: {
    marginBottom: 16,
  },
  settingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.light.text,
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 28,
  },
  switchLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  emailInput: {
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  button: {
    marginTop: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  link: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.primary,
  },
  copyButton: {
    padding: 4,
  },
  collaborationText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
});
