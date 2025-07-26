import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Users, UserPlus, Trash2, Edit2, Clock, MessageSquare } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import { useCollaborationStore } from '@/store/collaboration-store';
import Button from '@/components/Button';

interface Collaborator {
  email: string;
  role: 'viewer' | 'editor';
  lastActive?: string;
}

interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: number;
}

export default function CollaborateScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transcriptions } = useTranscriptionStore();
  const { getCollaborators, removeCollaborator, updateCollaboratorRole } = useCollaborationStore();
  
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  
  const transcription = transcriptions.find(t => t.id === id);

  useEffect(() => {
    if (id) {
      // Get collaborators from store
      const emails = getCollaborators(id);
      
      // Convert to collaborator objects with mock data
      const collaboratorData = emails.map(email => ({
        email,
        role: Math.random() > 0.5 ? 'editor' as const : 'viewer' as const,
        lastActive: `${Math.floor(Math.random() * 24)} hours ago`,
      }));
      
      setCollaborators(collaboratorData);
      
      // Mock comments
      const mockComments = [
        {
          id: '1',
          user: 'john@example.com',
          text: 'I fixed the formatting in paragraph 2.',
          timestamp: Date.now() - 3600000,
        },
        {
          id: '2',
          user: 'sarah@example.com',
          text: 'The numbers in the third section need verification.',
          timestamp: Date.now() - 7200000,
        },
      ];
      
      setComments(mockComments);
    }
  }, [id]);

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

  const handleRemoveCollaborator = (email: string) => {
    Alert.alert(
      'Remove Collaborator',
      `Are you sure you want to remove ${email}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            removeCollaborator(id || '', email);
            setCollaborators(collaborators.filter(c => c.email !== email));
          },
        },
      ]
    );
  };

  const handleChangeRole = (email: string, currentRole: 'viewer' | 'editor') => {
    const newRole = currentRole === 'viewer' ? 'editor' : 'viewer';
    
    updateCollaboratorRole(id || '', email, newRole);
    
    setCollaborators(collaborators.map(c => 
      c.email === email ? { ...c, role: newRole } : c
    ));
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now().toString(),
        user: 'you@example.com',
        text: newComment,
        timestamp: Date.now(),
      };
      
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const formatTimestamp = (timestamp: number) => {
    const now = Date.now();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day ago`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Collaboration</Text>
        <Text style={styles.subtitle}>{transcription.title}</Text>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Users size={20} color={Colors.light.primary} />
          <Text style={styles.sectionTitle}>Collaborators</Text>
        </View>
        
        {collaborators.length > 0 ? (
          <FlatList
            data={collaborators}
            keyExtractor={(item) => item.email}
            renderItem={({ item }) => (
              <View style={styles.collaboratorItem}>
                <View style={styles.collaboratorInfo}>
                  <Text style={styles.collaboratorEmail}>{item.email}</Text>
                  <View style={styles.collaboratorDetails}>
                    <View style={styles.roleContainer}>
                      <Text style={[
                        styles.roleText,
                        item.role === 'editor' ? styles.editorRole : styles.viewerRole
                      ]}>
                        {item.role === 'editor' ? 'Editor' : 'Viewer'}
                      </Text>
                    </View>
                    
                    {item.lastActive && (
                      <View style={styles.lastActiveContainer}>
                        <Clock size={12} color={Colors.light.textSecondary} />
                        <Text style={styles.lastActiveText}>{item.lastActive}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                <View style={styles.collaboratorActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleChangeRole(item.email, item.role)}
                  >
                    <Edit2 size={18} color={Colors.light.primary} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRemoveCollaborator(item.email)}
                  >
                    <Trash2 size={18} color={Colors.light.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            style={styles.collaboratorsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No collaborators yet</Text>
          </View>
        )}
        
        <Button
          title="Invite Collaborators"
          onPress={() => router.push(`/transcription/share/${id}`)}
          icon={<UserPlus size={20} color="#FFFFFF" />}
          style={styles.inviteButton}
        />
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MessageSquare size={20} color={Colors.light.primary} />
          <Text style={styles.sectionTitle}>Comments</Text>
        </View>
        
        {comments.length > 0 ? (
          <FlatList
            data={comments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{item.user}</Text>
                  <Text style={styles.commentTime}>{formatTimestamp(item.timestamp)}</Text>
                </View>
                <Text style={styles.commentText}>{item.text}</Text>
              </View>
            )}
            style={styles.commentsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No comments yet</Text>
          </View>
        )}
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginLeft: 8,
  },
  collaboratorsList: {
    maxHeight: 300,
  },
  collaboratorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  collaboratorInfo: {
    flex: 1,
  },
  collaboratorEmail: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 4,
  },
  collaboratorDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleContainer: {
    marginRight: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  editorRole: {
    backgroundColor: Colors.light.primary + '20',
    color: Colors.light.primary,
  },
  viewerRole: {
    backgroundColor: Colors.light.textSecondary + '20',
    color: Colors.light.textSecondary,
  },
  lastActiveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastActiveText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    marginLeft: 4,
  },
  collaboratorActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  inviteButton: {
    margin: 16,
  },
  commentsList: {
    maxHeight: 300,
  },
  commentItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  commentTime: {
    fontSize: 12,
    color: Colors.light.textSecondary,
  },
  commentText: {
    fontSize: 14,
    color: Colors.light.text,
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
