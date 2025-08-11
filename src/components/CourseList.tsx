import React from 'react';
import {
  FlatList,
  View,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';

import { Course } from '../types/Course';
import { CourseCard } from './CourseCard';
import { colors } from '../theme/theme';

interface CourseListProps {
  courses: Course[];
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  refreshControl?: React.ReactElement;
}

export function CourseList({
  courses,
  onLoadMore,
  hasMore,
  loading,
  refreshControl,
}: CourseListProps) {
  const renderCourse = ({ item }: { item: Course }) => (
    <CourseCard course={item} />
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    
    return (
      <View style={styles.footer}>
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>
    );
  };

  const renderEmpty = () => (
    <Card style={styles.emptyCard}>
      <Card.Content>
        <Paragraph style={styles.emptyText}>
          No courses found. Try adjusting your search criteria.
        </Paragraph>
      </Card.Content>
    </Card>
  );

  return (
    <FlatList
      data={courses}
      renderItem={renderCourse}
      keyExtractor={(item) => item.course_id.toString()}
      onEndReached={onLoadMore}
      onEndReachedThreshold={0.1}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={refreshControl}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingBottom: 80, // Space for FAB
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyCard: {
    margin: 16,
    elevation: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
  },
});