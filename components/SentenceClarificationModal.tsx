import React, { useState } from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { X, Check, AlertCircle, Sparkles } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

interface SentenceClarificationModalProps {
  isVisible: boolean;
  onClose: () => void;
  sentence: string;
  clarification: {
    original: string;
    clarified: string;
    explanation: string;
  } | null;
  isLoading: boolean;
  onAccept: (clarifiedSentence: string) => void;
  error: string | null;
}

const SentenceClarificationModal: React.FC<SentenceClarificationModalProps> = ({
  isVisible,
  onClose,
  sentence,
  clarification,
  isLoading,
  onAccept,
  error
}) => {
  const [showExplanation, setShowExplanation] = useState(true);

  const handleAccept = () => {
    if (clarification) {
      onAccept(clarification.clarified);
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sentence Clarification</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Analyzing sentence...</Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <AlertCircle size={24} color={Colors.light.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : clarification ? (
              <>
                <View style={styles.sentenceContainer}>
                  <Text style={styles.sectionTitle}>Original</Text>
                  <View style={styles.sentenceBox}>
                    <Text style={styles.sentenceText}>{clarification.original}</Text>
                  </View>
                </View>

                <View style={styles.sentenceContainer}>
                  <Text style={styles.sectionTitle}>Clarified</Text>
                  <View style={[styles.sentenceBox, styles.clarifiedBox]}>
                    <Text style={styles.clarifiedText}>{clarification.clarified}</Text>
                  </View>
                </View>

                {showExplanation && clarification.explanation && (
                  <View style={styles.explanationContainer}>
                    <Text style={styles.sectionTitle}>Explanation</Text>
                    <View style={styles.explanationBox}>
                      <Text style={styles.explanationText}>{clarification.explanation}</Text>
                    </View>
                  </View>
                )}

                <View style={styles.toggleContainer}>
                  <TouchableOpacity 
                    onPress={() => setShowExplanation(!showExplanation)}
                    style={styles.toggleButton}
                  >
                    <Text style={styles.toggleText}>
                      {showExplanation ? 'Hide Explanation' : 'Show Explanation'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No clarification available</Text>
              </View>
            )}
          </ScrollView>

          {!isLoading && !error && clarification && (
            <View style={styles.modalFooter}>
              <Button
                title="Keep Original"
                onPress={onClose}
                variant="outline"
                style={styles.footerButton}
              />
              <Button
                title="Accept Clarification"
                onPress={handleAccept}
                icon={<Check size={20} color="#FFFFFF" />}
                style={styles.footerButton}
              />
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
    fontWeight: 'bold',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    padding: 16,
    maxHeight: '70%',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  errorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  errorText: {
    fontSize: 16,
    color: Colors.light.error,
    textAlign: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  sentenceContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  sentenceBox: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  clarifiedBox: {
    backgroundColor: Colors.light.primary + '10',
    borderColor: Colors.light.primary + '30',
  },
  sentenceText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
  },
  clarifiedText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 22,
    fontWeight: '500',
  },
  explanationContainer: {
    marginBottom: 16,
  },
  explanationBox: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  explanationText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  toggleContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    padding: 8,
  },
  toggleText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
});

export default SentenceClarificationModal;
