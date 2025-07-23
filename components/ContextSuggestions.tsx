import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { Sparkles, BookOpen } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { clarifyText } from '@/utils/api';
import ClarificationModal from './ClarificationModal';
import SentenceClarificationModal from './SentenceClarificationModal';

interface ContextSuggestionsProps {
  text: string;
  onReplace: (newText: string) => void;
}

export default function ContextSuggestions({ text, onReplace }: ContextSuggestionsProps) {
  const [selectedWord, setSelectedWord] = useState('');
  const [selectedWordIndex, setSelectedWordIndex] = useState<number>(-1);
  const [selectedSentence, setSelectedSentence] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [sentenceAnalysis, setSentenceAnalysis] = useState<any>(null);
  const [wordModalVisible, setWordModalVisible] = useState(false);
  const [sentenceModalVisible, setSentenceModalVisible] = useState(false);
  const [selectionMode, setSelectionMode] = useState<'word' | 'sentence'>('word');
  const [error, setError] = useState<string | null>(null);

  // Split text into words and sentences
  const words = text.split(/\s+/);
  const sentences = text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);

  const handleWordPress = async (word: string, index: number) => {
    if (selectionMode !== 'word') return;
    
    setSelectedWord(word);
    setSelectedWordIndex(index);
    setWordModalVisible(true);
    setError(null);
    
    try {
      setIsLoading(true);
      
      // Get context window (5 words before and after)
      const startIndex = Math.max(0, index - 5);
      const endIndex = Math.min(words.length, index + 6);
      const context = words.slice(startIndex, endIndex).join(" ");
      
      const result = await clarifyText('', text, word, context);
      
      // Check if the result contains an error
      if (result && result.error) {
        setError(result.message || 'Failed to analyze the word. Please try again.');
        setAnalysis(null);
      } else {
        setAnalysis(result);
      }
      
    } catch (error) {
      console.error('Error analyzing word:', error);
      setError('Failed to analyze the word. Please try again.');
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSentencePress = async (sentence: string) => {
    if (selectionMode !== 'sentence') return;
    
    setSelectedSentence(sentence);
    setSentenceModalVisible(true);
    setError(null);
    
    try {
      setIsLoading(true);
      
      // Find surrounding context (previous and next sentence if available)
      const sentenceIndex = sentences.findIndex(s => s === sentence);
      let context = sentence;
      
      if (sentenceIndex > 0) {
        context = sentences[sentenceIndex - 1] + " " + context;
      }
      
      if (sentenceIndex < sentences.length - 1) {
        context = context + " " + sentences[sentenceIndex + 1];
      }
      
      // Call API to analyze the sentence
      const result = await clarifyText('', text, sentence, context, true);
      
      // Check if the result contains an error
      if (result && result.error) {
        setError(result.message || 'Failed to analyze the sentence. Please try again.');
        setSentenceAnalysis(null);
      } else {
        setSentenceAnalysis(result);
      }
      
    } catch (error) {
      console.error('Error analyzing sentence:', error);
      setError('Failed to analyze the sentence. Please try again.');
      setSentenceAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectWordSuggestion = (suggestion: string) => {
    if (selectedWordIndex >= 0) {
      const newWords = [...words];
      newWords[selectedWordIndex] = suggestion;
      onReplace(newWords.join(" "));
      setWordModalVisible(false);
    }
  };

  const handleSelectSentenceReplacement = (replacement: string) => {
    // Replace the entire sentence in the text
    const newSentences = [...sentences];
    const sentenceIndex = sentences.findIndex(s => s === selectedSentence);
    
    if (sentenceIndex >= 0) {
      newSentences[sentenceIndex] = replacement;
      onReplace(newSentences.join(" "));
      setSentenceModalVisible(false);
    }
  };

  const toggleSelectionMode = () => {
    setSelectionMode(prev => prev === 'word' ? 'sentence' : 'word');
  };

  // Function to calculate complexity score for words
  const getWordComplexity = (word: string): number => {
    // Simple algorithm: longer words and words with uncommon characters are more complex
    const cleanWord = word.replace(/[.,;:!?()[\]{}""'']/g, '').toLowerCase();
    
    // Base score based on length
    let score = Math.min(cleanWord.length / 2, 5); // Max 5 points for length
    
    // Add points for uncommon characters
    if (/[xjqz]/.test(cleanWord)) score += 1;
    
    // Add points for complex patterns
    if (/ph|th|ch|sh|wh/.test(cleanWord)) score += 0.5;
    if (/[aeiou]{3,}/.test(cleanWord)) score += 1; // Many vowels together
    if (/[bcdfghjklmnpqrstvwxyz]{4,}/.test(cleanWord)) score += 1.5; // Many consonants together
    
    return Math.min(Math.round(score * 10) / 10, 10); // Return score from 0-10, rounded to 1 decimal
  };

  // Function to get color based on complexity
  const getComplexityColor = (complexity: number): string => {
    if (complexity < 3) return Colors.light.text; // Normal
    if (complexity < 5) return '#1E88E5'; // Medium - blue
    if (complexity < 7) return '#FFA000'; // High - amber
    return '#E53935'; // Very high - red
  };

  // Function to render words with complexity highlighting
  const renderWords = () => {
    return words.map((word: string, index: number) => {
      const complexity = getWordComplexity(word);
      const color = getComplexityColor(complexity);
      
      return (
        <TouchableOpacity
          key={index}
          onPress={() => handleWordPress(word, index)}
          disabled={selectionMode !== 'word'}
        >
          <Text 
            style={[
              styles.word, 
              { color },
              complexity >= 5 && styles.complexWord
            ]}
          >
            {word}{index < words.length - 1 ? ' ' : ''}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  // Function to render sentences
  const renderSentences = () => {
    return sentences.map((sentence: string, index: number) => (
      <TouchableOpacity
        key={index}
        onPress={() => handleSentencePress(sentence)}
        disabled={selectionMode !== 'sentence'}
        style={styles.sentenceContainer}
      >
        <Text style={styles.sentence}>{sentence}</Text>
      </TouchableOpacity>
    ));
  };

  return (
    <View>
      <View style={styles.modeToggleContainer}>
        <TouchableOpacity 
          style={[
            styles.modeToggleButton, 
            selectionMode === 'word' && styles.activeToggleButton
          ]}
          onPress={() => setSelectionMode('word')}
        >
          <Sparkles 
            size={16} 
            color={selectionMode === 'word' ? Colors.light.background : Colors.light.primary} 
          />
          <Text 
            style={[
              styles.modeToggleText,
              selectionMode === 'word' && styles.activeToggleText
            ]}
          >
            Word Mode
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.modeToggleButton, 
            selectionMode === 'sentence' && styles.activeToggleButton
          ]}
          onPress={() => setSelectionMode('sentence')}
        >
          <BookOpen 
            size={16} 
            color={selectionMode === 'sentence' ? Colors.light.background : Colors.light.primary} 
          />
          <Text 
            style={[
              styles.modeToggleText,
              selectionMode === 'sentence' && styles.activeToggleText
            ]}
          >
            Sentence Mode
          </Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.instructions}>
        {selectionMode === 'word' 
          ? 'Tap on any word for detailed analysis and suggestions. Words are color-coded by complexity.' 
          : 'Tap on any sentence to clarify its meaning or structure.'}
      </Text>
      
      <View style={styles.textContainer}>
        {selectionMode === 'word' ? renderWords() : renderSentences()}
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <ClarificationModal
        visible={wordModalVisible}
        onClose={() => setWordModalVisible(false)}
        word={selectedWord}
        analysis={analysis}
        isLoading={isLoading}
        onSelectSuggestion={handleSelectWordSuggestion}
      />
      
      <SentenceClarificationModal
        visible={sentenceModalVisible}
        onClose={() => setSentenceModalVisible(false)}
        sentence={selectedSentence}
        analysis={sentenceAnalysis}
        isLoading={isLoading}
        onSelectReplacement={handleSelectSentenceReplacement}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  modeToggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  modeToggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    gap: 6,
  },
  activeToggleButton: {
    backgroundColor: Colors.light.primary,
  },
  modeToggleText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.primary,
  },
  activeToggleText: {
    color: Colors.light.background,
  },
  instructions: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  word: {
    fontSize: 16,
    lineHeight: 24,
  },
  complexWord: {
    fontWeight: '500',
  },
  sentenceContainer: {
    marginBottom: 12,
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  sentence: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  errorContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: Colors.light.errorBackground,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
  },
});
