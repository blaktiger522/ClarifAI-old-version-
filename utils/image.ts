import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { HandwritingError } from '@/types/shared';

// Debug flag - set to true to enable verbose logging
const DEBUG = true;

// 10MB in bytes
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

/**
 * Checks if an image file exceeds the maximum allowed size
 * @param uri The URI of the image file
 * @returns Promise<boolean> True if the file is too large, false otherwise
 */
export async function isImageTooLarge(uri: string): Promise<boolean> {
  try {
    if (DEBUG) console.log('Checking if image is too large:', uri.substring(0, 30) + '...');
    
    // On web, we can't easily check file size with FileSystem
    if (Platform.OS === 'web') {
      // For web, we'll try to get the file size using fetch
      try {
        if (DEBUG) console.log('Using fetch HEAD request to check file size on web');
        const response = await fetch(uri, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
          const size = parseInt(contentLength, 10);
          if (DEBUG) console.log(`Web image size: ${size} bytes`);
          return size > MAX_IMAGE_SIZE;
        }
      } catch (error) {
        console.warn('Could not check file size on web:', error);
      }
      // If we can't determine size, assume it's within limits
      if (DEBUG) console.log('Could not determine web image size, assuming within limits');
      return false;
    }
    
    const fileInfo = await FileSystem.getInfoAsync(uri);
    
    if (!fileInfo.exists) {
      console.error('File does not exist');
      throw new HandwritingError(
        'Image file not found',
        'FILE_NOT_FOUND_ERROR'
      );
    }
    
    if (DEBUG) console.log(`Native image size: ${fileInfo.size} bytes`);
    return fileInfo.size > MAX_IMAGE_SIZE;
  } catch (error) {
    console.error('Error checking file size:', error);
    if (error instanceof HandwritingError) {
      throw error;
    }
    // If we can't check the size, assume it's within limits
    if (DEBUG) console.log('Error checking image size, assuming within limits');
    return false;
  }
}

/**
 * Validates an image file and returns its size
 * @param uri The URI of the image file
 * @returns Promise<number> The size of the file in bytes
 * @throws HandwritingError if the file doesn't exist or can't be accessed
 */
export async function validateImageFile(uri: string): Promise<number> {
  try {
    if (DEBUG) console.log('Validating image file:', uri.substring(0, 30) + '...');
    
    if (Platform.OS === 'web') {
      try {
        if (DEBUG) console.log('Validating web image with fetch');
        
        // For web, we need to handle data URLs differently
        if (uri.startsWith('data:')) {
          if (DEBUG) console.log('Image is a data URL, estimating size');
          // For data URLs, we can estimate the size from the base64 content
          const commaIndex = uri.indexOf(',');
          if (commaIndex !== -1) {
            const base64 = uri.slice(commaIndex + 1);
            // Base64 encodes 3 bytes into 4 characters, so we can estimate the size
            const estimatedSize = Math.ceil(base64.length * 0.75);
            if (DEBUG) console.log(`Estimated data URL size: ${estimatedSize} bytes`);
            return estimatedSize;
          }
          return 0; // Can't determine size
        }
        
        const response = await fetch(uri, { method: 'HEAD' });
        if (!response.ok) {
          throw new HandwritingError(
            'Failed to access image file',
            'FILE_ACCESS_ERROR'
          );
        }
        
        const contentLength = response.headers.get('content-length');
        const size = contentLength ? parseInt(contentLength, 10) : 0;
        if (DEBUG) console.log(`Web image validated, size: ${size} bytes`);
        return size;
      } catch (error) {
        if (DEBUG) console.log('Error validating web image:', error);
        if (error instanceof HandwritingError) {
          throw error;
        }
        // For web, if we can't validate, assume it's valid with a small size
        if (DEBUG) console.log('Could not validate web image, assuming valid with small size');
        return 1000; // Assume a small size
      }
    } else {
      if (DEBUG) console.log('Validating native image with FileSystem');
      
      // Handle file:// URLs
      const fileUri = uri.startsWith('file://') ? uri : uri;
      
      try {
        const fileInfo = await FileSystem.getInfoAsync(fileUri);
        
        if (!fileInfo.exists) {
          throw new HandwritingError(
            'Image file not found',
            'FILE_NOT_FOUND_ERROR'
          );
        }
        
        if (DEBUG) console.log(`Native image validated, size: ${fileInfo.size} bytes`);
        return fileInfo.size;
      } catch (error) {
        if (DEBUG) console.log('Error getting file info:', error);
        
        // Try a different approach for content:// URIs on Android
        if (uri.startsWith('content://')) {
          if (DEBUG) console.log('Trying alternative approach for content:// URI');
          // For content:// URIs, we can't easily get the size
          // Assume it's valid with a moderate size
          return 5000000; // Assume 5MB
        }
        
        throw error;
      }
    }
  } catch (error) {
    console.error('Error validating image file:', error);
    if (error instanceof HandwritingError) {
      throw error;
    }
    throw new HandwritingError(
      'Failed to validate image file',
      'FILE_VALIDATION_ERROR',
      error
    );
  }
}

/**
 * Formats a file size in bytes to a human-readable string
 * @param bytes File size in bytes
 * @returns Formatted string (e.g., "5.2 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return bytes + ' B';
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + ' KB';
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
          }
