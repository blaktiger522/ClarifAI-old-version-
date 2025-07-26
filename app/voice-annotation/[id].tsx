import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Mic, MicOff, Play, Pause, Trash2, Save } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import Button from '@/components/Button';
import { useVoiceAnnotationStore } from '@/store/voice-annotation-store';

export default function VoiceAnnotationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transcriptions } = useTranscriptionStore();
  const { getAnnotations, addAnnotation, removeAnnotation } = useVoiceAnnotationStore();
  
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<any[]>([]);
  
  const transcription = transcriptions.find(t => t.id === id);

  useEffect(() => {
    if (id) {
      setAnnotations(getAnnotations(id));
    }
  }, [id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

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

  const handleStartRecording = () => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Voice recording is not available on web');
      return;
    }
    
    // In a real app, this would use expo-av to record audio
    setIsRecording(true);
    
    // Mock recording start
    console.log('Recording started');
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    
    setIsRecording(false);
    
    // Mock recording stop and save
    const newAnnotation = {
      id: Date.now().toString(),
      duration: recordingTime,
      timestamp: Date.now(),
      transcription: 'This is a mock voice transcription.',
    };
    
    // Add to store
    addAnnotation(id || '', newAnnotation);
    
    // Update local state
    setAnnotations([...annotations, newAnnotation]);
    
    console.log('Recording stopped and saved');
  };

  const handlePlayPause = (annotationId: string) => {
    if (playingId === annotationId) {
      // Stop playing
      setPlayingId(null);
    } else {
      // Start playing
      setPlayingId(annotationId);
      
      // Mock playback duration
      setTimeout(() => {
        setPlayingId(null);
      }, 3000);
    }
  };

  const handleDelete = (annotationId: string) => {
    Alert.alert(
      'Delete Annotation',
      'Are you sure you want to delete this voice annotation?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeAnnotation(id || '', annotationId);
            setAnnotations(annotations.filter(a => a.id !== annotationId));
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Annotations</Text>
        <Text style={styles.subtitle}>{transcription.title}</Text>
      </View>
      
      <View style={styles.recordingContainer}>
        <View style={styles.recordingInfo}>
          <Text style={styles.recordingTitle}>
            {isRecording ? 'Recording...' : 'Add Voice Annotation'}
          </Text>
          {isRecording && (
            <Text style={styles.recordingTime}>{formatTime(recordingTime)}</Text>
          )}
        </View>
        
        <TouchableOpacity
          style={[
            styles.recordButton,
            isRecording && styles.recordingActive,
          ]}
          onPress={isRecording ? handleStopRecording : handleStartRecording}
        >
          {isRecording ? (
            <MicOff size={24} color="#FFFFFF" />
          ) : (
            <Mic size={24} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>
      
      <View style={styles.annotationsContainer}>
        <Text style={styles.sectionTitle}>Saved Annotations</Text>
        
        {annotations.length > 0 ? (
          <FlatList
            data={annotations}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.annotationItem}>
                <View style={styles.annotationInfo}>
                  <Text style={styles.annotationDate}>
                    {formatDate(item.timestamp)}
                  </Text>
                  <Text style={styles.annotationDuration}>
                    {formatTime(item.duration)}
                  </Text>
                </View>
                
                <Text style={styles.annotationText}>
                  {item.transcription}
                </Text>
                
                <View style={styles.annotationActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handlePlayPause(item.id)}
                  >
                    {playingId === item.id ? (
                      <Pause size={20} color={Colors.light.primary} />
                    ) : (
                      <Play size={20} color={Colors.light.primary} />
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(item.id)}
                  >
                    <Trash2 size={20} color={Colors.light.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            style={styles.annotationsList}
          />
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No voice annotations yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap the microphone button to add a voice note
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.footer}>
        <Button
          title="Save & Return"
          onPress={() => router.back()}
          icon={<Save size={20} color="#FFFFFF" />}
        />
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
  recordingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    margin: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  recordingInfo: {
    flex: 1,
  },
  recordingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  recordingTime: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.primary,
  },
  recordButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingActive: {
    backgroundColor: Colors.light.error,
  },
  annotationsContainer: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  annotationsList: {
    flex: 1,
  },
  annotationItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  annotationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  annotationDate: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  annotationDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  annotationText: {
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 12,
    lineHeight: 22,
  },
  annotationActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
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
