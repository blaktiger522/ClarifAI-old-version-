import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';
import { Transcription } from '@/types';
import { logEvent } from './analytics';

const generateHtml = (transcription: Transcription) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
  <style>
    body { font-family: -apple-system, system-ui, BlinkMacSystemFont, "Segoe UI", Roboto; padding: 20px; }
    .image { max-width: 100%; height: auto; margin: 20px 0; border-radius: 8px; }
    .title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
    .date { color: #666; margin-bottom: 20px; }
    .text { line-height: 1.6; }
  </style>
</head>
<body>
  <h1 class="title">${transcription.title}</h1>
  <div class="date">${new Date(transcription.createdAt).toLocaleDateString()}</div>
  <img src="${transcription.imageUri}" class="image" />
  <div class="text">${transcription.enhancedText}</div>
</body>
</html>
`;

export const exportToPDF = async (transcription: Transcription) => {
  try {
    const html = generateHtml(transcription);
    const { uri } = await Print.printToFileAsync({
      html,
      base64: false,
    });

    if (Platform.OS === 'ios') {
      await Sharing.shareAsync(uri, {
        UTI: '.pdf',
        mimeType: 'application/pdf',
      });
    } else {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
      });
    }

    await logEvent(Events.EXPORT_PDF, {
      transcriptionId: transcription.id,
    });

    return uri;
  } catch (error) {
    console.error('Error exporting PDF:', error);
    throw error;
  }
};

export const exportToText = async (transcription: Transcription) => {
  try {
    const text = `${transcription.title}\n\n${transcription.enhancedText}`;
    const path = `${FileSystem.cacheDirectory}${transcription.id}.txt`;
    
    await FileSystem.writeAsStringAsync(path, text);

    await Sharing.shareAsync(path, {
      mimeType: 'text/plain',
      UTI: 'public.plain-text',
    });

    await logEvent(Events.EXPORT_TEXT, {
      transcriptionId: transcription.id,
    });

    return path;
  } catch (error) {
    console.error('Error exporting text:', error);
    throw error;
  }
};
