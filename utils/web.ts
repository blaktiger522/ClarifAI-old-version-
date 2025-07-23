import * as WebBrowser from 'expo-web-browser';
import { Platform, Linking } from 'react-native';

/**
 * Opens a web search for the given term
 * @param term The term to search for
 */
export async function searchWeb(term: string): Promise<void> {
  if (!term) return;
  
  const encodedTerm = encodeURIComponent(term);
  const searchUrl = `https://www.google.com/search?q=${encodedTerm}`;
  
  try {
    if (Platform.OS === 'web') {
      // On web, open in a new tab
      window.open(searchUrl, '_blank');
    } else {
      // On mobile, use WebBrowser for a better experience
      await WebBrowser.openBrowserAsync(searchUrl);
    }
  } catch (error) {
    console.error('Error opening browser:', error);
    // Fallback to basic linking
    await Linking.openURL(searchUrl);
  }
}
