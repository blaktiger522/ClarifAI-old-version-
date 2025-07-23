import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Colors from '@/constants/colors';

interface CompletedTextDisplayProps {
  text: string;
  style?: object;
}

const CompletedTextDisplay: React.FC<CompletedTextDisplayProps> = ({ text, style }) => {
  // Parse the text to identify bracketed additions
  const renderFormattedText = () => {
    if (!text) return null;
    
    // Split the text by brackets to identify additions
    const regex = /(\[[^\]]+\])/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      // Check if this part is a bracketed addition
      if (part.startsWith('[') && part.endsWith(']')) {
        // Remove the brackets and highlight the addition
        const addition = part.substring(1, part.length - 1);
        return (
          <Text key={index} style={styles.addition}>
            {addition}
          </Text>
        );
      }
      
      // Regular text
      return <Text key={index} style={styles.regularText}>{part}</Text>;
    });
  };

  return (
    <View style={[styles.container, style]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.textContainer}>
          {renderFormattedText()}
        </Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  scrollContent: {
    padding: 12,
  },
  textContainer: {
    fontSize: 16,
    lineHeight: 24,
    color: Colors.light.text,
  },
  regularText: {
    color: Colors.light.text,
  },
  addition: {
    backgroundColor: Colors.light.primary + '20',
    color: Colors.light.primary,
    fontWeight: '500',
    borderRadius: 2,
    overflow: 'hidden',
  },
});

export default CompletedTextDisplay;
