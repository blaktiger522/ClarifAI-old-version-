import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Image, TextInput, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Wand2, Save, Calculator, Sparkles, RefreshCw, FileText, Zap, Brain, Wifi, WifiOff } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import Button from '@/components/Button';
import { processHandwriting, clarifyNumbers, smartEnhance, completeText, checkNetworkConnectivity, basicEnhance, performOfflineBasicEnhance } from '@/utils/api';
import NetworkErrorBanner from '@/components/NetworkErrorBanner';
import { HandwritingError } from '@/utils/api';
import { validateImageFile, formatFileSize, MAX_IMAGE_SIZE } from '@/utils/image';

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

export default function ProcessScreen() {
  const router = useRouter();
  const { currentImage, addTranscription, setCurrentImage, isProcessing, setIsProcessing } = useTranscriptionStore();
  const [originalText, setOriginalText] = useState('');
  const [enhancedText, setEnhancedText] = useState('');
  const [title, setTitle] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isBasicEnhancing, setIsBasicEnhancing] = useState(false);
  const [isClarifyingNumbers, setIsClarifyingNumbers] = useState(false);
  const [isSmartEnhancing, setIsSmartEnhancing] = useState(false);
  const [isCompletingText, setIsCompletingText] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [processingAttempts, setProcessingAttempts] = useState(0);
  const [imageSize, setImageSize] = useState<number | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  // Use refs to track mounted state
  const isMounted = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Use useCallback to prevent unnecessary re-renders
  const checkConnectivity = useCallback(async () => {
    try {
      if (DEBUG) console.log('Checking connectivity in ProcessScreen');
      
      // TEMPORARY FIX: Always assume we're connected in development mode
      if (__DEV__) {
        if (DEBUG) console.log('DEV MODE: Assuming connectivity is available');
        setIsConnected(true);
        setError(null);
        
        // Auto-process the image when the screen loads
        if (processingAttempts === 0) {
          if (DEBUG) console.log('Auto-processing image in dev mode');
          handleProcess();
        }
        return;
      }
      
      const connected = await checkNetworkConnectivity();
      setIsConnected(connected);
      
      if (DEBUG) console.log('Connectivity check result:', connected);
      
      if (connected) {
        setError(null);
        // Auto-process the image when the screen loads and network is available
        if (processingAttempts === 0) {
          if (DEBUG) console.log('Network available, auto-processing image');
          handleProcess();
        }
      } else {
        setError('No internet connection. Please check your network settings and try again.');
      }
    } catch (e) {
      // Log the error but don't throw it
      console.error('Error in checkConnectivity:', e);
      
      // TEMPORARY FIX: Assume we're connected even if the check fails
      setIsConnected(true);
      setError(null);
      
      // Auto-process the image when the screen loads
      if (processingAttempts === 0) {
        if (DEBUG) console.log('Assuming connectivity and auto-processing image');
        handleProcess();
      }
    }
  }, [processingAttempts]);

  useEffect(() => {
    if (!currentImage) {
      if (DEBUG) console.log('No current image, redirecting to home');
      router.replace('/');
      return;
    }

    if (DEBUG) console.log('ProcessScreen mounted with image:', currentImage.substring(0, 30) + '...');
    
    // Validate the image file
    validateImageFile(currentImage)
      .then(size => {
        if (!isMounted.current) return;
        setImageSize(size);
        if (size > MAX_IMAGE_SIZE) {
          setError(`Image is too large (${formatFileSize(size)}). Maximum size is ${formatFileSize(MAX_IMAGE_SIZE)}.`);
        } else {
          // Check network connectivity before processing
          checkConnectivity();
        }
      })
      .catch(err => {
        if (!isMounted.current) return;
        console.error('Error validating image:', err);
        setError('Could not validate image file. Please try again with a different image.');
      });
  }, [currentImage, checkConnectivity]);

  // Simulate processing progress
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isProcessing) {
      setProcessingProgress(0);
      interval = setInterval(() => {
        if (!isMounted.current) {
          clearInterval(interval);
          return;
        }
        setProcessingProgress(prev => {
          // Increase progress more slowly as it gets higher
          const increment = prev < 50 ? 5 : prev < 80 ? 2 : 0.5;
          const newProgress = Math.min(prev + increment, 95);
          return newProgress;
        });
      }, 300);
    } else {
      // When processing is done, set to 100%
      setProcessingProgress(isUsingFallback ? 100 : 0);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, isUsingFallback]);

  const handleProcess = async () => {
    if (!currentImage || isProcessing) {
      if (DEBUG) console.log('Process aborted: no image or already processing');
      return;
    }

    // Check if image is too large
    if (imageSize && imageSize > MAX_IMAGE_SIZE) {
      setError(`Image is too large (${formatFileSize(imageSize)}). Maximum size is ${formatFileSize(MAX_IMAGE_SIZE)}.`);
      return;
    }

    try {
      setIsProcessing(true);
      setIsEnhancing(true);
      setError(null);
      setIsUsingFallback(false);
      setProcessingAttempts(prev => prev + 1);
      setProcessingProgress(0);

      if (DEBUG) console.log('Starting handwriting processing, attempt:', processingAttempts + 1);

      // Add a small delay before processing to ensure UI updates
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        // Process the handwriting with a single attempt
        const result = await processHandwriting(currentImage);
        
        if (!isMounted.current) return;
        
        if (DEBUG) console.log('Handwriting processing successful');
        
        setOriginalText(result);
        setEnhancedText(result);
        
        // Generate a title from the first few words
        const titleText = result.split(' ').slice(0, 3).join(' ');
        setTitle(titleText + (titleText.length < result.length ? '...' : ''));
        
        // Check if we got a mock result (contains specific text indicating fallback)
        if (typeof result === 'string' && (
          result.includes('mock transcription') || 
          result.includes("couldn't connect to the development server")
        )) {
          setIsUsingFallback(true);
          // Show a non-blocking info message
          Alert.alert(
            "Using Offline Mode",
            "We're using offline processing because we couldn't connect to the server. You can still edit and save the text manually.",
            [{ text: "OK" }]
          );
        }
      } catch (processingError) {
        if (!isMounted.current) return;
        
        console.error('Error in processing, using fallback:', processingError);
        
        // Log the error for debugging
        console.log('Processing error:', processingError.message);
        
        setIsUsingFallback(true);
        
        // Use a more helpful fallback message
        const fallbackText = "We couldn't connect to the processing server. You can still manually edit this text and save it. Try these troubleshooting steps:\n\n1. Check your internet connection\n2. If using Expo Go, try 'expo start --tunnel'\n3. Make sure your device and computer are on the same network";
        
        setOriginalText(fallbackText);
        setEnhancedText(fallbackText);
        setTitle("Manual Entry");
        
        // Show a non-blocking error message with more helpful information
        Alert.alert(
          "Connection Issue",
          "We couldn't connect to the processing server. This is often due to network configuration issues in development mode.",
          [
            { text: "OK" },
            { 
              text: "Troubleshooting",
              onPress: () => router.push('/offline')
            }
          ]
        );
      }
      
    } catch (error) {
      if (!isMounted.current) return;
      
      // Log the error but don't throw it
      console.error('Error processing handwriting:', error);
      
      // Check if this was an abort error
      if (error.name === 'AbortError' || 
          error.message?.includes('aborted')) {
        console.log('Request was aborted:', error.message);
        return; // Don't show error for aborted requests
      }
      
      if (error instanceof HandwritingError) {
        setError(error.message);
        
        if (error.code === 'NETWORK_CONNECTIVITY_ERROR') {
          if (DEBUG) console.log('Network connectivity error detected');
          setIsConnected(false);
        }
        
        if (DEBUG) console.log('HandwritingError details:', {
          message: error.message,
          code: error.code,
          details: error.details
        });
        
        // If it's a development server error, show more helpful information
        if (error.code === 'DEV_SERVER_ERROR') {
          Alert.alert(
            "Development Server Issue",
            "We couldn't connect to the development server. Try these solutions:\n\n1. Restart with 'expo start --tunnel'\n2. Make sure your device and computer are on the same network\n3. Check your firewall settings",
            [
              { text: "OK" },
              { 
                text: "More Help",
                onPress: () => router.push('/offline')
              }
            ]
          );
        }
      } else {
        setError('There was an error processing your image. Please try again.');
        if (DEBUG) console.log('Unknown error details:', error);
      }
    } finally {
      if (isMounted.current) {
        setIsProcessing(false);
        setIsEnhancing(false);
      }
    }
  };

  const handleBasicEnhance = async () => {
    if (!currentImage || !enhancedText || isBasicEnhancing) {
      if (DEBUG) console.log('Basic enhancement aborted: invalid state');
      return;
    }

    try {
      setIsBasicEnhancing(true);
      setError(null);

      if (DEBUG) console.log('Starting basic enhancement');

      try {
        // Check if we're connected to the internet
        const isConnected = await checkNetworkConnectivity();
        
        let result;
        if (isConnected) {
          // If connected, use server-based enhancement
          if (DEBUG) console.log('Using server-based basic enhancement');
          result = await basicEnhance(currentImage, enhancedText);
        } else {
          // If not connected, use offline enhancement
          if (DEBUG) console.log('Using offline basic enhancement');
          result = performOfflineBasicEnhance(enhancedText);
        }
        
        if (!isMounted.current) return;
        
        if (DEBUG) console.log('Basic enhancement successful');
        
        // Show a comparison dialog to let the user choose
        Alert.alert(
          "Basic Enhancement",
          "Review the basic enhancements (spelling, grammar, formatting):",
          [
            {
              text: "Keep Original",
              style: "cancel",
              onPress: () => {
                if (DEBUG) console.log("User chose to keep original text");
              }
            },
            {
              text: "Accept Changes",
              onPress: () => {
                if (DEBUG) console.log("User accepted basic enhancement changes");
                setEnhancedText(result);
              }
            }
          ],
          { cancelable: false }
        );
      } catch (enhanceError) {
        if (!isMounted.current) return;
        
        // Check if this was an abort error
        if (enhanceError.name === 'AbortError' || 
            enhanceError.message?.includes('aborted')) {
          console.log('Request was aborted:', enhanceError.message);
          return; // Don't show error for aborted requests
        }
        
        console.error('Error in basic enhancement, showing fallback message:', enhanceError);
        
        // Try offline enhancement as a fallback
        try {
          const offlineResult = performOfflineBasicEnhance(enhancedText);
          
          Alert.alert(
            "Offline Enhancement",
            "We couldn't connect to the server, but we've applied basic enhancements offline:",
            [
              {
                text: "Keep Original",
                style: "cancel"
              },
              {
                text: "Accept Changes",
                onPress: () => {
                  setEnhancedText(offlineResult);
                }
              }
            ]
          );
        } catch (offlineError) {
          // If even offline enhancement fails, show an error
          Alert.alert(
            "Enhancement Issue",
            "Could not perform basic enhancement. Please try again later.",
            [{ text: "OK" }]
          );
        }
      }
      
    } catch (error) {
      if (!isMounted.current) return;
      
      // Check if this was an abort error
      if (error.name === 'AbortError' || 
          error.message?.includes('aborted')) {
        console.log('Request was aborted:', error.message);
        return; // Don't show error for aborted requests
      }
      
      // Log the error but don't throw it
      console.error('Error performing basic enhancement:', error);
      
      if (error instanceof HandwritingError) {
        setError(error.message);
        
        if (error.code === 'NETWORK_CONNECTIVITY_ERROR') {
          if (DEBUG) console.log('Network connectivity error detected during basic enhancement');
          setIsConnected(false);
          
          // Try offline enhancement
          try {
            const offlineResult = performOfflineBasicEnhance(enhancedText);
            
            Alert.alert(
              "Offline Enhancement",
              "No internet connection available. We've applied basic enhancements offline:",
              [
                {
                  text: "Keep Original",
                  style: "cancel"
                },
                {
                  text: "Accept Changes",
                  onPress: () => {
                    setEnhancedText(offlineResult);
                  }
                }
              ]
            );
          } catch (offlineError) {
            // If even offline enhancement fails, show an error
            Alert.alert(
              "Enhancement Issue",
              "Could not perform basic enhancement. Please try again later.",
              [{ text: "OK" }]
            );
          }
        }
      } else {
        setError('There was an error enhancing the text. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsBasicEnhancing(false);
      }
    }
  };

  const handleClarifyNumbers = async () => {
    if (!currentImage || !enhancedText || isClarifyingNumbers) {
      if (DEBUG) console.log('Number clarification aborted: invalid state');
      return;
    }

    try {
      // Check connectivity first
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        Alert.alert(
          "Internet Required",
          "Number clarification requires an internet connection. Please connect to the internet and try again.",
          [{ text: "OK" }]
        );
        return;
      }
      
      setIsClarifyingNumbers(true);
      setError(null);

      if (DEBUG) console.log('Starting number clarification');

      try {
        const result = await clarifyNumbers(currentImage, enhancedText);
        
        if (!isMounted.current) return;
        
        if (DEBUG) console.log('Number clarification successful');
        
        // Show a comparison dialog to let the user choose
        Alert.alert(
          'Numbers Clarified',
          'Review the changes to numeric values:',
          [
            {
              text: 'Keep Original',
              style: 'cancel',
              onPress: () => {
                if (DEBUG) console.log('User chose to keep original text');
              }
            },
            {
              text: 'Accept Changes',
              onPress: () => {
                if (DEBUG) console.log('User accepted number clarification changes');
                setEnhancedText(result);
              }
            },
          ],
          { cancelable: false }
        );
      } catch (clarifyError) {
        if (!isMounted.current) return;
        
        // Check if this was an abort error
        if (clarifyError.name === 'AbortError' || 
            clarifyError.message?.includes('aborted')) {
          console.log('Request was aborted:', clarifyError.message);
          return; // Don't show error for aborted requests
        }
        
        console.error('Error clarifying numbers, showing fallback message:', clarifyError);
        
        // Show a non-blocking error message with more helpful information
        Alert.alert(
          "Enhancement Issue",
          "Could not clarify numbers. This might be due to server connectivity issues.",
          [
            { text: "OK" },
            { 
              text: "Troubleshooting",
              onPress: () => router.push('/offline')
            }
          ]
        );
      }
      
    } catch (error) {
      if (!isMounted.current) return;
      
      // Check if this was an abort error
      if (error.name === 'AbortError' || 
          error.message?.includes('aborted')) {
        console.log('Request was aborted:', error.message);
        return; // Don't show error for aborted requests
      }
      
      // Log the error but don't throw it
      console.error('Error clarifying numbers:', error);
      
      if (error instanceof HandwritingError) {
        setError(error.message);
        
        if (error.code === 'NETWORK_CONNECTIVITY_ERROR') {
          if (DEBUG) console.log('Network connectivity error detected during number clarification');
          setIsConnected(false);
          
          Alert.alert(
            "Internet Required",
            "Number clarification requires an internet connection. Please connect to the internet and try again.",
            [{ text: "OK" }]
          );
        }
      } else {
        setError('There was an error clarifying numbers. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsClarifyingNumbers(false);
      }
    }
  };

  const handleSmartEnhance = async () => {
    if (!currentImage || !enhancedText || isSmartEnhancing) {
      if (DEBUG) console.log('Smart enhancement aborted: invalid state');
      return;
    }

    try {
      // Check connectivity first
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        Alert.alert(
       "Internet Required",
          "Smart enhancement requires an internet connection. Please connect to the internet and try again.",
          [{ text: "OK" }]
        );
        return;
      }
      
      setIsSmartEnhancing(true);
      setError(null);

      if (DEBUG) console.log('Starting smart enhancement');

      try {
        const result = await smartEnhance(currentImage, enhancedText);
        
        if (!isMounted.current) return;
        
        if (DEBUG) console.log('Smart enhancement successful');
        
        // Show a comparison dialog to let the user choose
        Alert.alert(
          'Smart Enhancement',
          'Review the enhanced text with improved context and clarity:',
          [
            {
              text: 'Keep Original',
              style: 'cancel',
              onPress: () => {
                if (DEBUG) console.log('User chose to keep original text');
              }
            },
            {
           text: 'Accept Enhancement',
              onPress: () => {
                if (DEBUG) console.log('User accepted smart enhancement changes');
                setEnhancedText(result);
              }
            },
          ],
          { cancelable: false }
        );
      } catch (enhanceError) {
        if (!isMounted.current) return;
        
        // Check if this was an abort error
        if (enhanceError.name === 'AbortError' || 
            enhanceError.message?.includes('aborted')) {
          console.log('Request was aborted:', enhanceError.message);
          return; // Don't show error for aborted requests
        }
        
        console.error('Error in smart enhancement, showing fallback message:', enhanceError);
        
        // Show a non-blocking error message with more helpful information
        Alert.alert(
          "Enhancement Issue",
          "Could not enhance the text. This might be due to server connectivity issues.",
          [
            { text: "OK" },
            { 
              text: "Troubleshooting",
              onPress: () => router.push('/offline')
            }
          ]
        );
      }
      
    } catch (error) {
      if (!isMounted.current) return;
      
      // Check if this was an abort error
      if (error.name === 'AbortError' || 
          error.message?.includes('aborted')) {
        console.log('Request was aborted:', error.message);
        return; // Don't show error for aborted requests
      }

    // Log the error but don't throw it
      console.error('Error performing smart enhancement:', error);
      
      if (error instanceof HandwritingError) {
        setError(error.message);
        
        if (error.code === 'NETWORK_CONNECTIVITY_ERROR') {
          if (DEBUG) console.log('Network connectivity error detected during smart enhancement');
          setIsConnected(false);
          
          Alert.alert(
            "Internet Required",
            "Smart enhancement requires an internet connection. Please connect to the internet and try again.",
            [{ text: "OK" }]
          );
        }
      } else {
        setError('There was an error enhancing the text. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsSmartEnhancing(false);
      }
    }
  };

  const handleCompleteText = async () => {
    if (!currentImage || !enhancedText || isCompletingText) {
      if (DEBUG) console.log('Text completion aborted: invalid state');
      return;
    }

    try {
      // Check connectivity first
      const isConnected = await checkNetworkConnectivity();
      if (!isConnected) {
        Alert.alert(
          "Internet Required",
          "Text completion requires an internet connection. Please connect to the internet and try again.",
          [{ text: "OK" }]
        );
        return;
      }

    setIsCompletingText(true);
      setError(null);

      if (DEBUG) console.log('Starting text completion');

      try {
        const result = await completeText(currentImage, enhancedText);
        
        if (!isMounted.current) return;
        
        if (DEBUG) console.log('Text completion successful');
        
        // Show a comparison dialog to let the user choose
        Alert.alert(
          'Missing Words/Letters Completed',
          'Review the text with completed missing words and letters (shown in [brackets]):',
          [
            {
              text: 'Keep Original',
              style: 'cancel',
              onPress: () => {
                if (DEBUG) console.log('User chose to keep original text');
              }
            },
            {
              text: 'Accept Completion',
              onPress: () => {
                if (DEBUG) console.log('User accepted text completion changes');
                setEnhancedText(result);
              }
            },
          ],
          { cancelable: false }
        );
      } catch (completeError) {
        if (!isMounted.current) return;
        
        // Check if this was an abort error
        if (completeError.name === 'AbortError' || 
            completeError.message?.includes('aborted')) {
          console.log('Request was aborted:', completeError.message);
          return; // Don't show error for aborted requests
        }
        
        console.error('Error completing text, showing fallback message:', completeError);

      // Show a non-blocking error message with more helpful information
        Alert.alert(
          "Enhancement Issue",
          "Could not complete the text. This might be due to server connectivity issues.",
          [
            { text: "OK" },
            { 
              text: "Troubleshooting",
              onPress: () => router.push('/offline')
            }
          ]
        );
      }
      
    } catch (error) {
      if (!isMounted.current) return;
      
      // Check if this was an abort error
      if (error.name === 'AbortError' || 
          error.message?.includes('aborted')) {
        console.log('Request was aborted:', error.message);
        return; // Don't show error for aborted requests
      }
      
      // Log the error but don't throw it
      console.error('Error completing text:', error);
      
      if (error instanceof HandwritingError) {
        setError(error.message);
        
        if (error.code === 'NETWORK_CONNECTIVITY_ERROR') {
          if (DEBUG) console.log('Network connectivity error detected during text completion');
          setIsConnected(false);
          
          Alert.alert(
            "Internet Required",
            "Text completion requires an internet connection. Please connect to the internet and try again.",
            [{ text: "OK" }]
          );
        }
      } else {
        setError('There was an error completing the text. Please try again.');
      }
    } finally {
      if (isMounted.current) {
        setIsCompletingText(false);
      }
    }
  };

const handleSave = () => {
    if (!currentImage) {
      if (DEBUG) console.log('Save aborted: no current image');
      return;
    }

    if (DEBUG) console.log('Saving transcription');

    const newTranscription = {
      id: Date.now().toString(),
      imageUri: currentImage,
      originalText,
      enhancedText,
      title: title || 'Untitled',
      createdAt: Date.now(),
    };

    addTranscription(newTranscription);
    setCurrentImage(null);
    router.replace(`/transcription/${newTranscription.id}`);
  };

  const handleRetry = () => {
    if (DEBUG) console.log('Retry button pressed, count:', retryCount + 1);
    setRetryCount(prev => prev + 1);
    checkConnectivity();
    
    // If we've already tried processing before, try again
    if (processingAttempts > 0) {
      if (DEBUG) console.log('Retrying processing');
      handleProcess();
    }
  };

  const toggleOfflineMode = () => {
    setIsOfflineMode(!isOfflineMode);
    if (!isOfflineMode) {
      // Entering offline mode
      Alert.alert(
        "Offline Mode Enabled",
        "You can now manually enter text without server processing. Enhanced features will be limited.",
        [{ text: "OK" }]
      );
    }
  };

const handleTroubleshooting = () => {
    router.push('/offline');
  };

  if (!currentImage) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      <NetworkErrorBanner onRetry={handleRetry} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentImage }} style={styles.image} resizeMode="contain" />
          {imageSize && (
            <Text style={styles.imageSizeText}>
              Image size: {formatFileSize(imageSize)}
            </Text>
          )}
        </View>

        {isProcessing && (
          <View style={styles.processingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.processingText}>Processing handwriting...</Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${processingProgress}%` }]} />
            </View>
            <Text style={styles.processingSubtext}>
              {processingProgress < 30 ? 'Analyzing image...' : 
               processingProgress < 60 ? 'Recognizing text patterns...' : 
               processingProgress < 90 ? 'Extracting content...' : 
               'Finalizing results...'}
            </Text>
          </View>
        )}

         {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <View style={styles.errorActions}>
              <Button
                title="Retry"
                onPress={handleRetry}
                icon={<RefreshCw size={20} color="#FFFFFF" />}
                style={styles.retryButton}
              />
              <Button
                title="Manual Entry"
                onPress={toggleOfflineMode}
                variant="outline"
                style={styles.manualButton}
              />
            </View>
            <TouchableOpacity 
              style={styles.troubleshootingLink}
              onPress={handleTroubleshooting}
            >
              <Text style={styles.troubleshootingText}>View troubleshooting guide</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {isUsingFallback && !error && (
          <View style={styles.fallbackContainer}>
            <Text style={styles.fallbackText}>
              Using offline mode because we couldn't connect to the processing server. You can still edit and save the text manually.
            </Text>
            <TouchableOpacity 
              style={styles.troubleshootingLink}
              onPress={handleTroubleshooting}
            >
              <Text style={styles.troubleshootingText}>View troubleshooting guide</Text>
            </TouchableOpacity>
          </View>
        )}

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
              value={enhancedText}
              onChangeText={setEnhancedText}
              placeholder="Transcribed text will appear here"
              placeholderTextColor={Colors.light.placeholder}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.enhancementSection}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Basic Enhancement</Text>
              <View style={styles.connectionBadge}>
                <Wifi size={14} color={Colors.light.success} />
                <Text style={styles.connectionBadgeText}>Works Offline</Text>
              </View>
            </View>
            <Text style={styles.sectionDescription}>
              Simple improvements for clearer text and basic formatting
            </Text>
            
            <View style={styles.enhanceActionsContainer}>
              <Button
                title="Basic Enhance"
                onPress={handleBasicEnhance}
                variant="outline"
                loading={isBasicEnhancing}
                disabled={isBasicEnhancing || !enhancedText.trim()}
                icon={<Zap size={20} color={Colors.light.primary} />}
                style={styles.enhanceButton}
              />
              
              <Button
                title="Clarify Numbers"
                onPress={handleClarifyNumbers}
                variant="outline"
                loading={isClarifyingNumbers}
                disabled={isClarifyingNumbers || !enhancedText.trim() || !isConnected}
                icon={<Calculator size={20} color={isConnected ? Colors.light.primary : Colors.light.textSecondary} />}
                style={[styles.enhanceButton, !isConnected && styles.disabledButton]}
              />
            </View>
            </View>
          
          <View style={styles.enhancementSection}>
            <View style={styles.sectionTitleContainer}>
              <Text style={styles.sectionTitle}>Smart Enhancement (AI-Powered)</Text>
              <View style={[styles.connectionBadge, styles.onlineBadge]}>
                <WifiOff size={14} color={Colors.light.error} />
                <Text style={styles.onlineBadgeText}>Requires Internet</Text>
              </View>
            </View>
            <Text style={styles.sectionDescription}>
              Advanced AI processing for complex text and context understanding
            </Text>
            
            <View style={styles.enhanceActionsContainer}>
              <Button
                title="Smart Enhance"
                onPress={handleSmartEnhance}
                variant="outline"
                loading={isSmartEnhancing}
                disabled={isSmartEnhancing || !enhancedText.trim() || !isConnected}
                icon={<Brain size={20} color={isConnected ? Colors.light.primary : Colors.light.textSecondary} />}
                style={[styles.enhanceButton, !isConnected && styles.disabledButton]}
              />
              
              <Button
                title="Complete Text"
                onPress={handleCompleteText}
                variant="outline"
                loading={isCompletingText}
                disabled={isCompletingText || !enhancedText.trim() || !isConnected}
                icon={<FileText size={20} color={isConnected ? Colors.light.primary : Colors.light.textSecondary} />}
                style={[styles.enhanceButton, !isConnected && styles.disabledButton]}
              />
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

         <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              <Text style={styles.infoTextBold}>Basic Enhancement:</Text> Improves spelling, grammar, and formatting while preserving the original content. Works offline.
            </Text>
            <Text style={[styles.infoText, styles.infoTextMargin]}>
              <Text style={styles.infoTextBold}>Smart Enhancement:</Text> Uses AI to improve context, fix complex errors, and ensure logical sentence structure. Requires internet.
            </Text>
            <Text style={[styles.infoText, styles.infoTextMargin]}>
              <Text style={styles.infoTextBold}>Complete Text:</Text> Fills in missing words or letters in incomplete sentences, showing additions in [brackets]. Requires internet.
            </Text>
          </View>
          
          <Button
            title="Save"
            onPress={handleSave}
            disabled={!enhancedText.trim()}
            icon={<Save size={20} color="#FFFFFF" />}
            style={styles.saveButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
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
  imageSizeText: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: '#FFFFFF',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  processingContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  processingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
  },
  processingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  progressBarContainer: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.light.background,
    borderRadius: 4,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.light.primary,
  },
  formContainer: {
    marginBottom: 24,
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
    marginBottom: 16,
  },
  textArea: {
    padding: 12,
    fontSize: 16,
    color: Colors.light.text,
    minHeight: 150,
  },
  enhancementSection: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
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
  sectionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
  },
  enhanceActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 4,
  },
  enhanceButton: {
    flex: 1,
  },
  disabledButton: {
    borderColor: Colors.light.border,
    opacity: 0.7,
  },
  offlineWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.error + '10',
    borderRadius: 8,
    padding: 8,
    marginTop: 12,
    gap: 8,
  },
  offlineWarningText: {
    fontSize: 12,
    color: Colors.light.error,
    flex: 1,
  },
  infoContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  infoTextMargin: {
    marginTop: 8,
  },
  infoTextBold: {
    fontWeight: '600',
    color: Colors.light.text,
  },
  saveButton: {
    marginTop: 8,
  },
  actionsContainer: {
    gap: 12,
  },
  errorContainer: {
    backgroundColor: Colors.light.errorBackground,
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.error,
  },
  errorText: {
    color: Colors.light.error,
    fontSize: 14,
    marginBottom: 12,
  },
  errorActions: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flex: 1,
    backgroundColor: Colors.light.error,
  },
  manualButton: {
    flex: 1,
  },
  troubleshootingLink: {
    marginTop: 12,
    alignSelf: 'center',
  },
  troubleshootingText: {
    color: Colors.light.primary,
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  fallbackContainer: {
    backgroundColor: Colors.light.warning + '20',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.warning,
  },
  fallbackText: {
    color: Colors.light.text,
    fontSize: 14,
    marginBottom: 8,
      },
});
