import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, TouchableOpacity, SafeAreaView, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Search, Book, ExternalLink, ArrowLeft, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import Button from '@/components/Button';
import * as WebBrowser from 'expo-web-browser';

interface ResearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  source: string;
}

export default function ResearchScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { transcriptions } = useTranscriptionStore();
  
  const [transcription, setTranscription] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ResearchResult[]>([]);
  const [selectedTerms, setSelectedTerms] = useState<string[]>([]);
  
  useEffect(() => {
    if (id) {
      const found = transcriptions.find(t => t.id === id);
      if (found) {
        setTranscription(found);
        
        // Extract potential research terms
        const text = found.enhancedText;
        const words = text.split(/\s+/);
        const uniqueWords = [...new Set(words.filter(word => 
          word.length > 5 && 
          !commonWords.includes(word.toLowerCase().replace(/[.,;:!?()[\]{}""'']/g, ''))
        ))];
        
        // Select a few terms for suggested research
        const suggestedTerms = uniqueWords
          .slice(0, Math.min(5, uniqueWords.length))
          .map(term => term.replace(/[.,;:!?()[\]{}""'']/g, ''));
        
        setSelectedTerms(suggestedTerms);
      }
    }
  }, [id, transcriptions]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    
    try {
      // In a real app, this would call a search API
      // For now, we'll simulate results
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResults: ResearchResult[] = [
        {
          id: '1',
          title: `Research on ${searchQuery}`,
          snippet: `This article discusses ${searchQuery} in detail, providing comprehensive information about its origins, applications, and future developments.`,
          url: `https://example.com/research/${searchQuery}`,
          source: 'Journal of Research',
        },
        {
          id: '2',
          title: `Understanding ${searchQuery}: A Comprehensive Guide`,
          snippet: `Learn everything you need to know about ${searchQuery}, including key concepts, practical applications, and expert insights.`,
          url: `https://example.com/guide/${searchQuery}`,
          source: 'Educational Resources',
        },
        {
          id: '3',
          title: `The History and Evolution of ${searchQuery}`,
          snippet: `Explore the fascinating history of ${searchQuery}, from its earliest origins to its current state and potential future developments.`,
          url: `https://example.com/history/${searchQuery}`,
          source: 'Historical Archives',
        },
      ];
      
      setResults(mockResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleOpenLink = async (url: string) => {
    await WebBrowser.openBrowserAsync(url);
  };

  const handleTermPress = (term: string) => {
    setSearchQuery(term);
    handleSearch();
  };

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
        <Text style={styles.title}>Research</Text>
        <Text style={styles.subtitle}>{transcription.title}</Text>
      </View>
      
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for terms or concepts"
            placeholderTextColor={Colors.light.placeholder}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <X size={18} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        
        <Button
          title="Search"
          onPress={handleSearch}
          style={styles.searchButton}
          loading={isSearching}
        />
      </View>
      
      <View style={styles.suggestedTermsContainer}>
        <Text style={styles.suggestedTermsTitle}>Suggested Terms</Text>
        <View style={styles.termChips}>
          {selectedTerms.map((term, index) => (
            <TouchableOpacity
              key={index}
              style={styles.termChip}
              onPress={() => handleTermPress(term)}
            >
              <Text style={styles.termChipText}>{term}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsTitle}>Research Results</Text>
        
        {isSearching ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.light.primary} />
            <Text style={styles.loadingText}>Searching...</Text>
          </View>
        ) : results.length > 0 ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.resultItem}>
                <View style={styles.resultHeader}>
                  <Book size={16} color={Colors.light.primary} />
                  <Text style={styles.resultSource}>{item.source}</Text>
                </View>
                
                <Text style={styles.resultTitle}>{item.title}</Text>
                <Text style={styles.resultSnippet}>{item.snippet}</Text>
                
                <TouchableOpacity
                  style={styles.openLinkButton}
                  onPress={() => handleOpenLink(item.url)}
                >
                  <ExternalLink size={16} color={Colors.light.primary} />
                  <Text style={styles.openLinkText}>Open Link</Text>
                </TouchableOpacity>
              </View>
            )}
            style={styles.resultsList}
          />
        ) : searchQuery ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No results found</Text>
            <Text style={styles.emptyStateSubtext}>
              Try a different search term or check one of the suggested terms
            </Text>
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Search for a term to see results</Text>
            <Text style={styles.emptyStateSubtext}>
              Use the search bar above or tap on one of the suggested terms
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// Common words to filter out from suggestions
const commonWords = [
  'the', 'and', 'that', 'have', 'for', 'not', 'with', 'you', 'this', 'but',
  'his', 'from', 'they', 'say', 'her', 'she', 'will', 'one', 'all', 'would',
  'there', 'their', 'what', 'out', 'about', 'who', 'get', 'which', 'when', 'make',
  'can', 'like', 'time', 'just', 'him', 'know', 'take', 'people', 'into', 'year',
  'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now',
  'look', 'only', 'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use',
  'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
];

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 44,
    color: Colors.light.text,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    paddingHorizontal: 16,
  },
  suggestedTermsContainer: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  suggestedTermsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 12,
  },
  termChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  termChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.light.primary + '20',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.light.primary,
  },
  termChipText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
  },
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 16,
  },
  resultsList: {
    flex: 1,
  },
  resultItem: {
    backgroundColor: Colors.light.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultSource: {
    fontSize: 14,
    color: Colors.light.primary,
    marginLeft: 8,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
  },
  resultSnippet: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginBottom: 12,
    lineHeight: 20,
  },
  openLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  openLinkText: {
    fontSize: 14,
    color: Colors.light.primary,
    fontWeight: '500',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    marginTop: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    maxWidth: 300,
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
