import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Modal, 
  SafeAreaView,
  ScrollView,
  Platform
} from 'react-native';
import { Search, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { searchWeb } from '@/utils/web';

interface TextWithSearchProps {
  text: string;
}

export default function TextWithSearch({ text }: TextWithSearchProps) {
  const [selectedText, setSelectedText] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [longPressTimeout, setLongPressTimeout] = useState<NodeJS.Timeout | null>(null);

  // Split text into words for better selection
  const words = text.split(/\s+/);

  const handleWordPress = (word: string) => {
    // Clean the word from punctuation
    const cleanWord = word.replace(/[.,;:!?()[\]{}""'']/g, '');
    setSelectedText(cleanWord);
    setModalVisible(true);
  };

  const handleWordLongPress = (word: string) => {
    // For mobile, we'll use long press to select words
    if (Platform.OS !== 'web') {
      const timeout = setTimeout(() => {
        const cleanWord = word.replace(/[.,;:!?()[\]{}""'']/g, '');
        setSelectedText(cleanWord);
        setModalVisible(true);
      }, 500); // 500ms long press
      
      setLongPressTimeout(timeout);
    }
  };

  const handleWordPressOut = () => {
    if (longPressTimeout) {
      clearTimeout(longPressTimeout);
      setLongPressTimeout(null);
    }
  };

  const handleSearch = () => {
    if (selectedText) {
      searchWeb(selectedText);
      setModalVisible(false);
    }
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  return (
    <View>
      <Text style={styles.instructions}>
        Tap on any word to search for it online
      </Text>
      
      <View style={styles.textContainer}>
        {words.map((word, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleWordPress(word)}
            onLongPress={() => handleWordLongPress(word)}
            onPressOut={handleWordPressOut}
            delayLongPress={500}
          >
            <Text style={styles.word}>
              {word}{index < words.length - 1 ? ' ' : ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Search Term</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              <Text style={styles.selectedText}>{selectedText}</Text>
              
              <View style={styles.searchOptions}>
                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={handleSearch}
                >
                  <Search size={20} color="#FFFFFF" />
                  <Text style={styles.searchButtonText}>Search on Google</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.modalDescription}>
                Use this feature to search for unclear terms, medicine names, or any word you want to verify or learn more about.
              </Text>
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
    color: Colors.light.text,
    lineHeight: 24,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 16,
  },
  selectedText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  searchOptions: {
    marginBottom: 24,
  },
  searchButton: {
    backgroundColor: Colors.light.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  modalDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
});
