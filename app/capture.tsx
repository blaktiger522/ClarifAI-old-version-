import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Image as ImageIcon } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import Button from '@/components/Button';
import { isImageTooLarge, MAX_IMAGE_SIZE, formatFileSize } from '@/utils/image';

export default function CaptureScreen() {
  const router = useRouter();
  const { setCurrentImage } = useTranscriptionStore();
  
  const handleClose = () => {
    router.back();
  };

  const handleTakePhoto = async () => {
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const capturedImage = result.assets[0];
      
      // Check if the image is too large
      const isTooLarge = await isImageTooLarge(capturedImage.uri);
      
      if (isTooLarge) {
        Alert.alert(
          'Image Too Large',
          `The captured image exceeds the maximum size limit of ${formatFileSize(MAX_IMAGE_SIZE)}. Please try again with a lower resolution or crop the image.`
        );
        return;
      }
      
      setCurrentImage(capturedImage.uri);
      router.replace('/process');
    }
  };

  const handlePickImage = async () => {
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
      router.replace('/process');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
          <X size={24} color={Colors.light.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Capture Handwriting</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.cameraPlaceholder}>
          <Camera size={64} color={Colors.light.border} />
          <Text style={styles.placeholderText}>
            Take a clear photo of your handwritten text
          </Text>
        </View>

        <View style={styles.tips}>
          <Text style={styles.tipsTitle}>Tips for best results:</Text>
          <Text style={styles.tipItem}>• Ensure good lighting</Text>
          <Text style={styles.tipItem}>• Keep the paper flat</Text>
          <Text style={styles.tipItem}>• Capture the entire text</Text>
          <Text style={styles.tipItem}>• Avoid shadows and glare</Text>
          <Text style={styles.tipItem}>• Maximum image size: {formatFileSize(MAX_IMAGE_SIZE)}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Take Photo"
          onPress={handleTakePhoto}
          icon={<Camera size={20} color="#FFFFFF" />}
          style={styles.button}
        />
        <Button
          title="Choose from Library"
          onPress={handlePickImage}
          variant="outline"
          icon={<ImageIcon size={20} color={Colors.light.primary} />}
          style={styles.button}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  cameraPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 16,
    padding: 48,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    maxWidth: 240,
  },
  tips: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
  actions: {
    padding: 16,
    gap: 12,
  },
  button: {
    marginBottom: 8,
  },
});
