import React from 'react';
import { View, Text, StyleSheet, Platform, Button, Linking, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import Colors from '@/constants/colors';
import { RefreshCw, WifiOff, AlertTriangle } from 'lucide-react-native';

interface Props {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isNetworkError: boolean;
  connectionInfo: any;
  retryCount: number;
}

const IFRAME_ID = 'rork-web-preview';

const webTargetOrigins = [
  "http://localhost:3000",
  "https://rorkai.com",
  "https://rork.app",
];    

function sendErrorToIframeParent(error: any, errorInfo?: any) {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    console.debug('Sending error to parent:', {
      error,
      errorInfo,
      referrer: document.referrer
    });

    const errorMessage = {
      type: 'ERROR',
      error: {
        message: error?.message || error?.toString() || 'Unknown error',
        stack: error?.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
      },
      iframeId: IFRAME_ID,
    };

    try {
      window.parent.postMessage(
        errorMessage,
        webTargetOrigins.includes(document.referrer) ? document.referrer : '*'
      );
    } catch (postMessageError) {
      console.error('Failed to send error to parent:', postMessageError);
    }
  }
}

if (Platform.OS === 'web' && typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    event.preventDefault();
    const errorDetails = event.error ?? {
      message: event.message ?? 'Unknown error',
      filename: event.filename ?? 'Unknown file',
      lineno: event.lineno ?? 'Unknown line',
      colno: event.colno ?? 'Unknown column'
    };
    sendErrorToIframeParent(errorDetails);
  }, true);

  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    sendErrorToIframeParent(event.reason);
  }, true);

  const originalConsoleError = console.error;
  console.error = (...args) => {
    sendErrorToIframeParent(args.join(' '));
    originalConsoleError.apply(console, args);
  };
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      isNetworkError: false,
      connectionInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error) {
    // Check if it's a network error
    const isNetworkError = 
      error.message.includes('Network request failed') ||
      error.message.includes('java.io.IOException') ||
      error.message.includes('Remote update request not successful') ||
      error.message.includes('NETWORK_ERROR') ||
      error.message.includes('Unable to resolve host') ||
      error.message.includes('connect ECONNREFUSED') ||
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network Error');
    
    return { 
      hasError: true, 
      error,
      isNetworkError
    };
  }

  async componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Check network status
    const connectionInfo = await NetInfo.fetch();
    this.setState({ connectionInfo });
    
    sendErrorToIframeParent(error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRestart = () => {
    // Clear the error state
    this.setState({ hasError: false, error: null });
    
    // For Expo, we can use Linking to restart the app
    if (Platform.OS !== 'web') {
      Linking.openURL('exp://');
    } else {
      // For web, just reload the page
      window.location.reload();
    }
  };

  handleTryAgain = () => {
    // Increment retry count
    this.setState(prevState => ({ 
      hasError: false, 
      error: null,
      retryCount: prevState.retryCount + 1 
    }));
  };

  handleClearCache = async () => {
    // This is a simplified approach - in a real app you'd want to clear specific caches
    if (Platform.OS === 'web') {
      // For web
      if (window.caches) {
        try {
          const cacheNames = await window.caches.keys();
          await Promise.all(cacheNames.map(name => window.caches.delete(name)));
          console.log('Cache cleared');
        } catch (e) {
          console.error('Failed to clear cache:', e);
        }
      }
      // Clear local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reload the page
      window.location.reload();
    } else {
      // For native, we'll just restart the app
      // In a real app, you'd want to clear AsyncStorage and other caches
      this.handleRestart();
    }
  };

  isExpoDevServerError = () => {
    const { error } = this.state;
    if (!error) return false;
    
    return (
      error.message.includes('Remote update request not successful') ||
      error.message.includes('Unable to resolve host exp.host') ||
      error.message.includes('Network request failed') && 
      error.message.includes('exp.host')
    );
  };

  render() {
    if (this.state.hasError) {
      // Network-specific error UI
      if (this.state.isNetworkError) {
        // Special handling for Expo development server errors
        if (this.isExpoDevServerError()) {
          return (
            <View style={styles.container}>
              <View style={styles.content}>
                <WifiOff size={48} color={Colors.light.error} style={styles.icon} />
                <Text style={styles.title}>Expo Development Server Error</Text>
                <Text style={styles.subtitle}>
                  Unable to connect to the Expo development server
                </Text>
                
                <View style={styles.infoBox}>
                  <Text style={styles.description}>
                    This error occurs when your device can't reach the Expo development server. Try these solutions:
                  </Text>
                  
                  <View style={styles.bulletPoints}>
                    <Text style={styles.bulletPoint}>• Make sure your Expo development server is running</Text>
                    <Text style={styles.bulletPoint}>• Check that your phone and computer are on the same network</Text>
                    <Text style={styles.bulletPoint}>• Try restarting the Expo server with 'expo start --tunnel'</Text>
                    <Text style={styles.bulletPoint}>• Disable any VPNs or proxies that might be active</Text>
                    <Text style={styles.bulletPoint}>• Check your computer's firewall settings</Text>
                    <Text style={styles.bulletPoint}>• Restart the Expo Go app</Text>
                    <Text style={styles.bulletPoint}>• Clear the app cache and try again</Text>
                  </View>
                </View>
                
                <View style={styles.buttonContainer}>
                  <TouchableOpacity 
                    style={[styles.button, styles.primaryButton]} 
                    onPress={this.handleTryAgain}
                  >
                    <RefreshCw size={18} color="#FFFFFF" />
                    <Text style={styles.buttonText}>Try Again</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.secondaryButton]} 
                    onPress={this.handleClearCache}
                  >
                    <Text style={styles.secondaryButtonText}>Clear Cache & Restart</Text>
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.errorDetails}>
                  Error: {this.state.error?.message}
                </Text>
                
                {this.state.retryCount > 2 && (
                  <View style={styles.helpBox}>
                    <AlertTriangle size={16} color={Colors.light.warning} />
                    <Text style={styles.helpText}>
                      Still having issues? Try using "expo start --tunnel" in your terminal, then restart the Expo Go app.
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        }
        
        // General network error UI
        return (
          <View style={styles.container}>
            <View style={styles.content}>
              <WifiOff size={48} color={Colors.light.error} style={styles.icon} />
              <Text style={styles.title}>Connection Error</Text>
              <Text style={styles.subtitle}>
                {this.state.connectionInfo?.isConnected 
                  ? "Unable to connect to the server" 
                  : "No internet connection"}
              </Text>
              
              <View style={styles.infoBox}>
                <Text style={styles.description}>
                  {this.state.connectionInfo?.isConnected 
                    ? "The app cannot connect to the server. This might be due to a firewall, VPN, or network configuration issue."
                    : "Please check your internet connection and try again."}
                </Text>
                
                {this.state.connectionInfo?.isConnected && (
                  <View style={styles.bulletPoints}>
                    <Text style={styles.bulletPoint}>• Check your internet connection</Text>
                    <Text style={styles.bulletPoint}>• Disable any VPNs or proxies that might be active</Text>
                    <Text style={styles.bulletPoint}>• Try connecting to a different network</Text>
                    <Text style={styles.bulletPoint}>• Check if the service is down</Text>
                    <Text style={styles.bulletPoint}>• Try using "expo start --tunnel" in your terminal</Text>
                  </View>
                )}
              </View>
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity 
                  style={[styles.button, styles.primaryButton]} 
                  onPress={this.handleTryAgain}
                >
                  <RefreshCw size={18} color="#FFFFFF" />
                  <Text style={styles.buttonText}>Try Again</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.secondaryButton]} 
                  onPress={this.handleClearCache}
                >
                  <Text style={styles.secondaryButtonText}>Clear Cache & Restart</Text>
                </TouchableOpacity>
              </View>
              
              <Text style={styles.errorDetails}>
                Error: {this.state.error?.message}
              </Text>
              
              {this.state.retryCount > 2 && (
                <View style={styles.helpBox}>
                  <AlertTriangle size={16} color={Colors.light.warning} />
                  <Text style={styles.helpText}>
                    Still having issues? Try closing the app completely and reopening it.
                  </Text>
                </View>
              )}
            </View>
          </View>
        );
      }
      
      // General error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertTriangle size={48} color={Colors.light.error} style={styles.icon} />
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.subtitle}>{this.state.error?.message}</Text>
            
            <View style={styles.infoBox}>
              {Platform.OS !== 'web' && (
                <Text style={styles.description}>
                  The app encountered an unexpected error. This might be due to a temporary issue or a problem with the current version.
                </Text>
              )}
            </View>
            
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={[styles.button, styles.primaryButton]} 
                onPress={this.handleTryAgain}
              >
                <RefreshCw size={18} color="#FFFFFF" />
                <Text style={styles.buttonText}>Try Again</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={this.handleRestart}
              >
                <Text style={styles.secondaryButtonText}>Restart App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  infoBox: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  description: {
    fontSize: 14,
    color: Colors.light.text,
    textAlign: 'left',
    marginBottom: 12,
    lineHeight: 20,
  },
  bulletPoints: {
    marginTop: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: Colors.light.text,
    marginBottom: 6,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: Colors.light.text,
    fontSize: 16,
    fontWeight: '500',
  },
  errorDetails: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  helpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.warning + '20',
    borderRadius: 8,
    padding: 12,
    gap: 8,
    width: '100%',
  },
  helpText: {
    fontSize: 14,
    color: Colors.light.text,
    flex: 1,
    lineHeight: 20,
  }
}); 

export default ErrorBoundary;
