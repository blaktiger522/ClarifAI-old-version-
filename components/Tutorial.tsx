import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { Camera, Image, Wand2, Share2, Search, CloudSync } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useOnboardingStore } from '@/store/onboarding-store';
import { logEvent, Events } from '@/utils/analytics';

const TUTORIAL_STEPS = [
  {
    title: 'Capture or Upload',
    description: 'Take a photo of your handwritten notes or upload an existing image',
    icon: <Camera size={32} color={Colors.light.primary} />,
  },
  {
    title: 'Smart Enhancement',
    description: 'Our AI will enhance the text and improve clarity automatically',
    icon: <Wand2 size={32} color={Colors.light.primary} />,
  },
  {
    title: 'Export & Share',
    description: 'Export as PDF or text, and share with anyone',
    icon: <Share2 size={32} color={Colors.light.primary} />,
  },
  {
    title: 'Search & Organize',
    description: 'Easily find any text in your transcriptions',
    icon: <Search size={32} color={Colors.light.primary} />,
  },
  {
    title: 'Always Available',
    description: 'Your notes sync automatically and work offline',
    icon: <CloudSync size={32} color={Colors.light.primary} />,
  },
];

export default function Tutorial() {
  const { width } = useWindowDimensions();
  const { currentStep, setCurrentStep, setHasCompletedTutorial } = useOnboardingStore();

  const handleNext = () => {
    logEvent(Events.TUTORIAL_STEP, { step: currentStep + 1 });
    
    if (currentStep === TUTORIAL_STEPS.length - 1) {
      setHasCompletedTutorial(true);
      logEvent(Events.TUTORIAL_COMPLETE);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSkip = () => {
    setHasCompletedTutorial(true);
    logEvent(Events.TUTORIAL_COMPLETE, { skipped: true });
  };

  return (
    <Modal
      visible={!useOnboardingStore().hasCompletedTutorial}
      transparent
      animationType="fade"
    >
      <View style={styles.container}>
        <View style={[styles.card, { width: width - 48 }]}>
          <View style={styles.step}>
            {TUTORIAL_STEPS[currentStep].icon}
            <Text style={styles.title}>
              {TUTORIAL_STEPS[currentStep].title}
            </Text>
            <Text style={styles.description}>
              {TUTORIAL_STEPS[currentStep].description}
            </Text>
          </View>

          <View style={styles.progress}>
            {TUTORIAL_STEPS.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  index === currentStep && styles.activeDot,
                ]}
              />
            ))}
          </View>

          <View style={styles.buttons}>
            <TouchableOpacity
              onPress={handleSkip}
              style={[styles.button, styles.skipButton]}
            >
              <Text style={styles.skipButtonText}>Skip</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleNext}
              style={[styles.button, styles.nextButton]}
            >
              <Text style={styles.nextButtonText}>
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    padding: 24,
    maxWidth: 400,
  },
  step: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  progress: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 24,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.border,
  },
  activeDot: {
    backgroundColor: Colors.light.primary,
    width: 16,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  skipButton: {
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  skipButtonText: {
    color: Colors.light.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    backgroundColor: Colors.light.primary,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
