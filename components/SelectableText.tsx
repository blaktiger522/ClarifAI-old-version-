import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView
} from 'react-native';
import Colors from '@/constants/colors';

interface SelectableTextProps {
  text: string;
  onSelectionChange: (selectedSentences: string[]) => void;
}

export default function SelectableText({ text, onSelectionChange }: SelectableTextProps) {
  // More robust sentence splitting
  const sentences = React.useMemo(() => {
    return text
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }, [text]);

  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const toggleSelection = useCallback((index: number) => {
    setSelectedIndices(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(index)) {
        newSelection.delete(index);
      } else {
        newSelection.add(index);
      }
      
      // Use the callback to ensure we're working with fresh data
      setTimeout(() => {
        onSelectionChange(Array.from(newSelection).map(i => sentences[i]));
      }, 0);
      
      return newSelection;
    });
  }, [sentences, onSelectionChange]);

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>
        Tap on sentences to select them for clarification
      </Text>
      
      <ScrollView 
        style={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        {sentences.map((sentence, index) => (
          <TouchableOpacity
            key={`sentence-${index}`}
            onPress={() => toggleSelection(index)}
            activeOpacity={0.7}
            style={[
              styles.sentenceContainer,
              selectedIndices.has(index) && styles.selectedSentence
            ]}
          >
            <Text style={[
              styles.sentenceText,
              selectedIndices.has(index) && styles.selectedText
            ]}>
              {sentence}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  instructions: {
    fontSize: 16,
    marginBottom: 16,
    color: '#555',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  sentenceContainer: {
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectedSentence: {
    backgroundColor: Colors.light.primary + '20', // 20% opacity
    borderColor: Colors.light.primary,
  },
  sentenceText: {
    fontSize: 16,
    lineHeight: 24,
  },
  selectedText: {
    color: Colors.light.primary,
    fontWeight: '500',
  }
});
