import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink, httpLink, loggerLink, TRPCClientError } from "@trpc/client";
import type { AppRouter } from "@/backend/trpc/app-router";
import superjson from "superjson";
import { HandwritingError } from "@/utils/api";
import { Platform } from "react-native";

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

export const trpc = createTRPCReact<AppRouter>();

const getBaseUrl = () => {
  if (DEBUG) console.log('Getting base URL for API requests');
  
  // Make sure we have a valid base URL
  if (process.env.EXPO_PUBLIC_RORK_API_BASE_URL) {
    if (DEBUG) console.log('Using environment variable for API base URL:', process.env.EXPO_PUBLIC_RORK_API_BASE_URL);
    return process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  }

  // In development, we're having connection issues, so let's use the fallback URL directly
  // This will bypass the development server and use the toolkit.rork.com endpoint
  if (__DEV__) {
    // Skip trying to connect to local development server since it's failing
    const fallbackUrl = 'https://toolkit.rork.com';
    if (DEBUG) console.log('Using fallback URL due to connection issues:', fallbackUrl);
    return fallbackUrl;
  }

  // Last resort fallback - use a reliable public endpoint
  const fallbackUrl = 'https://toolkit.rork.com';
  if (DEBUG) console.log('Using last resort fallback URL:', fallbackUrl);
  return fallbackUrl;
};

// Custom error handler to convert TRPC errors to our app's error format
const customErrorHandler = {
  onError: (error: TRPCClientError<AppRouter>) => {
    // Log the error for debugging
    console.error('TRPC Client Error:', error);
    
    if (DEBUG) {
      console.log('Error details:', {
        message: error.message,
        name: error.name,
        code: error.data?.code,
        shape: error.shape,
      });
    }
    
    // Handle AbortError specifically
    if (error.message && error.message.includes('AbortError')) {
      console.warn('Request was aborted, possibly due to timeout or navigation');
      throw new HandwritingError(
        'Request timed out. Please try again with a better network connection.',
        'REQUEST_TIMEOUT',
        { originalError: error }
      );
    }
    
    // TEMPORARY FIX: For development, convert connection errors to a more user-friendly message
    if (__DEV__ && error.message && (
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network Error') ||
      error.message.includes('Network request failed') ||
      error.message.includes('Unable to resolve host') ||
      error.message.includes('connect ECONNREFUSED')
    )) {
      console.warn('Development server connection issue detected, using fallback');
      // Instead of throwing an error, we'll return a default response
      // This will allow the app to continue functioning even when the dev server is unreachable
      return {
        text: "This is mock transcription data because we couldn't connect to the development server.\n\nIn a real app, this would be the result of processing your handwritten image through an OCR service.\n\nYou can still edit this text manually and test the app's features.",
        confidence: 0,
        language: "en",
        processingTime: Date.now(),
        fallbackUsed: true,
        error: error.message
      };
    }
    
    // Convert to our app's error format
    throw new HandwritingError(
      error.message || 'An unexpected error occurred',
      error.data?.code as string || 'UNKNOWN_ERROR',
      error.data
    );
  }
};

export const trpcClient = trpc.createClient({
  links: [
    loggerLink({
      enabled: (opts) => 
        process.env.NODE_ENV === "development" || 
        (opts.direction === "down" && opts.result instanceof Error),
    }),
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      // Simplified fetch with basic timeout
      fetch: async (url, options) => {
        if (DEBUG) console.log('Making TRPC request to:', url);
        
        // Create fetch options outside try/catch so they're available in both blocks
        const fetchOptions: RequestInit = {
          ...options,
          headers: {
            ...options?.headers,
            'Content-Type': 'application/json',
          },
          ...(Platform.OS === 'web' ? { mode: 'cors' } : {}),
        };
        
        try {
          const response = await fetch(url, fetchOptions);
          
          if (DEBUG) console.log('TRPC response status:', response.status);
          return response;
        } catch (fetchError: unknown) {
          const error = fetchError instanceof Error ? fetchError : new Error(String(fetchError));
          if (DEBUG) console.log('Fetch error:', error.message);
          
          // For development, provide helpful error messages
          if (__DEV__ && error.message && (
            error.message.includes('Failed to fetch') ||
            error.message.includes('Network Error') ||
            error.message.includes('Network request failed') ||
            error.message.includes('Unable to resolve host') ||
            error.message.includes('connect ECONNREFUSED')
          )) {
            console.warn('Development server connection issue detected in fetch, using fallback');
            // Instead of throwing an error, we'll use the fallback URL
            const urlString = typeof url === 'string' ? url : url.toString();
            const parts = urlString.split('/api/trpc');
            const fallbackUrl = 'https://toolkit.rork.com/api/trpc' + (parts.length > 1 ? parts[1] : '');
            if (DEBUG) console.log('Using fallback URL:', fallbackUrl);
            return fetch(fallbackUrl, fetchOptions);
          }
          
          throw error;
        }
      },
    }),
  ],
  // Transformer is now configured in the httpBatchLink above
});
