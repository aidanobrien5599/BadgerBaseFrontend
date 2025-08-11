import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Searchbar,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  FAB,
  Portal,
  Modal,
} from 'react-native-paper';

import { Course, FilterState, ApiResponse } from '../types/Course';
import { CourseList } from '../components/CourseList';
import { SearchFilters } from '../components/SearchFilters';
import { colors } from '../theme/theme';
import { apiService } from '../services/apiService';

export default function HomeScreen({ navigation }: any) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    search_param: '',
    status: '',
    min_available_seats: '',
    instruction_mode: '',
    limit: '20',
    min_credits: '',
    max_credits: '',
    level: '',
    ethnic_studies: '',
    social_science: '',
    humanities: '',
    biological_science: '',
    physical_science: '',
    natural_science: '',
    literature: '',
    min_cumulative_gpa: '',
    min_most_recent_gpa: '',
    median_grade: '',
    min_a_percent: '',
    min_section_avg_rating: '',
    min_section_avg_difficulty: '',
    min_section_total_ratings: '',
    min_section_avg_would_take_again: '',
  });

  const searchCourses = async (page = 1, showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);

    try {
      const data = await apiService.searchCourses(filters, page);
      setCourses(data.data || []);
      setCurrentPage(page);
      setTotalCount(data.total_count || 0);
      setHasMore(data.has_more || false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
      setCourses([]);
      setCurrentPage(1);
      setTotalCount(0);
      setHasMore(false);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    searchCourses(1);
  }, []);

  const handleSearch = () => {
    setCurrentPage(1);
    searchCourses(1);
    setFiltersVisible(false);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    searchCourses(currentPage, false);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      searchCourses(currentPage + 1);
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.searchCard}>
        <Card.Content>
          <Searchbar
            placeholder="Search courses, instructors..."
            value={filters.search_param}
            onChangeText={(text) => setFilters({ ...filters, search_param: text })}
            onSubmitEditing={handleSearch}
            style={styles.searchbar}
          />
        </Card.Content>
      </Card>

      {error && (
        <Card style={styles.errorCard}>
          <Card.Content>
            <Paragraph style={styles.errorText}>{error}</Paragraph>
          </Card.Content>
        </Card>
      )}

      {loading && courses.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Paragraph style={styles.loadingText}>Loading courses...</Paragraph>
        </View>
      ) : (
        <CourseList
          courses={courses}
          onLoadMore={handleLoadMore}
          hasMore={hasMore}
          loading={loading}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}

      <FAB
        style={styles.fab}
        icon="filter"
        onPress={() => setFiltersVisible(true)}
        label="Filters"
      />

      <Portal>
        <Modal
          visible={filtersVisible}
          onDismiss={() => setFiltersVisible(false)}
          contentContainerStyle={styles.modal}
        >
          <SearchFilters
            filters={filters}
            onFiltersChange={setFilters}
            onSearch={handleSearch}
            onClose={() => setFiltersVisible(false)}
          />
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchCard: {
    margin: 16,
    elevation: 2,
  },
  searchbar: {
    backgroundColor: colors.surface,
  },
  errorCard: {
    margin: 16,
    backgroundColor: '#fee2e2',
  },
  errorText: {
    color: '#dc2626',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: colors.textSecondary,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
  },
  modal: {
    backgroundColor: colors.surface,
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
});