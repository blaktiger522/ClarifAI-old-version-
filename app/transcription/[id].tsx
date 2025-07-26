import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Share, Alert, TouchableOpacity, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Edit, Share2, Trash2, Calculator, Sparkles, Search, MessageSquareText, Mic, GitBranch, BookOpen, Users, FileText, Zap, Wifi, WifiOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import Button from '@/components/Button';
import { formatDate } from '@/utils/date';
import { clarifyNumbers, smartEnhance, completeText, clarifyComplexWords, checkNetworkConnectivity, performOfflineBasicEnhance } from '@/utils/api';
import TextWithSearch from '@/components/TextWithSearch';
import ContextSuggestions from '@/components/ContextSuggestions';
import { useVoiceAnnotationStore } from '@/store/voice-annotation-store';
import { useCollaborationStore } from '@/store/collaboration-store';

export default function TranscriptionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transcriptions, removeTranscription, updateTranscription } = useTranscriptionStore();
  const { getAnnotations } = useVoiceAnnotationStore();
  const { isTranscriptionShared } = useCollaborationStore();
  
  const [isClarifyingNumbers, setIsClarifyingNumbers] = useState(false);
  const [isSmartEnhancing, setIsSmartEnhancing] = useState(false);
  const [isCompletingText, setIsCompletingText] = useState(false);
  const [isClarifyingComplexWords, setIsClarifyingComplexWords] = useState(false);
  const [isBasicEnhancing, setIsBasicEnhancing] = useState(false);
  const [viewMode, setViewMode] = useState<'normal' | 'search' | 'suggestions'>('normal');
  const [isConnected, setIsConnected] = useState(true);
  
  const transcription = transcriptions.find(t => t.id === id);
  const voiceAnnotations = getAnnotations(id || '');
  const isShared = isTranscriptionShared(id || '');

  // Check connectivity when component mounts
  React.useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkNetworkConnectivity();
      setIsConnected(connected);
    };
    
    checkConnection();
  }, []);

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: transcription.enhancedText,
        title: transcription.title,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Transcription',
      'Are you sure you want to delete this transcription?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            removeTranscription(transcription.id);
            router.replace('/history');
          },
        },
      ],
    );
  };

  const handleEdit = () => {
    router.push(`/transcription/edit/${transcription.id}`);
  };

  const handleBasicEnhance = async () => {
    if (isBasicEnhancing) return;

    try {
      setIsBasicEnhancing(true);

      // Basic enhancement works offline
      const result = performOfflineBasicEnhance(transcription.enhancedText);
      
      // Show a comparison dialog to let the user choose
      Alert.alert(
        'Basic Enhancement',
        'Review the basic enhancements (spelling, grammar, formatting):',
        [
          {
            text: 'Keep Original',
            style: 'cancel',
          },
          {
            text: 'Accept Changes',
            onPress: () => {
              updateTranscription(transcription.id, {
                enhancedText: result
              });
            },
          },
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('Error in basic enhancement:', error);
      Alert.alert(
        'Processing Error',
        'There was an error enhancing the text. Please try again.'
      );
    } finally {
      setIsBasicEnhancing(false);
    }
  };

  const handleClarifyNumbers = async () => {
    if (isClarifyingNumbers) return;

    // Check connectivity first
    const connected = await checkNetworkConnectivity();
    if (!connected) {
      Alert.alert(
        "Internet Required",
        "Number clarification requires an internet connection. Please connect to the internet and try again.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setIsClarifyingNumbers(true);

      const result = await clarifyNumbers(transcription.imageUri, transcription.enhancedText);
      
      // Show a comparison dialog to let the user choose
      Alert.alert(
        'Numbers Clarified',
        'Review the changes to numeric values:',
        [
          {
            text: 'Keep Original',
            style: 'cancel',
          },
          {
            text: 'Accept Changes',
            onPress: () => {
              updateTranscription(transcription.id, {
                enhancedText: result
              });
            },
          },
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('Error clarifying numbers:', error);
      Alert.alert(
        'Processing Error',
        'There was an error clarifying numbers. Please try again.'
      );
    } finally {
      setIsClarifyingNumbers(false);
    }
  };

  const handleSmartEnhance = async () => {
    if (isSmartEnhancing) return;

    // Check connectivity first
    const connected = await checkNetworkConnectivity();
    if (!connected) {
      Alert.alert(
        "Internet Required",
        "Smart enhancement requires an internet connection. Please connect to the internet and try again.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setIsSmartEnhancing(true);

      const result = await smartEnhance(transcription.imageUri, transcription.enhancedText);
      
      // Show a comparison dialog to let the user choose
      Alert.alert(
        'Smart Enhancement',
        'Review the enhanced text with improved context and clarity:',
        [
          {
            text: 'Keep Original',
            style: 'cancel',
          },
          {
            text: 'Accept Enhancement',
            onPress: () => {
              updateTranscription(transcription.id, {
                enhancedText: result
              });
            },
          },
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('Error performing smart enhancement:', error);
      Alert.alert(
        'Processing Error',
        'There was an error enhancing the text. Please try again.'
      );
    } finally {
      setIsSmartEnhancing(false);
    }
  };

  const handleCompleteText = async () => {
    if (isCompletingText) return;

    // Check connectivity first
    const connected = await checkNetworkConnectivity();
    if (!connected) {
      Alert.alert(
        "Internet Required",
        "Text completion requires an internet connection. Please connect to the internet and try again.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setIsCompletingText(true);

      const result = await completeText(transcription.imageUri, transcription.enhancedText);
      
      // Show a comparison dialog to let the user choose
      Alert.alert(
        'Missing Words/Letters Completed',
        'Review the text with completed missing words and letters (shown in [brackets]):',
        [
          {
            text: 'Keep Original',
            style: 'cancel',
          },
          {
            text: 'Accept Completion',
            onPress: () => {
              updateTranscription(transcription.id, {
                enhancedText: result
              });
            },
          },
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('Error completing text:', error);
      Alert.alert(
        'Processing Error',
        'There was an error completing the text. Please try again.'
      );
    } finally {
      setIsCompletingText(false);
    }
  };

  const handleClarifyComplexWords = async () => {
    if (isClarifyingComplexWords) return;

    // Check connectivity first
    const connected = await checkNetworkConnectivity();
    if (!connected) {
      Alert.alert(
        "Internet Required",
        "Complex word clarification requires an internet connection. Please connect to the internet and try again.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      setIsClarifyingComplexWords(true);

      const result = await clarifyComplexWords(transcription.imageUri, transcription.enhancedText);
      
      // Show a comparison dialog to let the user choose
      Alert.alert(
        'Complex Words Clarified',
        'Review the text with clarified complex terminology:',
        [
          {
            text: 'Keep Original',
            style: 'cancel',
          },
          {
            text: 'Accept Clarifications',
            onPress: () => {
              updateTranscription(transcription.id, {
                enhancedText: result
              });
            },
          },
        ],
        { cancelable: false }
      );
      
    } catch (error) {
      console.error('Error clarifying complex words:', error);
      Alert.alert(
        'Processing Error',
        'There was an error clarifying complex words. Please try again.'
      );
    } finally {
      setIsClarifyingComplexWords(false);
    }
  };

  const handleReplaceText = (newText: string) => {
    updateTranscription(transcription.id, {
      enhancedText: newText
    });
  };

  const handleVoiceAnnotation = () => {
    router.push(`/voice-annotation/${transcription.id}`);
  };

  const handleVisualization = () => {
    router.push(`/visualization/${transcription.id}`);
  };

  const handleResearch = () => {
    router.push(`/research/${transcription.id}`);
  };

  const handleCollaboration = () => {
    router.push(`/transcription/share/${transcription.id}`);
  };

  const renderTextContent = () => {
    switch (viewMode) {
      case 'search':
        return <TextWithSearch text={transcription.enhancedText} />;
      case 'suggestions':
        return <ContextSuggestions text={transcription.enhancedText} onReplace={handleReplaceText} />;
      default:
        return <Text style={styles.transcriptionText}>{transcription.enhancedText}</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{transcription.title}</Text>
          <Text style={styles.date}>{formatDate(transcription.createdAt)}</Text>
        </View>

        <View style={styles.imageContainer}>
          <Image source={{ uri: transcription.imageUri }} style={styles.image} resizeMode="contain" />
        </View>

        <View style={styles.textContainer}>
          <View style={styles.textHeaderContainer}>
            <Text style={styles.sectionTitle}>Transcription</Text>
            
            <View style={styles.enhancementSections}>
              {/* Basic Enhancement Section */}
              <View style={styles.enhancementSection}>
                <View style={styles.enhancementSectionHeader}>
                  <Text style={styles.enhancementSectionTitle}>Basic Enhancement</Text>
                  <View style={styles.connectionBadge}>
                    <Wifi size={14} color={Colors.light.success} />
                    <Text style={styles.connectionBadgeText}>Works Offline</Text>
                  </View>
                </View>
                
                <View style={styles.enhanceButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.enhanceButton}
                    onPress={handleBasicEnhance}
                    disabled={isBasicEnhancing}
                  >
                    {isBasicEnhancing ? (
                      <Text style={styles.enhanceButtonTextDisabled}>Enhancing...</Text>
                    ) : (
                      <>
                        <Zap size={16} color={Colors.light.primary} />
                        <Text style={styles.enhanceButtonText}>Basic Enhance</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Smart Enhancement Section */}
              <View style={styles.enhancementSection}>
                <View style={styles.enhancementSectionHeader}>
                  <Text style={styles.enhancementSectionTitle}>Smart Enhancement</Text>
                  <View style={[styles.connectionBadge, styles.onlineBadge]}>
                    <WifiOff size={14} color={Colors.light.error} />
                    <Text style={styles.onlineBadgeText}>Requires Internet</Text>
                  </View>
                </View>
                
                <View style={styles.enhanceButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.enhanceButton}
                    onPress={handleClarifyNumbers}
                    disabled={isClarifyingNumbers || !isConnected}
                  >
                    {isClarifyingNumbers ? (
                      <Text style={styles.enhanceButtonTextDisabled}>Clarifying...</Text>
                    ) : (
                      <>
                        <Calculator size={16} color={isConnected ? Colors.light.primary : Colors.light.textSecondary} />
                        <Text style={isConnected ? styles.enhanceButtonText : styles.enhanceButtonTextDisabled}>Clarify Numbers</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.enhanceButton}
                    onPress={handleSmartEnhance}
                    disabled={isSmartEnhancing || !isConnected}
                  >
                    {isSmartEnhancing ? (
                      <Text style={styles.enhanceButtonTextDisabled}>Enhancing...</Text>
                    ) : (
                      <>
                        <Sparkles size={16} color={isConnected ? Colors.light.primary : Colors.light.textSecondary} />
                        <Text style={isConnected ? styles.enhanceButtonText : styles.enhanceButtonTextDisabled}>Smart Enhance</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.enhanceButtonsContainer}>
                  <TouchableOpacity 
                    style={styles.enhanceButton}
                    onPress={handleCompleteText}
                    disabled={isCompletingText || !isConnected}
                  >
                    {isCompletingText ? (
                      <Text style={styles.enhanceButtonTextDisabled}>Completing...</Text>
                    ) : (
                      <>
                        <FileText size={16} color={isConnected ? Colors.light.primary : Colors.light.textSecondary} />
                        <Text style={isConnected ? styles.enhanceButtonText : styles.enhanceButtonTextDisabled}>Complete Missing Words</Text>
                      </>
                    )}
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.enhanceButton}
                    onPress={handleClarifyComplexWords}
                    disabled={isClarifyingComplexWords || !isConnected}
                  >
                    {isClarifyingComplexWords ? (
                      <Text style={styles.enhanceButtonTextDisabled}>Clarifying...</Text>
                    ) : (
                      <>
                        <Zap size={16} color={isConnected ? Colors.light.primary : Colors.light.textSecondary} />
                        <Text style={isConnected ? styles.enhanceButtonText : styles.enhanceButtonTextDisabled}>Clarify Complex Words</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
                
                {!isConnected && (
                  <View style={styles.offlineWarning}>
                    <WifiOff size={16} color={Colors.light.error} />
                    <Text style={styles.offlineWarningText}>
                      Smart enhancement features require an internet connection
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
          
          <View style={styles.textContent}>
            {renderTextContent()}
          </View>
          
          <View style={styles.viewModeContainer}>
            <TouchableOpacity 
              style={[styles.viewModeButton, viewMode === 'search' && styles.viewModeButtonActive]}
              onPress={() => setViewMode(viewMode === 'search' ? 'normal' : 'search')}
            >
              <Search size={16} color={viewMode === 'search' ? Colors.light.background : Colors.light.primary} />
              <Text style={[
                styles.viewModeButtonText, 
                viewMode === 'search' && styles.viewModeButtonTextActive
              ]}>
                {viewMode === 'search' ? "Exit Search" : "Search Terms"}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.viewModeButton, viewMode === 'suggestions' && styles.viewModeButtonActive]}
              onPress={() => setViewMode(viewMode === 'suggestions' ? 'normal' : 'suggestions')}
            >
              <MessageSquareText size={16} color={viewMode === 'suggestions' ? Colors.light.background : Colors.light.primary} />
              <Text style={[
                styles.viewModeButtonText, 
                viewMode === 'suggestions' && styles.viewModeButtonTextActive
              ]}>
                {viewMode === 'suggestions' ? "Exit Suggestions" : "Word & Sentence Analysis"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.toolsContainer}>
          <Text style={styles.toolsTitle}>Tools</Text>
          
          <View style={styles.toolsGrid}>
            <TouchableOpacity
              style={styles.toolButton}
              onPress={handleVoiceAnnotation}
            >
              <View style={styles.toolIconContainer}>
                <Mic size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.toolName}>Voice Notes</Text>
              {voiceAnnotations.length > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{voiceAnnotations.length}</Text>
                </View>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toolButton}
              onPress={handleVisualization}
            >
              <View style={styles.toolIconContainer}>
                <GitBranch size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.toolName}>Visualize</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toolButton}
              onPress={handleResearch}
            >
            <View style={styles.toolIconContainer}>
                <BookOpen size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.toolName}>Research</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.toolButton}
              onPress={handleCollaboration}
            >
              <View style={styles.toolIconContainer}>
                <Users size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.toolName}>Collaborate</Text>
              {isShared && (
                <View style={styles.sharedBadge}>
                  <Text style={styles.sharedBadgeText}>Shared</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title="Edit"
            onPress={handleEdit}
            icon={<Edit size={20} color="#FFFFFF" />}
            style={styles.actionButton}
          />
          <Button
            title="Share"
            onPress={handleShare}
            variant="outline"
            icon={<Share2 size={20} color={Colors.light.primary} />}
            style={styles.actionButton}
          />
          <Button
            title="Delete"
            onPress={handleDelete}
            variant="outline"
            icon={<Trash2 size={20} color={Colors.light.error} />}
            style={[styles.actionButton, styles.deleteButton]}
            textStyle={styles.deleteButtonText}
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: Colors.light.textSecondary,
  },
  imageContainer: {
    height: 200,
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginBottom: 32,
  },
  textHeaderContainer: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  enhancementSections: {
    gap: 16,
    marginBottom: 8,
  },
  enhancementSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  enhancementSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  enhancementSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  connectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  connectionBadgeText: {
    fontSize: 12,
    color: Colors.light.success,
    fontWeight: '500',
  },
  onlineBadge: {
    backgroundColor: Colors.light.error + '20',
  },
  onlineBadgeText: {
    color: Colors.light.error,
  },
  enhanceButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 16,
    marginBottom: 8,
  },
  enhanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enhanceButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  enhanceButtonTextDisabled: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    fontWeight: '500',
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error + '10',
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
    gap: 8,
  },
  offlineWarningText: {
    fontSize: 12,
    color: Colors.light.error,
    flex: 1,
  },
  textContent: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  transcriptionText: {
    fontSize: 16,
    color: Colors.light.text,
    lineHeight: 24,
  },
  viewModeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    gap: 12,
  },
  viewModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  viewModeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  viewModeButtonText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  viewModeButtonTextActive: {
    color: Colors.light.background,
  },
  toolsContainer: {
    marginBottom: 32,
  },
  toolsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  toolButton: {
    width: '47%',
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    alignItems: 'center',
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  toolName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.light.text,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.light.primary,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sharedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: Colors.light.primary + '20',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
  },
  sharedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.light.primary,
  },
  actionsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    marginBottom: 0,
  },
  deleteButton: {
    borderColor: Colors.light.error,
  },
  deleteButtonText: {
    color: Colors.light.error,
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
