import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Platform, LogBox, Alert } from "react-native";
import { ErrorBoundary } from "./error-boundary";
import Colors from "@/constants/colors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc, trpcClient } from "@/lib/trpc";
import { initAnalytics } from "@/utils/analytics";
import { AccessibilityProvider } from "@/contexts/accessibility-context";
import NetInfo from '@react-native-community/netinfo';

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

// Ignore specific warnings that might be related to network issues
LogBox.ignoreLogs([
  "Network request failed",
  "Unhandled promise rejection",
  "Error evaluating injectedJavaScript",
  "Native splash screen is already hidden",
  "Failed to register service worker",
  "Possible Unhandled Promise Rejection",
  "Require cycle",
  "Remote debugger",
  "Expo Go",
  "java.io.IOException",
  "Remote update request not successful",
  "Unable to resolve host",
  "connect ECONNREFUSED",
  "Failed to fetch",
  "AbortError",
  "signal is aborted"
]);

if (DEBUG) console.log('Creating QueryClient with custom configuration');

// Create a client with retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        // Log retry attempts
        if (DEBUG) console.log(`Query retry attempt ${failureCount}:`, error);
        
        // Don't retry if we have a specific error that shouldn't be retried
        if (error?.message?.includes('NETWORK_CONNECTIVITY_ERROR')) {
          if (DEBUG) console.log('Not retrying due to connectivity error');
          return false;
        }
        
        // Don't retry AbortErrors
        if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
          if (DEBUG) console.log('Not retrying aborted request');
          return false;
        }
        
        // Retry up to 5 times for network errors
        if (error?.message?.includes('network') || 
            error?.message?.includes('fetch') || 
            error?.message?.includes('Network request failed')) {
          return failureCount < 5;
        }
        
        return failureCount < 3; // Retry up to 3 times for other errors
      },
      retryDelay: attemptIndex => {
        const delay = Math.min(1000 * 2 ** attemptIndex, 30000);
        if (DEBUG) console.log(`Setting retry delay: ${delay}ms`);
        return delay;
      }, // Exponential backoff
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
    mutations: {
      retry: (failureCount, error) => {
        // Log retry attempts
        if (DEBUG) console.log(`Mutation retry attempt ${failureCount}:`, error);
        
        // Don't retry if we have a specific error that shouldn't be retried
        if (error?.message?.includes('NETWORK_CONNECTIVITY_ERROR')) {
          if (DEBUG) console.log('Not retrying due to connectivity error');
          return false;
        }
        
        // Don't retry AbortErrors
        if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
          if (DEBUG) console.log('Not retrying aborted request');
          return false;
        }
        
        // Retry up to 3 times for network errors
        if (error?.message?.includes('network') || 
            error?.message?.includes('fetch') || 
            error?.message?.includes('Network request failed')) {
          return failureCount < 3;
        }
        
        return failureCount < 2; // Retry up to 2 times for other errors
      },
      retryDelay: attemptIndex => {
        const delay = Math.min(1000 * 2 ** attemptIndex, 15000);
        if (DEBUG) console.log(`Setting mutation retry delay: ${delay}ms`);
        return delay;
      }, // Exponential backoff
    },
  },
});

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  // Use a more reliable approach for loading fonts
  // Instead of loading from a URL, we'll use local fonts only
  const [loaded, error] = useFonts({
    ...FontAwesome.font,
    // No remote fonts to avoid network errors
  });

  // Monitor network state
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      console.log('Connection type:', state.type);
      console.log('Is connected?', state.isConnected);
      console.log('Is internet reachable?', state.isInternetReachable);
      
      // TEMPORARY FIX: Show a helpful message for first-time users about tunnel mode
      if (__DEV__ && !state.isConnected && Platform.OS === 'android') {
        Alert.alert(
          "Connection Issue Detected",
          "If you're having trouble connecting to the Expo server, try restarting your development server with 'expo start --tunnel' command in your terminal.",
          [
            { text: "OK" },
            { 
              text: "More Help",
              onPress: () => {
                // We can't use router here because it might not be initialized yet
                // So we'll just show another alert with more detailed instructions
                Alert.alert(
                  "Expo Tunnel Mode",
                  "1. Stop your current Expo server (Ctrl+C)\n2. Run: npx expo start --tunnel\n3. This creates a secure tunnel that works even if your phone and computer are on different networks",
                  [{ text: "OK" }]
                );
              }
            }
          ]
        );
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (error) {
      console.error('Font loading error:', error);
      // Don't throw the error, just log it and continue
      // This prevents the app from crashing on font loading issues
      SplashScreen.hideAsync().catch(e => {
        console.warn('Error hiding splash screen:', e);
      });
    }
  }, [error]);

  useEffect(() => {
    if (loaded) {
      if (DEBUG) console.log('Fonts loaded, hiding splash screen');
      SplashScreen.hideAsync().catch(e => {
        console.warn('Error hiding splash screen:', e);
      });
      initAnalytics();
    }
  }, [loaded]);

  // Continue with app initialization even if fonts fail to load
  // This ensures the app doesn't get stuck on the splash screen
  if (!loaded && !error) {
    return null;
  }

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AccessibilityProvider>
            <RootLayoutNav />
          </AccessibilityProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

function RootLayoutNav() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.light.background,
        },
        headerShadowVisible: false,
        headerTintColor: Colors.light.primary,
        headerTitleStyle: {
          fontWeight: "600",
        },
        contentStyle: {
          backgroundColor: Colors.light.background,
        },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="transcription/[id]"
        options={{
          title: "Transcription Details",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="transcription/edit/[id]"
        options={{
          title: "Edit Transcription",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="transcription/share/[id]"
        options={{
          title: "Share Transcription",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="transcription/collaborate/[id]"
        options={{
          title: "Collaborate",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="capture"
        options={{
          title: "Capture Handwriting",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="process"
        options={{
          title: "Processing",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="language-settings"
        options={{
          title: "Language Settings",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="voice-annotation/[id]"
        options={{
          title: "Voice Annotation",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="visualization/[id]"
        options={{
          title: "Visualization",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="research/[id]"
        options={{
          title: "Research",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="accessibility"
        options={{
          title: "Accessibility",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="integrations"
        options={{
          title: "Integrations",
          animation: "slide_from_right",
        }}
      />
      <Stack.Screen
        name="offline"
        options={{
          title: "Offline Mode",
          animation: "slide_from_right",
        }}
      />
    </Stack>
  );
  }
