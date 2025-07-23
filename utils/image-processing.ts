import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
import { MAX_IMAGE_SIZE } from './image';

export type ImageFilter = 'none' | 'enhance' | 'blackAndWhite' | 'sharpen';

interface ProcessImageOptions {
  compress?: boolean;
  resize?: boolean;
  filter?: ImageFilter;
}

export const processImage = async (
  uri: string,
  options: ProcessImageOptions = {}
) => {
  try {
    const actions: ImageManipulator.Action[] = [];

    // Always resize large images
    if (options.resize) {
      actions.push({
        resize: {
          width: 1920, // Max width while maintaining aspect ratio
        },
      });
    }

    // Apply filters
    if (options.filter) {
      switch (options.filter) {
        case 'blackAndWhite':
          actions.push({ manipulate: { saturate: -1 } });
          break;
        case 'enhance':
          actions.push(
            { manipulate: { contrast: 1.2 } },
            { manipulate: { brightness: 1.1 } }
          );
          break;
        case 'sharpen':
          actions.push({ manipulate: { sharpen: 1 } });
          break;
      }
    }

    // Process the image
    const result = await ImageManipulator.manipulateAsync(
      uri,
      actions,
      {
        compress: options.compress ? 0.8 : 1,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    return result.uri;
  } catch (error) {
    console.error('Error processing image:', error);
    throw error;
  }
};

export const optimizeImageForOCR = async (uri: string) => {
  return processImage(uri, {
    compress: true,
    resize: true,
    filter: 'enhance',
  });
};
