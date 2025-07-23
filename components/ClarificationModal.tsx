import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { X, Check, AlertCircle, Book, Sparkles, Type, FileText, Volume2 } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface ClarificationModalProps {
  visible: boolean;
  onClose: () => void;
  word: string;
  analysis: any;
  isLoading: boolean;
  onSelectSuggestion: (suggestion: string) => void;
}

type TabType = 'suggestions' | 'grammar' | 'examples' | 'technical';

export default function ClarificationModal({
  visible,
  onClose,
  word,
  analysis,
  isLoading,
  onSelectSuggestion,
}: ClarificationModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('suggestions');

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return Colors.light.success;
    if (confidence >= 50) return '#FFA500';
    return Colors.light.error;
  };

  const renderConfidenceIndicator = () => (
    <View style={styles.confidenceContainer}>
      <Text style={styles.confidenceLabel}>Confidence Level</Text>
      <View style={styles.confidenceBar}>
        <View
          style={[
            styles.confidenceFill,
            {
              width: `${analysis.confidence}%`,
              backgroundColor: getConfidenceColor(analysis.confidence),
            },
          ]}
        />
      </View>
      <Text
        style={[
          styles.confidenceValue,
          { color: getConfidenceColor(analysis.confidence) },
        ]}
      >
        {analysis.confidence}%
      </Text>
    </View>
  );

  const renderSuggestionsTab = () => (
    <View style={styles.tabContent}>
      {analysis.suggestions.map((suggestion: any, index: number) => (
        <View key={index} style={styles.suggestionCard}>
          <View style={styles.suggestionHeader}>
            <TouchableOpacity
              style={styles.suggestionButton}
              onPress={() => onSelectSuggestion(suggestion.word)}
            >
              <Text style={styles.suggestionWord}>{suggestion.word}</Text>
              <Check size={16} color={Colors.light.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.reasoning}>{suggestion.reasoning}</Text>
          <View style={styles.examplesList}>
            {suggestion.examples.map((example: string, i: number) => (
              <Text key={i} style={styles.exampleText}>
                • {example}
              </Text>
            ))}
          </View>
        </View>
      ))}
    </View>
  );

  const renderGrammarTab = () => (
    <View style={styles.tabContent}>
      <View style={styles.grammarCard}>
        <View style={styles.grammarHeader}>
          <Type size={20} color={Colors.light.primary} />
          <Text style={styles.grammarTitle}>Part of Speech</Text>
        </View>
        <Text style={styles.grammarText}>{analysis.grammar.partOfSpeech}</Text>
      </View>

      <View style={styles.grammarCard}>
        <View style={styles.grammarHeader}>
          <Book size={20} color={Colors.light.primary} />
          <Text style={styles.grammarTitle}>Usage</Text>
        </View>
        <Text style={styles.grammarText}>{analysis.grammar.usage}</Text>
      </View>

      <View style={styles.synonymsCard}>
        <Text style={styles.synonymsTitle}>Synonyms</Text>
        <View style={styles.synonymsContainer}>
          {analysis.synonyms.map((synonym: string, index: number) => (
            <TouchableOpacity
              key={index}
              style={styles.synonymChip}
              onPress={() => onSelectSuggestion(synonym)}
            >
              <Text style={styles.synonymText}>{synonym}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      {analysis.antonyms && analysis.antonyms.length > 0 && (
        <View style={styles.synonymsCard}>
          <Text style={styles.synonymsTitle}>Antonyms</Text>
          <View style={styles.synonymsContainer}>
            {analysis.antonyms.map((antonym: string, index: number) => (
              <View key={index} style={[styles.synonymChip, styles.antonymChip]}>
                <Text style={[styles.synonymText, styles.antonymText]}>{antonym}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );

  const renderExamplesTab = () => (
    <View style={styles.tabContent}>
      {analysis.suggestions.map((suggestion: any, index: number) => (
        <View key={index} style={styles.examplesCard}>
          <Text style={styles.examplesWord}>{suggestion.word}</Text>
          {suggestion.examples.map((example: string, i: number) => (
            <View key={i} style={styles.exampleItem}>
              <Text style={styles.exampleNumber}>{i + 1}.</Text>
              <Text style={styles.exampleText}>{example}</Text>
            </View>
          ))}
        </View>
      ))}
      
      {analysis.contextExamples && (
        <View style={styles.contextExamplesCard}>
          <Text style={styles.contextExamplesTitle}>In Similar Contexts</Text>
          {analysis.contextExamples.map((example: string, i: number) => (
            <Text key={i} style={styles.contextExampleText}>
              • {example}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
  
  const renderTechnicalTab = () => (
    <View style={styles.tabContent}>
      {analysis.technical && (
        <>
          <View style={styles.technicalCard}>
            <View style={styles.technicalHeader}>
              <FileText size={20} color={Colors.light.primary} />
              <Text style={styles.technicalTitle}>Technical Information</Text>
            </View>
            
            {analysis.technical.field && (
              <View style={styles.technicalField}>
                <Text style={styles.technicalFieldLabel}>Field:</Text>
                <Text style={styles.technicalFieldValue}>{analysis.technical.field}</Text>
              </View>
            )}
            
            <Text style={styles.technicalDescription}>
              {analysis.technical.description}
            </Text>
          </View>
          
          {analysis.technical.etymology && (
            <View style={styles.etymologyCard}>
              <Text style={styles.etymologyTitle}>Etymology</Text>
              <Text style={styles.etymologyText}>{analysis.technical.etymology}</Text>
            </View>
          )}
          
          {analysis.technical.pronunciation && (
            <View style={styles.pronunciationCard}>
              <View style={styles.pronunciationHeader}>
                <Volume2 size={20} color={Colors.light.primary} />
                <Text style={styles.pronunciationTitle}>Pronunciation</Text>
              </View>
              <Text style={styles.pronunciationText}>{analysis.technical.pronunciation}</Text>
            </View>
          )}
          
          {analysis.technical.relatedTerms && analysis.technical.relatedTerms.length > 0 && (
            <View style={styles.relatedTermsCard}>
              <Text style={styles.relatedTermsTitle}>Related Terms</Text>
              <View style={styles.relatedTermsContainer}>
                {analysis.technical.relatedTerms.map((term: string, index: number) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.relatedTermChip}
                    onPress={() => onSelectSuggestion(term)}
                  >
                    <Text style={styles.relatedTermText}>{term}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.title}>Word Analysis</Text>
              {analysis && analysis.confidence < 70 && (
                <AlertCircle size={20} color={Colors.light.error} />
              )}
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            <Text style={styles.wordText}>{word}</Text>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={Colors.light.primary} />
                <Text style={styles.loadingText}>Analyzing word...</Text>
              </View>
            ) : (
              <>
                {renderConfidenceIndicator()}

                <View style={styles.tabs}>
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === 'suggestions' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('suggestions')}
                  >
                    <Sparkles
                      size={16}
                      color={
                        activeTab === 'suggestions'
                          ? Colors.light.background
                          : Colors.light.primary
                      }
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'suggestions' && styles.activeTabText,
                      ]}
                    >
                      Suggestions
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === 'grammar' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('grammar')}
                  >
                    <Book
                      size={16}
                      color={
                        activeTab === 'grammar'
                          ? Colors.light.background
                          : Colors.light.primary
                      }
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'grammar' && styles.activeTabText,
                      ]}
                    >
                      Grammar
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === 'examples' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('examples')}
                  >
                    <Type
                      size={16}
                      color={
                        activeTab === 'examples'
                          ? Colors.light.background
                          : Colors.light.primary
                      }
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'examples' && styles.activeTabText,
                      ]}
                    >
                      Examples
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.tab,
                      activeTab === 'technical' && styles.activeTab,
                    ]}
                    onPress={() => setActiveTab('technical')}
                  >
                    <FileText
                      size={16}
                      color={
                        activeTab === 'technical'
                          ? Colors.light.background
                          : Colors.light.primary
                      }
                    />
                    <Text
                      style={[
                        styles.tabText,
                        activeTab === 'technical' && styles.activeTabText,
                      ]}
                    >
                      Technical
                    </Text>
                  </TouchableOpacity>
                </View>

                {activeTab === 'suggestions' && renderSuggestionsTab()}
                {activeTab === 'grammar' && renderGrammarTab()}
                {activeTab === 'examples' && renderExamplesTab()}
                {activeTab === 'technical' && renderTechnicalTab()}
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  wordText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.primary,
    textAlign: 'center',
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  confidenceContainer: {
    marginBottom: 24,
  },
  confidenceLabel: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
  },
  confidenceBar: {
    height: 8,
    backgroundColor: Colors.light.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    borderRadius: 4,
  },
  confidenceValue: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'right',
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 6,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  activeTab: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.light.background,
  },
  tabContent: {
    gap: 16,
  },
  suggestionCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  suggestionHeader: {
    marginBottom: 12,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  suggestionWord: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  reasoning: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  examplesList: {
    gap: 8,
  },
  exampleText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  grammarCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  grammarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  grammarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  grammarText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  synonymsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  synonymsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  synonymsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  synonymChip: {
    backgroundColor: Colors.light.primary + '10',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  synonymText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  antonymChip: {
    backgroundColor: Colors.light.error + '10',
    borderColor: Colors.light.error,
  },
  antonymText: {
    color: Colors.light.error,
  },
  examplesCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  examplesWord: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  exampleItem: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  exampleNumber: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '600',
  },
  contextExamplesCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  contextExamplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  contextExampleText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  technicalCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  technicalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  technicalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  technicalField: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  technicalFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
    marginRight: 4,
  },
  technicalFieldValue: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  technicalDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  etymologyCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  etymologyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  etymologyText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  pronunciationCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  pronunciationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pronunciationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  pronunciationText: {
    fontSize: 16,
    color: Colors.light.text,
    fontFamily: 'monospace',
    textAlign: 'center',
  },
  relatedTermsCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  relatedTermsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  relatedTermsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  relatedTermChip: {
    backgroundColor: Colors.light.primary + '10',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  relatedTermText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
});
