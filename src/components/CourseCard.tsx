import React, { useState } from 'react';
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
  Divider,
} from 'react-native-paper';
import Collapsible from 'react-native-collapsible';

import { Course } from '../types/Course';
import { SectionCard } from './SectionCard';
import { GradeChart } from './GradeChart';
import { colors } from '../theme/theme';

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const [expanded, setExpanded] = useState(false);

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A': return '#dc2626';
      case 'AB': return '#ef4444';
      case 'B': return '#f87171';
      case 'BC': return '#fca5a5';
      case 'C': return '#fecaca';
      case 'D': return '#fee2e2';
      case 'F': return '#991b1b';
      default: return colors.textSecondary;
    }
  };

  const getLevelText = (level: string) => {
    switch (level) {
      case 'A': return 'Advanced';
      case 'I': return 'Intermediate';
      default: return 'Elementary';
    }
  };

  const formatPercent = (decimal: number | null) => {
    return decimal ? `${Math.round(decimal * 100)}%` : '0%';
  };

  const handleMadgradesPress = () => {
    const url = `https://madgrades.com/courses/${course.madgrades_course_uuid}`;
    Linking.openURL(url);
  };

  const breadthRequirements = [
    { key: 'ethnic_studies', label: 'Ethnic Studies' },
    { key: 'social_science', label: 'Social Science' },
    { key: 'humanities', label: 'Humanities' },
    { key: 'biological_science', label: 'Bio Science' },
    { key: 'physical_science', label: 'Physical Science' },
    { key: 'natural_science', label: 'Natural Science' },
    { key: 'literature', label: 'Literature' },
  ].filter(req => course[req.key as keyof Course]);

  return (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.header}>
          <Title style={styles.title}>{course.course_title}</Title>
          <Button
            mode="text"
            onPress={() => setExpanded(!expanded)}
            compact
          >
            {expanded ? 'Less' : 'More'}
          </Button>
        </View>

        <View style={styles.chipContainer}>
          <Chip style={styles.courseChip} textStyle={styles.courseChipText}>
            {course.course_designation}
          </Chip>
          <Chip 
            style={[styles.gradeChip, { backgroundColor: getGradeColor(course.median_grade) }]}
            textStyle={styles.gradeChipText}
          >
            {course.median_grade} Avg
          </Chip>
          {course.enrollment_prerequisites === 'None' && (
            <Chip style={styles.prereqChip} textStyle={styles.prereqChipText}>
              No Prereqs
            </Chip>
          )}
        </View>

        {breadthRequirements.length > 0 && (
          <View style={styles.chipContainer}>
            {breadthRequirements.map((req, index) => (
              <Chip key={index} style={styles.breadthChip} textStyle={styles.breadthChipText}>
                {req.label}
              </Chip>
            ))}
          </View>
        )}

        {course.course_description && (
          <Paragraph style={styles.description} numberOfLines={expanded ? undefined : 3}>
            {course.course_description}
          </Paragraph>
        )}

        <Collapsible collapsed={!expanded}>
          <Divider style={styles.divider} />
          
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>Credits</Paragraph>
              <Paragraph style={styles.statValue}>
                {course.minimum_credits === course.maximum_credits
                  ? `${course.minimum_credits}`
                  : `${course.minimum_credits}-${course.maximum_credits}`}
              </Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>Level</Paragraph>
              <Paragraph style={styles.statValue}>
                {getLevelText(course.level)}
              </Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>Sections</Paragraph>
              <Paragraph style={styles.statValue}>
                {course.sections.length}
              </Paragraph>
            </View>
            
            <View style={styles.statItem}>
              <Paragraph style={styles.statLabel}>Avg GPA</Paragraph>
              <Button
                mode="text"
                onPress={handleMadgradesPress}
                compact
                labelStyle={styles.gpaLink}
              >
                {course.cumulative_gpa?.toFixed(2) || 'N/A'}
              </Button>
            </View>
          </View>

          {course.enrollment_prerequisites && course.enrollment_prerequisites !== 'None' && (
            <View style={styles.prereqContainer}>
              <Paragraph style={styles.prereqLabel}>Prerequisites:</Paragraph>
              <Paragraph style={styles.prereqText}>
                {course.enrollment_prerequisites}
              </Paragraph>
            </View>
          )}

          <GradeChart course={course} />

          <View style={styles.sectionsContainer}>
            <Title style={styles.sectionsTitle}>Sections</Title>
            {course.sections.map((section) => (
              <SectionCard key={section.section_id} section={section} />
            ))}
          </View>
        </Collapsible>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginRight: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  courseChip: {
    backgroundColor: colors.primary,
    marginRight: 8,
    marginBottom: 4,
  },
  courseChipText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  gradeChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  gradeChipText: {
    color: colors.white,
    fontWeight: 'bold',
  },
  prereqChip: {
    backgroundColor: '#fee2e2',
    marginRight: 8,
    marginBottom: 4,
  },
  prereqChipText: {
    color: '#b91c1c',
  },
  breadthChip: {
    backgroundColor: '#fee2e2',
    marginRight: 8,
    marginBottom: 4,
  },
  breadthChipText: {
    color: '#b91c1c',
    fontSize: 12,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  divider: {
    marginVertical: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  statItem: {
    width: '50%',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  gpaLink: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  prereqContainer: {
    backgroundColor: '#fee2e2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  prereqLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 4,
  },
  prereqText: {
    fontSize: 14,
    color: '#b91c1c',
  },
  sectionsContainer: {
    marginTop: 16,
  },
  sectionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
});