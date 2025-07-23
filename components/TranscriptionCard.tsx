import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Transcription } from '@/types';
import Colors from '@/constants/colors';
import { formatDistanceToNow } from '@/utils/date';
import { ChevronRight } from 'lucide-react-native';

interface TranscriptionCardProps {
  transcription: Transcription;
  onPress: (transcription: Transcription) => void;
}

export default function TranscriptionCard({ 
  transcription, 
  onPress 
}: TranscriptionCardProps) {
  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={() => onPress(transcription)}
      activeOpacity={0.7}
    >
      <Image 
        source={{ uri: transcription.imageUri }} 
        style={styles.image} 
        resizeMode="cover"
      />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {transcription.title}
        </Text>
        <Text style={styles.preview} numberOfLines={2}>
          {transcription.enhancedText}
        </Text>
        <Text style={styles.date}>
          {formatDistanceToNow(transcription.createdAt)}
        </Text>
      </View>
      <ChevronRight size={20} color={Colors.light.textSecondary} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: Colors.light.border,
  },
  content: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  preview: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: Colors.light.placeholder,
  },
});
