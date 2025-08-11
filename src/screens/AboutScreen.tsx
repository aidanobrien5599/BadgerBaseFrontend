import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  Linking,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
} from 'react-native-paper';

import { colors } from '../theme/theme';

export default function AboutScreen({ navigation }: any) {
  const handleLinkPress = (url: string) => {
    Linking.openURL(url);
  };

  const features = [
    {
      title: 'Smart Search',
      description: 'Search courses by course code, name, or instructor. Our intelligent search helps you find exactly what you\'re looking for quickly and efficiently.',
      icon: '🔍',
    },
    {
      title: 'Advanced Filtering',
      description: 'Filter courses by availability, instruction mode, credits, GPA requirements, subject areas, and more. Find courses that fit your exact needs.',
      icon: '🔧',
    },
    {
      title: 'Instructor Ratings',
      description: 'View Rate My Professor ratings for instructors and sections, including average ratings, difficulty levels, and student feedback.',
      icon: '⭐',
    },
    {
      title: 'Real-time Data',
      description: 'Get up-to-date information on course availability, enrollment numbers, waitlist status, and seat availability.',
      icon: '📊',
    },
  ];

  const filterCategories = [
    'Course level',
    'Breadth requirements',
    'Credits',
    'Madgrades GPA Info',
    'Status (Open/Closed/Waitlist)',
    'Available seats',
    'Instruction Mode',
    'Professor rating',
    'Difficulty level',
    'Number of ratings',
    'Would take again %',
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content style={styles.headerContent}>
          <Title style={styles.title}>About BadgerBase</Title>
          <Paragraph style={styles.description}>
            A comprehensive data aggregator designed to help UW-Madison students find the best courses to fit their needs. Sourcing data from UW-Madison's live course catalog, Rate My Professor, and Madgrades for an all-in-one course search experience.
          </Paragraph>
        </Card.Content>
      </Card>

      <Title style={styles.sectionTitle}>Features</Title>
      {features.map((feature, index) => (
        <Card key={index} style={styles.featureCard}>
          <Card.Content>
            <View style={styles.featureHeader}>
              <Title style={styles.featureTitle}>
                {feature.icon} {feature.title}
              </Title>
            </View>
            <Paragraph style={styles.featureDescription}>
              {feature.description}
            </Paragraph>
          </Card.Content>
        </Card>
      ))}

      <Card style={styles.filtersCard}>
        <Card.Content>
          <Title style={styles.sectionTitle}>Available Filters</Title>
          <View style={styles.chipContainer}>
            {filterCategories.map((filter, index) => (
              <Chip key={index} style={styles.chip} textStyle={styles.chipText}>
                {filter}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.ctaCard}>
        <Card.Content style={styles.ctaContent}>
          <Title style={styles.ctaTitle}>Ready to find your perfect courses?</Title>
          <Paragraph style={styles.ctaDescription}>
            Start searching with our comprehensive course database and filtering system.
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('Home')}
            style={styles.ctaButton}
            contentStyle={styles.ctaButtonContent}
          >
            Start Searching
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.footerCard}>
        <Card.Content>
          <Paragraph style={styles.footerText}>
            Created by{' '}
            <Paragraph
              style={styles.link}
              onPress={() => handleLinkPress('https://aidanpobrien.com')}
            >
              Aidan O'Brien
            </Paragraph>
          </Paragraph>
          <Paragraph style={styles.disclaimerText}>
            Not affiliated with UW-Madison • Data from UW-Madison & Madgrades & Rate My Professors
          </Paragraph>
          <Paragraph style={styles.disclaimerText}>
            {new Date().getFullYear()} For educational purposes only
          </Paragraph>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
  },
  featureCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    elevation: 1,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  featureDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  filtersCard: {
    margin: 16,
    elevation: 1,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  chip: {
    margin: 4,
    backgroundColor: '#fee2e2',
  },
  chipText: {
    color: '#dc2626',
    fontSize: 12,
  },
  ctaCard: {
    margin: 16,
    backgroundColor: '#fee2e2',
    elevation: 2,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#991b1b',
    textAlign: 'center',
    marginBottom: 8,
  },
  ctaDescription: {
    fontSize: 14,
    color: '#b91c1c',
    textAlign: 'center',
    marginBottom: 16,
  },
  ctaButton: {
    backgroundColor: colors.primary,
  },
  ctaButtonContent: {
    paddingHorizontal: 16,
  },
  footerCard: {
    margin: 16,
    marginBottom: 32,
    elevation: 1,
  },
  footerText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  link: {
    color: colors.primary,
    fontWeight: '600',
  },
  disclaimerText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
});