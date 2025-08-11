import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
} from 'react-native';
import {
  TextInput,
  Button,
  Title,
  Paragraph,
  Divider,
  Checkbox,
  Chip,
} from 'react-native-paper';
import RNPickerSelect from 'react-native-picker-select';
import Slider from 'react-native-slider';

import { FilterState } from '../types/Course';
import { colors } from '../theme/theme';

interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onSearch: () => void;
  onClose: () => void;
}

export function SearchFilters({
  filters,
  onFiltersChange,
  onSearch,
  onClose,
}: SearchFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showGPA, setShowGPA] = useState(false);
  const [showRMP, setShowRMP] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const resetFilters = () => {
    onFiltersChange({
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
  };

  const handleSearch = () => {
    onSearch();
    onClose();
  };

  const subjectAreas = [
    { key: 'ethnic_studies', label: 'Ethnic Studies', value: 'ETHNIC ST' },
    { key: 'social_science', label: 'Social Science', value: 'S' },
    { key: 'humanities', label: 'Humanities', value: 'H' },
    { key: 'biological_science', label: 'Biological Science', value: 'BO' },
    { key: 'physical_science', label: 'Physical Science', value: 'P' },
    { key: 'natural_science', label: 'Natural Science', value: 'N' },
    { key: 'literature', label: 'Literature', value: 'L' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Title style={styles.title}>Search & Filters</Title>
        <Button mode="text" onPress={onClose} compact>
          Close
        </Button>
      </View>

      <TextInput
        label="Search Courses"
        placeholder="COMP SCI 400, John Doe, etc."
        value={filters.search_param}
        onChangeText={(text) => updateFilter('search_param', text)}
        style={styles.input}
        mode="outlined"
      />

      <View style={styles.pickerContainer}>
        <Paragraph style={styles.label}>Status</Paragraph>
        <RNPickerSelect
          onValueChange={(value) => updateFilter('status', value || '')}
          items={[
            { label: 'Any status', value: '' },
            { label: 'Open', value: 'OPEN' },
            { label: 'Closed', value: 'CLOSED' },
            { label: 'Waitlist', value: 'WAITLIST' },
          ]}
          value={filters.status}
          style={pickerSelectStyles}
          placeholder={{ label: 'Any status', value: '' }}
        />
      </View>

      <View style={styles.pickerContainer}>
        <Paragraph style={styles.label}>Course Level</Paragraph>
        <RNPickerSelect
          onValueChange={(value) => updateFilter('level', value || '')}
          items={[
            { label: 'Any level', value: '' },
            { label: 'Elementary', value: 'E' },
            { label: 'Intermediate', value: 'I' },
            { label: 'Advanced', value: 'A' },
          ]}
          value={filters.level}
          style={pickerSelectStyles}
          placeholder={{ label: 'Any level', value: '' }}
        />
      </View>

      <View style={styles.row}>
        <TextInput
          label="Min Credits"
          placeholder="0"
          value={filters.min_credits}
          onChangeText={(text) => updateFilter('min_credits', text)}
          style={[styles.input, styles.halfWidth]}
          mode="outlined"
          keyboardType="numeric"
        />
        <TextInput
          label="Max Credits"
          placeholder="10"
          value={filters.max_credits}
          onChangeText={(text) => updateFilter('max_credits', text)}
          style={[styles.input, styles.halfWidth]}
          mode="outlined"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.pickerContainer}>
        <Paragraph style={styles.label}>Results Limit</Paragraph>
        <RNPickerSelect
          onValueChange={(value) => updateFilter('limit', value || '20')}
          items={[
            { label: '10', value: '10' },
            { label: '20', value: '20' },
            { label: '50', value: '50' },
            { label: '100', value: '100' },
          ]}
          value={filters.limit}
          style={pickerSelectStyles}
        />
      </View>

      <Divider style={styles.divider} />

      {/* GPA Filters */}
      <Button
        mode="text"
        onPress={() => setShowGPA(!showGPA)}
        style={styles.sectionButton}
        contentStyle={styles.sectionButtonContent}
      >
        GPA Filters {showGPA ? '▼' : '▶'}
      </Button>

      {showGPA && (
        <View style={styles.section}>
          <View style={styles.pickerContainer}>
            <Paragraph style={styles.label}>Median Grade</Paragraph>
            <RNPickerSelect
              onValueChange={(value) => updateFilter('median_grade', value || '')}
              items={[
                { label: 'Any grade', value: '' },
                { label: 'A', value: 'A' },
                { label: 'AB', value: 'AB' },
                { label: 'B', value: 'B' },
                { label: 'BC', value: 'BC' },
                { label: 'C', value: 'C' },
                { label: 'D', value: 'D' },
                { label: 'F', value: 'F' },
              ]}
              value={filters.median_grade}
              style={pickerSelectStyles}
              placeholder={{ label: 'Any grade', value: '' }}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Paragraph style={styles.label}>
              Min A Percentage: {filters.min_a_percent ? `${Math.round(parseFloat(filters.min_a_percent) * 100)}%` : '0%'}
            </Paragraph>
            <Slider
              value={parseFloat(filters.min_a_percent) || 0}
              onValueChange={(value) => updateFilter('min_a_percent', value.toString())}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              thumbStyle={styles.sliderThumb}
              trackStyle={styles.sliderTrack}
              minimumTrackTintColor={colors.primary}
            />
          </View>

          <View style={styles.sliderContainer}>
            <Paragraph style={styles.label}>
              Min Avg GPA: {filters.min_cumulative_gpa || '0.0'}
            </Paragraph>
            <Slider
              value={parseFloat(filters.min_cumulative_gpa) || 0}
              onValueChange={(value) => updateFilter('min_cumulative_gpa', value.toFixed(2))}
              minimumValue={0}
              maximumValue={4}
              step={0.01}
              thumbStyle={styles.sliderThumb}
              trackStyle={styles.sliderTrack}
              minimumTrackTintColor={colors.primary}
            />
          </View>
        </View>
      )}

      <Divider style={styles.divider} />

      {/* Advanced Filters */}
      <Button
        mode="text"
        onPress={() => setShowAdvanced(!showAdvanced)}
        style={styles.sectionButton}
        contentStyle={styles.sectionButtonContent}
      >
        Advanced Filters {showAdvanced ? '▼' : '▶'}
      </Button>

      {showAdvanced && (
        <View style={styles.section}>
          <TextInput
            label="Min Available Seats"
            placeholder="0"
            value={filters.min_available_seats}
            onChangeText={(text) => updateFilter('min_available_seats', text)}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <View style={styles.pickerContainer}>
            <Paragraph style={styles.label}>Instruction Mode</Paragraph>
            <RNPickerSelect
              onValueChange={(value) => updateFilter('instruction_mode', value || '')}
              items={[
                { label: 'Any mode', value: '' },
                { label: 'In Person', value: 'Classroom Instruction' },
                { label: 'Online', value: 'Online Only' },
                { label: 'Hybrid', value: 'Online (some classroom)' },
              ]}
              value={filters.instruction_mode}
              style={pickerSelectStyles}
              placeholder={{ label: 'Any mode', value: '' }}
            />
          </View>

          <Paragraph style={styles.sectionTitle}>Subject Areas</Paragraph>
          <View style={styles.checkboxContainer}>
            {subjectAreas.map(({ key, label, value }) => (
              <View key={key} style={styles.checkboxRow}>
                <Checkbox
                  status={filters[key as keyof FilterState] ? 'checked' : 'unchecked'}
                  onPress={() => {
                    const currentValue = filters[key as keyof FilterState];
                    updateFilter(key as keyof FilterState, currentValue ? '' : value);
                  }}
                />
                <Paragraph style={styles.checkboxLabel}>{label}</Paragraph>
              </View>
            ))}
          </View>
        </View>
      )}

      <Divider style={styles.divider} />

      {/* RMP Filters */}
      <Button
        mode="text"
        onPress={() => setShowRMP(!showRMP)}
        style={styles.sectionButton}
        contentStyle={styles.sectionButtonContent}
      >
        Rate My Professor Filters {showRMP ? '▼' : '▶'}
      </Button>

      {showRMP && (
        <View style={styles.section}>
          <TextInput
            label="Min Section Rating"
            placeholder="0.0"
            value={filters.min_section_avg_rating}
            onChangeText={(text) => updateFilter('min_section_avg_rating', text)}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <TextInput
            label="Min Section Difficulty"
            placeholder="0.0"
            value={filters.min_section_avg_difficulty}
            onChangeText={(text) => updateFilter('min_section_avg_difficulty', text)}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <TextInput
            label="Min Total Ratings"
            placeholder="0"
            value={filters.min_section_total_ratings}
            onChangeText={(text) => updateFilter('min_section_total_ratings', text)}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSearch}
          style={styles.searchButton}
          contentStyle={styles.buttonContent}
        >
          Search Courses
        </Button>
        <Button
          mode="outlined"
          onPress={resetFilters}
          style={styles.resetButton}
          contentStyle={styles.buttonContent}
        >
          Reset Filters
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
  },
  input: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  pickerContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  sectionButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  sectionButtonContent: {
    justifyContent: 'flex-start',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderThumb: {
    backgroundColor: colors.primary,
    width: 20,
    height: 20,
  },
  sliderTrack: {
    height: 4,
    backgroundColor: colors.border,
  },
  checkboxContainer: {
    marginTop: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
    color: colors.text,
  },
  buttonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  searchButton: {
    backgroundColor: colors.primary,
    marginBottom: 12,
  },
  resetButton: {
    borderColor: colors.primary,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    fontSize: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    color: colors.text,
    paddingRight: 30,
    backgroundColor: colors.surface,
  },
  inputAndroid: {
    fontSize: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    color: colors.text,
    paddingRight: 30,
    backgroundColor: colors.surface,
  },
});