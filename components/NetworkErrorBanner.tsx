import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Linking, Alert } from 'react-native';
import { WifiOff, RefreshCw, ExternalLink, HelpCircle } from 'lucide-react-native';
import NetInfo from '@react-native-community/netinfo';
import { checkNetworkConnectivity } from '@/utils/api';
import Colors from '@/constants/colors';
import { useRouter } from 'expo-router';

interface NetworkErrorBannerProps {
  onRetry?: () => void;
}

const NetworkErrorBanner: React.FC<NetworkErrorBannerProps> = ({ onRetry }) => {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const [isCheckingConnection, setIsCheckingConnection] = useState(false);
  const [errorType, setErrorType] = useState<'no-internet' | 'dev-server' | 'general'>('no-internet');
  const slideAnim = React.useRef(new Animated.Value(-100)).current;
  const [retryAttempts, setRetryAttempts] = useState(0);

  // Check connection on mount and set up listener
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setIsCheckingConnection(true);
        
        // TEMPORARY FIX: Always assume we're connected in development mode
        if (__DEV__) {
          // Still check connectivity but don't block the UI
          try {
            const hasConnectivity = await checkNetworkConnectivity();
            setIsConnected(hasConnectivity);
            
            if (!hasConnectivity) {
              // Check if it's a general internet issue or specific to dev server
              const netInfoState = await NetInfo.fetch();
              if (netInfoState.isConnected) {
                setErrorType('dev-server');
                setIsVisible(true);
              } else {
                setErrorType('no-internet');
                setIsVisible(true);
              }
            } else {
              setIsVisible(false);
            }
          } catch (error) {
            console.error('Error in connectivity check:', error);
            // Don't show the banner for development connectivity issues
            setIsConnected(true);
            setIsVisible(false);
          }
        } else {
          // Production mode - normal connectivity check
          const hasConnectivity = await checkNetworkConnectivity();
          setIsConnected(hasConnectivity);
          
          if (!hasConnectivity) {
            // Check if it's a general internet issue
            const netInfoState = await NetInfo.fetch();
            setErrorType('no-internet');
            setIsVisible(true);
          } else {
            setIsVisible(false);
          }
        }
      } catch (error) {
        // Log the error but don't throw it
        console.error('Error checking connectivity:', error);
        
        // Check if it's a dev server error
        if (error.message && (
            error.message.includes('exp.host') || 
            error.message.includes('Remote update request not successful') ||
            error.message.includes('Unable to resolve host')
        )) {
          setErrorType('dev-server');
        } else {
          setErrorType('general');
        }
        
        setIsVisible(true);
      } finally {
        setIsCheckingConnection(false);
      }
    };

    // Initial check
    checkConnection();

    // Set up listener for connection changes
    const unsubscribe = NetInfo.addEventListener(state => {
      const hasConnectivity = state.isConnected === true && state.isInternetReachable !== false;
      setIsConnected(hasConnectivity);
      
      if (!hasConnectivity) {
        if (state.isConnected) {
          setErrorType('dev-server');
        } else {
          setErrorType('no-internet');
        }
        setIsVisible(true);
      } else {
        // Even if NetInfo says we're connected, we should still check actual connectivity
        checkConnection();
      }
    });

    // Clean up listener on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  // Animate banner when visibility changes
  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: isVisible ? 0 : -100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isVisible, slideAnim]);

  const handleRetry = async () => {
    setIsCheckingConnection(true);
    setRetryAttempts(prev => prev + 1);
    
    try {
      const hasConnectivity = await checkNetworkConnectivity();
      setIsConnected(hasConnectivity);
      
      if (!hasConnectivity) {
        // Check if it's a general internet issue or specific to dev server
        const netInfoState = await NetInfo.fetch();
        if (netInfoState.isConnected) {
          setErrorType('dev-server');
        } else {
          setErrorType('no-internet');
        }
        setIsVisible(true);
      } else {
        setIsVisible(false);
        if (onRetry) {
          onRetry();
        }
      }
    } catch (error) {
      // Log the error but don't throw it
      console.error('Error checking connection:', error);
      
      // Check if it's a dev server error
      if (error.message && (
          error.message.includes('exp.host') || 
          error.message.includes('Remote update request not successful') ||
          error.message.includes('Unable to resolve host')
      )) {
        setErrorType('dev-server');
      } else {
        setErrorType('general');
      }
      
      setIsVisible(true);
    } finally {
      setIsCheckingConnection(false);
    }
  };

  const openExpoTroubleshooting = () => {
    Linking.openURL('https://docs.expo.dev/troubleshooting/');
  };

  const showHelpDialog = () => {
    Alert.alert(
      "Connection Troubleshooting",
      errorType === 'dev-server' 
        ? "To fix Expo server connection issues:\n\n1. Make sure your phone and computer are on the same network\n2. Try restarting the Expo server with 'expo start --tunnel'\n3. Disable any VPNs or proxies\n4. Check your computer's firewall settings\n5. Restart the Expo Go app"
        : "To fix internet connection issues:\n\n1. Check your WiFi or mobile data connection\n2. Try switching between WiFi and mobile data\n3. Restart your device\n4. Check if other apps can access the internet",
      [
        { text: "OK", style: "default" },
        { 
          text: "More Help", 
          onPress: openExpoTroubleshooting,
          style: "default" 
        }
      ]
    );
  };

  const handleViewTroubleshooting = () => {
    router.push('/offline');
  };

  if (isConnected && !isVisible) {
    return null;
  }

  return (
    <Animated.View 
      style={[
        styles.container,
        { transform: [{ translateY: slideAnim }] }
      ]}
    >
      <View style={styles.content}>
        <WifiOff size={20} color="#fff" />
        <Text style={styles.text}>
          {errorType === 'dev-server' 
            ? "Can't connect to Expo server" 
            : errorType === 'general'
              ? "Connection error"
              : "No internet connection"}
        </Text>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.helpButton} 
          onPress={showHelpDialog}
        >
          <HelpCircle size={16} color="#fff" />
        </TouchableOpacity>
        
        {errorType === 'dev-server' && (
          <TouchableOpacity 
            style={styles.helpButton} 
            onPress={handleViewTroubleshooting}
          >
            <ExternalLink size={16} color="#fff" />
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleRetry}
          disabled={isCheckingConnection}
        >
          <RefreshCw 
            size={18} 
            color="#fff" 
            style={[
              isCheckingConnection && styles.spinning
            ]} 
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 0,
    right: 0,
    backgroundColor: '#ff3b30',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  text: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  retryButton: {
    padding: 8,
  },
  helpButton: {
    padding: 8,
    marginRight: 4,
  },
  spinning: {
    transform: [{ rotate: '45deg' }],
  },
});

export default NetworkErrorBanner;
