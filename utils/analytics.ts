import * as Amplitude from 'expo-analytics-amplitude';

const AMPLITUDE_API_KEY = process.env.EXPO_PUBLIC_AMPLITUDE_API_KEY;

export const initAnalytics = async () => {
  if (AMPLITUDE_API_KEY) {
    await Amplitude.initializeAsync(AMPLITUDE_API_KEY);
  }
};

export const logEvent = async (
  eventName: string,
  properties?: Record<string, any>
) => {
  if (AMPLITUDE_API_KEY) {
    await Amplitude.logEventWithPropertiesAsync(eventName, properties);
  }
};

export const setUserProperties = async (
  properties: Record<string, any>
) => {
  if (AMPLITUDE_API_KEY) {
    await Amplitude.setUserPropertiesAsync(properties);
  }
};

export const Events = {
  APP_OPEN: 'app_opened',
  TUTORIAL_START: 'tutorial_started',
  TUTORIAL_COMPLETE: 'tutorial_completed',
  TUTORIAL_STEP: 'tutorial_step_viewed',
  IMAGE_CAPTURE: 'image_captured',
  IMAGE_PROCESS: 'image_processed',
  TEXT_ENHANCED: 'text_enhanced',
  EXPORT_PDF: 'exported_pdf',
  EXPORT_TEXT: 'exported_text',
  SEARCH_PERFORMED: 'search_performed',
  FILTER_APPLIED: 'filter_applied',
  SYNC_STARTED: 'sync_started',
  SYNC_COMPLETED: 'sync_completed',
  SYNC_FAILED: 'sync_failed',
  ERROR_OCCURRED: 'error_occurred',
};
