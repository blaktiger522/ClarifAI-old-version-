import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, KeyboardAvoidingView, Platform, Alert, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Save } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import Button from '@/components/Button';

export default function EditTranscriptionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transcriptions, updateTranscription } = useTranscriptionStore();
  
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  
  const transcription = transcriptions.find(t => t.id === id);
  
  useEffect(() => {
    if (transcription) {
      setTitle(transcription.title);
      setText(transcription.enhancedText);
    } else {
      Alert.alert('Error', 'Transcription not found');
      router.back();
    }
  }, [transcription]);

  const handleSave = () => {
    if (!transcription) return;
    
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }
    
    updateTranscription(transcription.id, {
      title,
      enhancedText: text,
    });
    
    router.back();
  };

  if (!transcription) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter a title"
              placeholderTextColor={Colors.light.placeholder}
            />

            <Text style={styles.label}>Transcription</Text>
            <View style={styles.textAreaContainer}>
              <TextInput
                style={styles.textArea}
                value={text}
                onChangeText={setText}
                placeholder="Enter transcription text"
                placeholderTextColor={Colors.light.placeholder}
                multiline
                textAlignVertical="top"
              />
            </View>

            <Button
              title="Save Changes"
              onPress={handleSave}
              icon={<Save size={20} color="#FFFFFF" />}
              style={styles.saveButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    flexGrow: 1,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  textAreaContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 24,
    flex: 1,
    minHeight: 200,
  },
  textArea: {
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    flex: 1,
  },
  saveButton: {
    marginBottom: 24,
  },
});
