import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { trpcClient } from '@/lib/trpc';

/**
 * Custom error class for handwriting processing errors
 */
export class HandwritingError extends Error {
  code: string;
  details: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', details: any = null) {
    super(message);
    this.name = 'HandwritingError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Checks if the device has network connectivity
 * @returns Promise<boolean> - true if connected, false otherwise
 */
export const checkNetworkConnectivity = async (): Promise<boolean> => {
  try {
    // First check basic connectivity using NetInfo
    const netInfo = await NetInfo.fetch();
    
    // If NetInfo explicitly says we're not connected, return false
    if (netInfo.isConnected === false) {
      console.log('NetInfo reports device is offline');
      return false;
    }
    
    // For development mode, we'll be more lenient to avoid blocking the UI
    if (__DEV__) {
      // In development, if NetInfo says we're connected, trust it
      if (netInfo.isConnected === true) {
        console.log('DEV MODE: NetInfo reports device is online');
        return true;
      }
    }
    
    // For a more reliable check, try to fetch a small resource
    // Use a different endpoint for web vs native
    const testUrl = Platform.OS === 'web' 
      ? 'https://www.google.com/favicon.ico' 
      : 'https://www.apple.com/favicon.ico';
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort('timeout'), 5000);
    
    try {
      const response = await fetch(testUrl, {
        method: 'HEAD',
        cache: 'no-cache',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('Network connectivity test passed');
        return true;
      } else {
        console.log('Network connectivity test failed: server responded with', response.status);
        return false;
      }
    } catch (error) {
      clearTimeout(timeoutId);
      console.log('Network connectivity test failed:', error);
      
      // Special case for development mode - if we're in dev mode and the error
      // seems to be related to CORS or similar issues, still return true
      if (__DEV__ && (
        error.message?.includes('Network request failed') ||
        error.message?.includes('CORS') ||
        error.message?.includes('Failed to fetch')
      )) {
        console.log('DEV MODE: Ignoring network error, assuming connected');
        return true;
      }
      
      return false;
    }
  } catch (error) {
    console.error('Error checking network connectivity:', error);
    return false;
  }
};

/**
 * Converts an image URI to base64
 * @param uri Image URI to convert
 * @returns Promise with base64 string
 */
export const imageToBase64 = async (uri: string): Promise<string> => {
  try {
    // For web, we need to fetch the image and convert it
    if (Platform.OS === 'web') {
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove the data:image/jpeg;base64, prefix if it exists
          const base64Data = base64String.split(',')[1] || base64String;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } else {
      // For native, we can use the fetch API directly
      const response = await fetch(uri);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          // Remove the data:image/jpeg;base64, prefix if it exists
          const base64Data = base64String.split(',')[1] || base64String;
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
  } catch (error) {
    console.error('Error converting image to base64:', error);
    throw new HandwritingError(
      'Failed to process image. Please try again with a different image.',
      'IMAGE_PROCESSING_ERROR',
      { originalError: error }
    );
  }
};

/**
 * Processes handwriting image and returns text
 * @param imageUri URI of the image to process
 * @returns Promise with the extracted text
 */
export const processHandwriting = async (imageUri: string): Promise<string> => {
  try {
    // First check if we have network connectivity
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new HandwritingError(
        'No internet connection. Please connect to the internet and try again.',
        'NETWORK_CONNECTIVITY_ERROR'
      );
    }
    
    // Convert image to base64
    const imageBase64 = await imageToBase64(imageUri);
    
    // Try to use the tRPC endpoint
    try {
      const result = await trpcClient.transcription.process.mutate({
        imageBase64
      });
      
      // If we got here, processing was successful
      return result.text;
    } catch (trpcError) {
      console.error('tRPC processing error:', trpcError);
      
      // Check if this was a timeout error
      if (trpcError.message?.includes('timeout') || 
          trpcError.message?.includes('aborted') ||
          trpcError.code === 'PROCESSING_TIMEOUT') {
        throw new HandwritingError(
          'Processing timed out. The image may be too complex or the server is busy. Try again with a clearer image.',
          'PROCESSING_TIMEOUT'
        );
      }
      
      // If we're in development mode, provide a more helpful error
      if (__DEV__) {
        if (trpcError.message?.includes('Failed to fetch') || 
            trpcError.message?.includes('Network Error') ||
            trpcError.message?.includes('Unable to resolve host') ||
            trpcError.message?.includes('Unable to connect to development server')) {
          console.log('Development server connection issue detected');
          
          // Fallback to mock data with a clear indication it's mock data
          console.log('Using mock data due to server connection issue');
          return "This is mock transcription data because we couldn't connect to the development server.\n\nIn a real app, this would be the result of processing your handwritten image through an OCR service.\n\nYou can still edit this text manually and test the app's features.";
        }
      }
      
      // For other errors, try to provide a helpful message
      if (trpcError.message?.includes('413') || trpcError.message?.includes('Payload Too Large')) {
        throw new HandwritingError(
          'The image is too large. Please try with a smaller image or reduce the image quality.',
          'IMAGE_TOO_LARGE'
        );
      }
      
      // For any other error, throw a generic error
      throw new HandwritingError(
        'Failed to process handwriting. Please try again later.',
        'PROCESSING_ERROR',
        { originalError: trpcError }
      );
    }
  } catch (error) {
    // If it's already a HandwritingError, just rethrow it
    if (error instanceof HandwritingError) {
      throw error;
    }
    
    // Otherwise, wrap it in a HandwritingError
    console.error('Error processing handwriting, using mock data:', error);
    
    // Provide a fallback for development
    if (__DEV__) {
      console.log('Using fallback mock data in development mode');
      return "This is mock transcription data because an error occurred during processing.\n\nIn a real app, this would be the result of processing your handwritten image through an OCR service.\n\nYou can still edit this text manually and test the app's features.";
    }
    
    throw new HandwritingError(
      'Failed to process handwriting. Please try again later.',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};

/**
 * Performs basic offline enhancement on transcribed text
 * This function works without internet connection
 * @param text Text to enhance
 * @returns Enhanced text
 */
export const performOfflineBasicEnhance = (text: string): string => {
  if (!text || text.trim().length === 0) {
    return text;
  }
  
  try {
    // Apply basic text enhancements that can be done offline
    let enhancedText = text;
    
    // 1. Fix capitalization at the beginning of sentences
    enhancedText = enhancedText.replace(
      /(^|[.!?]\s+)([a-z])/g, 
      (match, p1, p2) => p1 + p2.toUpperCase()
    );
    
    // 2. Fix common spacing issues
    enhancedText = enhancedText
      .replace(/\s+/g, ' ')                // Replace multiple spaces with a single space
      .replace(/\s+([.,;:!?])/g, '$1')     // Remove spaces before punctuation
      .replace(/([.,;:!?])(?=[a-zA-Z])/g, '$1 '); // Add space after punctuation if missing
    
    // 3. Fix common typos and abbreviations
    const commonFixes: Record<string, string> = {
      'i ': 'I ',
      'i\'m': 'I\'m',
      'i\'ll': 'I\'ll',
      'i\'ve': 'I\'ve',
      'i\'d': 'I\'d',
      'dont': 'don\'t',
      'cant': 'can\'t',
      'wont': 'won\'t',
      'didnt': 'didn\'t',
      'isnt': 'isn\'t',
      'wasnt': 'wasn\'t',
      'werent': 'weren\'t',
      'havent': 'haven\'t',
      'hasnt': 'hasn\'t',
      'wouldnt': 'wouldn\'t',
      'shouldnt': 'shouldn\'t',
      'couldnt': 'couldn\'t',
      'thats': 'that\'s',
      'whats': 'what\'s',
      'heres': 'here\'s',
      'theres': 'there\'s',
      'theyre': 'they\'re',
      'youre': 'you\'re',
      'youll': 'you\'ll',
      'youve': 'you\'ve',
      'youd': 'you\'d',
      'hes': 'he\'s',
      'shes': 'she\'s',
      'its': 'it\'s',
      'were': 'we\'re',
      'weve': 'we\'ve',
      'wed': 'we\'d',
      'theyll': 'they\'ll',
      'theyve': 'they\'ve',
      'theyd': 'they\'d',
      'im': 'I\'m',
      'ill': 'I\'ll',
      'ive': 'I\'ve',
      'id': 'I\'d',
    };
    
    // Apply common fixes
    Object.entries(commonFixes).forEach(([incorrect, correct]) => {
      // Use word boundaries to avoid replacing parts of words
      const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
      enhancedText = enhancedText.replace(regex, correct);
    });
    
    // 4. Ensure proper paragraph breaks
    enhancedText = enhancedText
      .replace(/\n{3,}/g, '\n\n')  // Replace 3+ newlines with 2
      .trim();                     // Trim whitespace at start and end
    
    return enhancedText;
  } catch (error) {
    console.error('Error in offline basic enhancement:', error);
    // Return original text if enhancement fails
    return text;
  }
};

/**
 * Performs basic enhancement on transcribed text
 * @param imageUri URI of the original image
 * @param text Text to enhance
 * @returns Promise with enhanced text
 */
export const basicEnhance = async (imageUri: string, text: string): Promise<string> => {
  try {
    // Check connectivity first
    const isConnected = await checkNetworkConnectivity();
    
    // If not connected, use offline enhancement
    if (!isConnected) {
      console.log('No internet connection, using offline basic enhancement');
      return performOfflineBasicEnhance(text);
    }
    
    // If connected, try to use the server-based enhancement
    try {
      // Convert image to base64
      const imageBase64 = await imageToBase64(imageUri);
      
      const result = await trpcClient.transcription.enhance.mutate({
        imageBase64,
        text,
        type: 'basic'
      });
      
      return result.text;
    } catch (trpcError) {
      console.error('tRPC basic enhancement error, falling back to offline enhancement:', trpcError);
      
      // Fall back to offline enhancement
      return performOfflineBasicEnhance(text);
    }
  } catch (error) {
    // If it's already a HandwritingError, just log it
    if (error instanceof HandwritingError) {
      console.error('Error in basic enhancement, using offline enhancement:', error.message);
    } else {
      console.error('Unknown error in basic enhancement, using offline enhancement:', error);
    }
    
    // Fall back to offline enhancement
    return performOfflineBasicEnhance(text);
  }
};

/**
 * Clarifies numbers in transcribed text
 * @param imageUri URI of the original image
 * @param text Text to clarify numbers in
 * @returns Promise with text with clarified numbers
 */
export const clarifyNumbers = async (imageUri: string, text: string): Promise<string> => {
  try {
    // Check connectivity first
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new HandwritingError(
        'No internet connection. Number clarification requires internet connectivity.',
        'NETWORK_CONNECTIVITY_ERROR'
      );
    }
    
    // Convert image to base64
    const imageBase64 = await imageToBase64(imageUri);
    
    // Try to use the tRPC endpoint
    try {
      const result = await trpcClient.transcription.enhance.mutate({
        imageBase64,
        text,
        type: 'numbers'
      });
      
      return result.text;
    } catch (trpcError) {
      console.error('tRPC number clarification error:', trpcError);
      
      // Check if this was a timeout error
      if (trpcError.message?.includes('timeout') || 
          trpcError.message?.includes('aborted') ||
          trpcError.code === 'ENHANCEMENT_TIMEOUT') {
        throw new HandwritingError(
          'Number clarification timed out. Please try again later.',
          'ENHANCEMENT_TIMEOUT'
        );
      }
      
      // If we're in development mode, provide a more helpful error
      if (__DEV__) {
        if (trpcError.message?.includes('Failed to fetch') || 
            trpcError.message?.includes('Network Error') ||
            trpcError.message?.includes('Unable to resolve host')) {
          console.log('Development server connection issue detected');
          
          // Fallback to a simple enhancement
          return text.replace(/(\d+)/g, match => {
            // Just return the original number - in a real app this would do actual enhancement
            return match;
          });
        }
      }
      
      // For any other error, throw a generic error
      throw new HandwritingError(
        'Failed to clarify numbers. Please try again later.',
        'ENHANCEMENT_ERROR',
        { originalError: trpcError }
      );
    }
  } catch (error) {
    // If it's already a HandwritingError, just rethrow it
    if (error instanceof HandwritingError) {
      throw error;
    }
    
    // Otherwise, wrap it in a HandwritingError
    console.error('Error clarifying numbers:', error);
    
    throw new HandwritingError(
      'Failed to clarify numbers. Please try again later.',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};

/**
 * Enhances transcribed text with AI
 * @param imageUri URI of the original image
 * @param text Text to enhance
 * @returns Promise with enhanced text
 */
export const smartEnhance = async (imageUri: string, text: string): Promise<string> => {
  try {
    // Check connectivity first
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new HandwritingError(
        'No internet connection. Smart enhancement requires internet connectivity.',
        'NETWORK_CONNECTIVITY_ERROR'
      );
    }
    
    // Convert image to base64
    const imageBase64 = await imageToBase64(imageUri);
    
    // Try to use the tRPC endpoint
    try {
      const result = await trpcClient.transcription.enhance.mutate({
        imageBase64,
        text,
        type: 'smart'
      });
      
      return result.text;
    } catch (trpcError) {
      console.error('tRPC smart enhancement error:', trpcError);
      
      // Check if this was a timeout error
      if (trpcError.message?.includes('timeout') || 
          trpcError.message?.includes('aborted') ||
          trpcError.code === 'ENHANCEMENT_TIMEOUT') {
        throw new HandwritingError(
          'Smart enhancement timed out. Please try again later.',
          'ENHANCEMENT_TIMEOUT'
        );
      }
      
      // If we're in development mode, provide a more helpful error
      if (__DEV__) {
        if (trpcError.message?.includes('Failed to fetch') || 
            trpcError.message?.includes('Network Error') ||
            trpcError.message?.includes('Unable to resolve host')) {
          console.log('Development server connection issue detected');
          
          // Fallback to a simple enhancement
          return text + "\n\n[This text would normally be enhanced with AI processing to improve formatting, correct errors, and enhance readability.]";
        }
      }
      
      // For any other error, throw a generic error
      throw new HandwritingError(
        'Failed to enhance text. Please try again later.',
        'ENHANCEMENT_ERROR',
        { originalError: trpcError }
      );
    }
  } catch (error) {
    // If it's already a HandwritingError, just rethrow it
    if (error instanceof HandwritingError) {
      throw error;
    }
    
    // Otherwise, wrap it in a HandwritingError
    console.error('Error enhancing text:', error);
    
    throw new HandwritingError(
      'Failed to enhance text. Please try again later.',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};

/**
 * Completes missing words and letters in transcribed text
 * @param imageUri URI of the original image
 * @param text Text to complete
 * @returns Promise with completed text
 */
export const completeText = async (imageUri: string, text: string): Promise<string> => {
  try {
    // Check connectivity first
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new HandwritingError(
        'No internet connection. Text completion requires internet connectivity.',
        'NETWORK_CONNECTIVITY_ERROR'
      );
    }
    
    // Convert image to base64
    const imageBase64 = await imageToBase64(imageUri);
    
    // Try to use the tRPC endpoint
    try {
      const result = await trpcClient.transcription.enhance.mutate({
        imageBase64,
        text,
        type: 'completion'
      });
      
      return result.text;
    } catch (trpcError) {
      console.error('tRPC text completion error:', trpcError);
      
      // Check if this was a timeout error
      if (trpcError.message?.includes('timeout') || 
          trpcError.message?.includes('aborted') ||
          trpcError.code === 'ENHANCEMENT_TIMEOUT') {
        throw new HandwritingError(
          'Text completion timed out. Please try again later.',
          'ENHANCEMENT_TIMEOUT'
        );
      }
      
      // If we're in development mode, provide a more helpful error
      if (__DEV__) {
        if (trpcError.message?.includes('Failed to fetch') || 
            trpcError.message?.includes('Network Error') ||
            trpcError.message?.includes('Unable to resolve host')) {
          console.log('Development server connection issue detected');
          
          // Fallback to a simple completion
          // Find incomplete words (ending with ...)
          return text.replace(/(\w+)\.{3}/g, match => {
            const word = match.replace('...', '');
            // Just add a simple completion in brackets
            return `${word}[completed]`;
          });
        }
      }
      
      // For any other error, throw a generic error
      throw new HandwritingError(
        'Failed to complete text. Please try again later.',
        'ENHANCEMENT_ERROR',
        { originalError: trpcError }
      );
    }
    } catch (error) {
    // If it's already a HandwritingError, just rethrow it
    if (error instanceof HandwritingError) {
      throw error;
    }
    
    // Otherwise, wrap it in a HandwritingError
    console.error('Error completing text:', error);
    
    throw new HandwritingError(
      'Failed to complete text. Please try again later.',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};
/**
 * Clarifies complex words in transcribed text
 * @param imageUri URI of the original image
 * @param text Text to clarify
 * @returns Promise with clarified text
 */
export const clarifyComplexWords = async (imageUri: string, text: string): Promise<string> => {
  try {
    // Check connectivity first
    const isConnected = await checkNetworkConnectivity();
    if (!isConnected) {
      throw new HandwritingError(
        'No internet connection. Complex word clarification requires internet connectivity.',
        'NETWORK_CONNECTIVITY_ERROR'
      );
    }
    
    // Convert image to base64
    const imageBase64 = await imageToBase64(imageUri);
    
    // Try to use the tRPC endpoint
    try {
      const result = await trpcClient.transcription.enhance.mutate({
        imageBase64,
        text,
        type: 'complex-words'
      });
      
      return result.text;
    } catch (trpcError) {
      console.error('tRPC complex word clarification error:', trpcError);
      
      // Check if this was a timeout error
      if (trpcError.message?.includes('timeout') || 
          trpcError.message?.includes('aborted') ||
          trpcError.code === 'ENHANCEMENT_TIMEOUT') {
        throw new HandwritingError(
          'Complex word clarification timed out. Please try again later.',
          'ENHANCEMENT_TIMEOUT'
        );
      }
      // If we're in development mode, provide a more helpful error
      if (__DEV__) {
        if (trpcError.message?.includes('Failed to fetch') || 
            trpcError.message?.includes('Network Error') ||
            trpcError.message?.includes('Unable to resolve host')) {
          console.log('Development server connection issue detected');
          
          // Fallback to returning the original text
          return text;
        }
      }
      
      // For any other error, throw a generic error
      throw new HandwritingError(
        'Failed to clarify complex words. Please try again later.',
        'ENHANCEMENT_ERROR',
        { originalError: trpcError }
      );
    }
  } catch (error) {
    // If it's already a HandwritingError, just rethrow it
    if (error instanceof HandwritingError) {
      throw error;
    }
    
    // Otherwise, wrap it in a HandwritingError
    console.error('Error clarifying complex words:', error);
    
    throw new HandwritingError(
      'Failed to clarify complex words. Please try again later.',
      'UNKNOWN_ERROR',
      { originalError: error }
    );
  }
};
/**
 * Get recommended AI tools for handwriting recognition and enhancement
 * @returns Array of recommended AI tools
 */
export const getRecommendedAITools = (): Array<{name: string, description: string, url: string, free: boolean}> => {
  return [
    {
      name: "Tesseract.js",
      description: "Open-source OCR engine that works in the browser and Node.js",
      url: "https://tesseract.projectnaptha.com/",
      free: true
    },
    {
      name: "EasyOCR",
      description: "Python library for OCR with support for 80+ languages",
      url: "https://github.com/JaidedAI/EasyOCR",
      free: true
    },
    {
      name: "Google Cloud Vision API",
      description: "Powerful OCR with free tier (1000 requests/month)",
      url: "https://cloud.google.com/vision",
      free: true
    },
    {
      name: "Microsoft Azure Computer Vision",
      description: "OCR and image analysis with free tier",
      url: "https://azure.microsoft.com/services/cognitive-services/computer-vision/",
      free: true
    },
    {
      name: "Hugging Face Transformers",
      description: "Open-source NLP models for text enhancement",
      url: "https://huggingface.co/transformers/",
      free: true
    }
  ];
};
      
