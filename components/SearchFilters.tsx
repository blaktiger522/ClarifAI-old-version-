import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { Calendar, SortAsc, SortDesc, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { logEvent, Events } from '@/utils/analytics';

export type SortOrder = 'asc' | 'desc';
export type DateRange = 'all' | 'today' | 'week' | 'month' | 'year';

interface SearchFiltersProps {
  onSearch: (query: string) => void;
  onSort: (order: SortOrder) => void;
  onDateRange: (range: DateRange) => void;
}

export default function SearchFilters({
  onSearch,
  onSort,
  onDateRange,
}: SearchFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRange, setSelectedRange] = useState<DateRange>('all');

  const handleSearch = (text: string) => {
    setSearchQuery(text);
    onSearch(text);
    logEvent(Events.SEARCH_PERFORMED, { query: text });
  };

  const toggleSort = () => {
    const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSortOrder(newOrder);
    onSort(newOrder);
    logEvent(Events.FILTER_APPLIED, { type: 'sort', value: newOrder });
  };

  const handleDateRange = (range: DateRange) => {
    setSelectedRange(range);
    onDateRange(range);
    setShowDatePicker(false);
    logEvent(Events.FILTER_APPLIED, { type: 'dateRange', value: range });
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Search transcriptions..."
          placeholderTextColor={Colors.light.placeholder}
        />
        {searchQuery ? (
          <TouchableOpacity
            onPress={() => handleSearch('')}
            style={styles.clearButton}
          >
            <X size={20} color={Colors.light.textSecondary} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.filtersContainer}>
        <TouchableOpacity
          onPress={toggleSort}
          style={styles.filterButton}
        >
          {sortOrder === 'asc' ? (
            <SortAsc size={20} color={Colors.light.primary} />
          ) : (
            <SortDesc size={20} color={Colors.light.primary} />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={styles.filterButton}
        >
          <Calendar size={20} color={Colors.light.primary} />
        </TouchableOpacity>
      </View>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date Range</Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                style={styles.modalClose}
              >
                <X size={24} color={Colors.light.text} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {[
                { label: 'All Time', value: 'all' },
                { label: 'Today', value: 'today' },
                { label: 'This Week', value: 'week' },
                { label: 'This Month', value: 'month' },
                { label: 'This Year', value: 'year' },
              ].map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.dateOption,
                    selectedRange === option.value && styles.dateOptionSelected,
                  ]}
                  onPress={() => handleDateRange(option.value as DateRange)}
                >
                  <Text
                    style={[
                      styles.dateOptionText,
                      selectedRange === option.value && styles.dateOptionTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: Colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.card,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 16,
    color: Colors.light.text,
  },
  clearButton: {
    padding: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.card,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.light.background,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.light.text,
  },
  modalClose: {
    padding: 4,
  },
  dateOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  dateOptionSelected: {
    backgroundColor: Colors.light.primary + '10',
  },
  dateOptionText: {
    fontSize: 16,
    color: Colors.light.text,
  },
  dateOptionTextSelected: {
    color: Colors.light.primary,
    fontWeight: '600',
  },
});
