import React from 'react';
import {
  View,
  StyleSheet,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Chip,
  Button,
} from 'react-native-paper';

import { Section } from '../types/Course';
import { colors } from '../theme/theme';

interface SectionCardProps {
  section: Section;
}

export function SectionCard({ section }: SectionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'OPEN': return { bg: '#dcfce7', text: '#166534' };
      case 'CLOSED': return { bg: '#fee2e2', text: '#991b1b' };
      case 'WAITLIST': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const formatRating = (rating: number | null) => {
    return rating ? rating.toFixed(1) : 'N/A';
  };

  const handleInstructorPress = (instructorId: string) => {
    if (instructorId) {
      const url = `https://www.ratemyprofessors.com/professor/${instructorId}`;
      Linking.openURL(url);
    }
  };

  const statusColors = getStatusColor(section.status);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.sectionTitle}>Section {section.section_id}</Title>
          <Chip 
            style={[styles.statusChip, { backgroundColor: statusColors.bg }]}
            textStyle={[styles.statusChipText, { color: statusColors.text }]}
          >
            {section.status}
          </Chip>
        </View>

        <View style={styles.enrollmentContainer}>
          <Paragraph style={styles.enrollmentText}>
            {section.enrolled}/{section.capacity} enrolled
          </Paragraph>
          {section.available_seats > 0 && (
            <Paragraph style={styles.availableText}>
              ({section.available_seats} available)
            </Paragraph>
          )}
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailItem}>
            <Paragraph style={styles.detailLabel}>Time:</Paragraph>
            <Paragraph style={styles.detailValue}>
              {section.meeting_time || 'TBA'}
            </Paragraph>
          </View>
          
          <View style={styles.detailItem}>
            <Paragraph style={styles.detailLabel}>Location:</Paragraph>
            <Paragraph style={styles.detailValue}>
              {section.location || 'TBA'}
            </Paragraph>
          </View>
          
          <View style={styles.detailItem}>
            <Paragraph style={styles.detailLabel}>Mode:</Paragraph>
            <View style={styles.modeContainer}>
              <Chip style={styles.modeChip} textStyle={styles.modeChipText}>
                {section.instruction_mode}
              </Chip>
              {section.is_asynchronous && (
                <Chip style={styles.asyncChip} textStyle={styles.asyncChipText}>
                  Async
                </Chip>
              )}
            </View>
          </View>
        </View>

        {section.section_avg_rating && (
          <View style={styles.ratingsContainer}>
            <Title style={styles.ratingsTitle}>Section Ratings</Title>
            <View style={styles.ratingsGrid}>
              <View style={styles.ratingItem}>
                <Paragraph style={styles.ratingValue}>
                  ⭐ {formatRating(section.section_avg_rating)}
                </Paragraph>
                <Paragraph style={styles.ratingLabel}>Rating</Paragraph>
              </View>
              
              <View style={styles.ratingItem}>
                <Paragraph style={styles.ratingValue}>
                  📈 {formatRating(section.section_avg_difficulty)}
                </Paragraph>
                <Paragraph style={styles.ratingLabel}>Difficulty</Paragraph>
              </View>
              
              <View style={styles.ratingItem}>
                <Paragraph style={styles.ratingValue}>
                  {section.section_total_ratings}
                </Paragraph>
                <Paragraph style={styles.ratingLabel}>Total Ratings</Paragraph>
              </View>
              
              <View style={styles.ratingItem}>
                <Paragraph style={styles.ratingValue}>
                  {section.section_avg_would_take_again
                    ? `${section.section_avg_would_take_again}%`
                    : 'N/A'}
                </Paragraph>
                <Paragraph style={styles.ratingLabel}>Would Take Again</Paragraph>
              </View>
            </View>
          </View>
        )}

        {section.instructors.length > 0 && (
          <View style={styles.instructorsContainer}>
            <Title style={styles.instructorsTitle}>Instructors</Title>
            {section.instructors.map((instructor, index) => (
              <View key={index} style={styles.instructorCard}>
                <View style={styles.instructorHeader}>
                  {instructor.rmp_instructor_id ? (
                    <Button
                      mode="text"
                      onPress={() => handleInstructorPress(instructor.rmp_instructor_id)}
                      labelStyle={styles.instructorName}
                      compact
                    >
                      {instructor.name}
                    </Button>
                  ) : (
                    <Paragraph style={styles.instructorNameText}>
                      {instructor.name}
                    </Paragraph>
                  )}
                </View>
                
                {instructor.avg_rating && (
                  <View style={styles.instructorRatings}>
                    <Chip style={styles.ratingChip} textStyle={styles.ratingChipText}>
                      ⭐ {formatRating(instructor.avg_rating)}
                    </Chip>
                    <Chip style={styles.difficultyChip} textStyle={styles.difficultyChipText}>
                      Difficulty: {formatRating(instructor.avg_difficulty)}
                    </Chip>
                    <Paragraph style={styles.ratingsCount}>
                      ({instructor.num_ratings} ratings)
                    </Paragraph>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  statusChip: {
    borderWidth: 1,
    borderColor: 'transparent',
  },
  statusChipText: {
    fontWeight: '600',
  },
  enrollmentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  enrollmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  availableText: {
    fontSize: 14,
    color: colors.success,
    marginLeft: 8,
  },
  detailsContainer: {
    marginBottom: 16,
  },
  detailItem: {
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  modeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeChip: {
    backgroundColor: colors.primary,
    marginRight: 8,
  },
  modeChipText: {
    color: colors.white,
    fontSize: 12,
  },
  asyncChip: {
    backgroundColor: colors.textSecondary,
  },
  asyncChipText: {
    color: colors.white,
    fontSize: 12,
  },
  ratingsContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  ratingsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  ratingsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  ratingItem: {
    width: '50%',
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  ratingLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  instructorsContainer: {
    marginTop: 8,
  },
  instructorsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 8,
  },
  instructorCard: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  instructorHeader: {
    marginBottom: 8,
  },
  instructorName: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  instructorNameText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.text,
  },
  instructorRatings: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  ratingChip: {
    backgroundColor: '#fef3c7',
    marginRight: 8,
    marginBottom: 4,
  },
  ratingChipText: {
    color: '#92400e',
    fontSize: 12,
  },
  difficultyChip: {
    backgroundColor: '#fee2e2',
    marginRight: 8,
    marginBottom: 4,
  },
  difficultyChipText: {
    color: '#991b1b',
    fontSize: 12,
  },
  ratingsCount: {
    fontSize: 12,
    color: colors.textSecondary,
  },
});