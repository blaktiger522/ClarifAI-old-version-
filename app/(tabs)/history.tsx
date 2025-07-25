import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useTranscriptionStore } from '@/store/transcription-store';
import TranscriptionCard from '@/components/TranscriptionCard';
import EmptyState from '@/components/EmptyState';
import { TextInput } from 'react-native';

export default function HistoryScreen() {
  const router = useRouter();
  const { transcriptions } = useTranscriptionStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTranscriptions = searchQuery
    ? transcriptions.filter(
        (t) =>
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.enhancedText.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : transcriptions;

  const handleTranscriptionPress = (transcription: any) => {
    router.push(`/transcription/${transcription.id}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>History</Text>
        <View style={styles.searchContainer}>
          <Search size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transcriptions"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.light.placeholder}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
              <X size={18} color={Colors.light.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {filteredTranscriptions.length > 0 ? (
        <FlatList
          data={filteredTranscriptions}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TranscriptionCard
              transcription={item}
              onPress={handleTranscriptionPress}
            />
          )}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          {searchQuery ? (
            <EmptyState
              title="No results found"
              description="Try a different search term"
              icon={<Search size={64} color={Colors.light.border} />}
            />
          ) : (
            <EmptyState
              title="No transcriptions yet"
              description="Capture or upload an image to get started"
            />
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.light.text,
    marginBottom: 16,
  },
  searchContainer: {
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
  listContent: {
    padding: 16,
    paddingTop: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
