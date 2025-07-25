import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, SafeAreaView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Upload, Sparkles, Calculator, Search, MessageSquareText } from 'lucide-react-native';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import EmptyState from '@/components/EmptyState';
import TranscriptionCard from '@/components/TranscriptionCard';
import { isImageTooLarge, MAX_IMAGE_SIZE, formatFileSize } from '@/utils/image';

export default function HomeScreen() {
  const router = useRouter();
  const { transcriptions, setCurrentImage } = useTranscriptionStore();
  const recentTranscriptions = transcriptions.slice(0, 3);

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need camera permissions to capture handwriting');
      return;
    }

    router.push('/capture');
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'We need media library permissions to select images');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0];
      
      // Check if the image is too large
      const isTooLarge = await isImageTooLarge(selectedImage.uri);
      
      if (isTooLarge) {
        Alert.alert(
          'Image Too Large',
          `The selected image exceeds the maximum size limit of ${formatFileSize(MAX_IMAGE_SIZE)}. Please select a smaller image.`
        );
        return;
      }
      
      setCurrentImage(selectedImage.uri);
      router.push('/process');
    }
  };

  const handleTranscriptionPress = (transcription: any) => {
    router.push(`/transcription/${transcription.id}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>Handwrite AI</Text>
          <Text style={styles.subtitle}>
            Transform handwritten notes into clear, digital text
          </Text>
        </View>

        <View style={styles.imageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1527168027773-0cc890c4f42e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={styles.actionsContainer}>
          <Button
            title="Take Photo"
            onPress={handleTakePhoto}
            icon={<Camera size={20} color="#FFFFFF" />}
            style={styles.actionButton}
          />
          <Button
            title="Upload Image"
            onPress={handlePickImage}
            variant="outline"
            icon={<Upload size={20} color={Colors.light.primary} />}
            style={styles.actionButton}
          />
        </View>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Features</Text>
          <View style={styles.featureCards}>
            <View style={styles.featureCard}>
              <Sparkles size={24} color={Colors.light.primary} />
              <Text style={styles.featureTitle}>Smart Enhancement</Text>
              <Text style={styles.featureDescription}>
                Advanced AI technology that improves text clarity and ensures words make sense in context
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Calculator size={24} color={Colors.light.primary} />
              <Text style={styles.featureTitle}>Number Clarity</Text>
              <Text style={styles.featureDescription}>
                Special processing to ensure numbers are accurately transcribed for financial notes and data
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <Search size={24} color={Colors.light.primary} />
              <Text style={styles.featureTitle}>Term Search</Text>
              <Text style={styles.featureDescription}>
                Easily search for unclear terms, medicine names, or any word you need to verify or learn more about
              </Text>
            </View>
            
            <View style={styles.featureCard}>
              <MessageSquareText size={24} color={Colors.light.primary} />
              <Text style={styles.featureTitle}>Context Suggestions</Text>
              <Text style={styles.featureDescription}>
                Get smart word suggestions for unclear text based on sentence context and meaning
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.recentContainer}>
          <Text style={styles.sectionTitle}>Recent Transcriptions</Text>
          
          {recentTranscriptions.length > 0 ? (
            <>
              {recentTranscriptions.map((transcription) => (
                <TranscriptionCard
                  key={transcription.id}
                  transcription={transcription}
                  onPress={handleTranscriptionPress}
                />
              ))}
              
              {transcriptions.length > 3 && (
                <Button
                  title="View All"
                  onPress={() => router.push('/history')}
                  variant="outline"
                  style={styles.viewAllButton}
                />
              )}
            </>
          ) : (
            <EmptyState
              title="No transcriptions yet"
              description="Capture or upload an image to get started"
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  imageContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    height: 200,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
  },
  featuresContainer: {
    marginBottom: 32,
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  featureCards: {
    gap: 12,
  },
  featureCard: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginTop: 12,
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  recentContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  viewAllButton: {
    marginTop: 12,
  },
});
