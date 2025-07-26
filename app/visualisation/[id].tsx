import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { BarChart2, GitBranch, Clock, Tag, ArrowLeft } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import Button from '@/components/Button';
import { formatDate } from '@/utils/date';

// Mock visualization components
const MindMap = ({ text }) => {
  // In a real app, this would be a proper mind map visualization
  const words = text.split(/\s+/).filter(word => word.length > 4);
  const uniqueWords = [...new Set(words)].slice(0, 10);
  
  return (
    <View style={styles.mindMapContainer}>
      <View style={styles.mindMapCenter}>
        <Text style={styles.mindMapCenterText}>Main Topic</Text>
      </View>
      
      {uniqueWords.map((word, index) => {
        const angle = (index / uniqueWords.length) * Math.PI * 2;
        const radius = 120;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        return (
          <View
            key={index}
            style={[
              styles.mindMapNode,
              {
                transform: [
                  { translateX: x },
                  { translateY: y },
                ],
              },
            ]}
          >
            <Text style={styles.mindMapNodeText}>{word}</Text>
          </View>
        );
      })}
    </View>
  );
};

const TagCloud = ({ text }) => {
  // Simple tag cloud based on word frequency
  const words = text.split(/\s+/).filter(word => word.length > 3);
  const wordCount = {};
  
  words.forEach(word => {
    const cleanWord = word.toLowerCase().replace(/[.,;:!?()[\]{}""'']/g, '');
    if (cleanWord) {
      wordCount[cleanWord] = (wordCount[cleanWord] || 0) + 1;
    }
  });
  
  const sortedWords = Object.entries(wordCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20);
  
  return (
    <View style={styles.tagCloudContainer}>
      {sortedWords.map(([word, count], index) => (
        <View
          key={index}
          style={[
            styles.tagCloudItem,
            {
              padding: Math.min(count + 5, 15),
              backgroundColor: `rgba(74, 144, 226, ${Math.min(count / 10, 0.8)})`,
            },
          ]}
        >
          <Text
            style={[
              styles.tagCloudText,
              { fontSize: Math.min(count + 12, 24) },
            ]}
          >
            {word}
          </Text>
        </View>
      ))}
    </View>
  );
};

const Timeline = ({ transcription }) => {
  // Simple timeline visualization
  const events = [
    { date: transcription.createdAt, title: 'Created', description: 'Transcription created' },
    { date: transcription.createdAt + 3600000, title: 'Edited', description: 'First edit made' },
    { date: transcription.createdAt + 86400000, title: 'Shared', description: 'Shared with team' },
  ];
  
  return (
    <View style={styles.timelineContainer}>
      {events.map((event, index) => (
        <View key={index} style={styles.timelineItem}>
          <View style={styles.timelineDot} />
          {index < events.length - 1 && <View style={styles.timelineLine} />}
          <View style={styles.timelineContent}>
            <Text style={styles.timelineTitle}>{event.title}</Text>
            <Text style={styles.timelineDate}>{formatDate(event.date)}</Text>
            <Text style={styles.timelineDescription}>{event.description}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

export default function VisualizationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transcriptions } = useTranscriptionStore();
  
  const [activeTab, setActiveTab] = useState('mindmap');
  const [transcription, setTranscription] = useState<any>(null);
  
  useEffect(() => {
    if (id) {
      const found = transcriptions.find(t => t.id === id);
      if (found) {
        setTranscription(found);
      }
    }
  }, [id, transcriptions]);

  if (!transcription) {
    return (
      <View style={styles.notFoundContainer}>
        <Text style={styles.notFoundText}>Transcription not found</Text>
        <Button
          title="Go Back"
          onPress={() => router.back()}
          variant="outline"
        />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Visualization</Text>
        <Text style={styles.subtitle}>{transcription.title}</Text>
      </View>
      
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'mindmap' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('mindmap')}
        >
          <GitBranch
            size={20}
            color={activeTab === 'mindmap' ? Colors.light.primary : Colors.light.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'mindmap' && styles.activeTabText,
            ]}
          >
            Mind Map
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'tagcloud' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('tagcloud')}
        >
          <Tag
            size={20}
            color={activeTab === 'tagcloud' ? Colors.light.primary : Colors.light.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'tagcloud' && styles.activeTabText,
            ]}
          >
            Tag Cloud
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'timeline' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('timeline')}
        >
          <Clock
            size={20}
            color={activeTab === 'timeline' ? Colors.light.primary : Colors.light.textSecondary}
          />
          <Text
            style={[
              styles.tabText,
              activeTab === 'timeline' && styles.activeTabText,
            ]}
          >
            Timeline
          </Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.visualizationContainer}>
          {activeTab === 'mindmap' && (
            <MindMap text={transcription.enhancedText} />
          )}
          
          {activeTab === 'tagcloud' && (
            <TagCloud text={transcription.enhancedText} />
          )}
          
          {activeTab === 'timeline' && (
            <Timeline transcription={transcription} />
          )}
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.infoTitle}>About this Visualization</Text>
          {activeTab === 'mindmap' && (
            <Text style={styles.infoText}>
              Mind maps help visualize connections between concepts in your text. The central node represents the main topic, with related concepts branching out.
            </Text>
          )}
          
          {activeTab === 'tagcloud' && (
            <Text style={styles.infoText}>
              Tag clouds highlight the most frequent words in your text. Larger words appear more frequently, giving you a quick overview of key terms.
            </Text>
          )}
          
          {activeTab === 'timeline' && (
            <Text style={styles.infoText}>
              Timelines show the history and evolution of your transcription, including when it was created, edited, and shared.
            </Text>
          )}
        </View>
      </ScrollView>
      
      <View style={styles.footer}>
        <Button
          title="Back to Transcription"
          onPress={() => router.push(`/transcription/${id}`)}
          variant="outline"
        />
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.light.textSecondary,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.light.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.light.textSecondary,
  },
  activeTabText: {
    color: Colors.light.primary,
  },
  content: {
    padding: 16,
  },
  visualizationContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.light.border,
    minHeight: 300,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mindMapContainer: {
    width: '100%',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mindMapCenter: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  mindMapCenterText: {
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  mindMapNode: {
    position: 'absolute',
    padding: 10,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '30',
    borderWidth: 1,
    borderColor: Colors.light.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  mindMapNodeText: {
    color: Colors.light.text,
    fontWeight: '500',
    fontSize: 12,
  },
  tagCloudContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    padding: 16,
  },
  tagCloudItem: {
    borderRadius: 20,
    margin: 4,
  },
  tagCloudText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  timelineContainer: {
    width: '100%',
    paddingVertical: 16,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.primary,
    marginTop: 4,
    marginRight: 12,
    zIndex: 2,
  },
  timelineLine: {
    position: 'absolute',
    left: 7,
    top: 20,
    width: 2,
    height: 40,
    backgroundColor: Colors.light.border,
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 4,
  },
  timelineDescription: {
    fontSize: 14,
    color: Colors.light.text,
  },
  infoContainer: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.light.textSecondary,
    marginBottom: 24,
  },
});
