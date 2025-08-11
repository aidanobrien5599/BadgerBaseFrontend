import React from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {
  Title,
  Paragraph,
} from 'react-native-paper';
import { BarChart } from 'react-native-chart-kit';

import { Course } from '../types/Course';
import { colors } from '../theme/theme';

interface GradeChartProps {
  course: Course;
}

export function GradeChart({ course }: GradeChartProps) {
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - 64; // Account for card margins

  const data = {
    labels: ['A', 'AB', 'B', 'BC', 'C', 'D', 'F'],
    datasets: [
      {
        data: [
          Math.round((course.a_percent || 0) * 100),
          Math.round((course.ab_percent || 0) * 100),
          Math.round((course.b_percent || 0) * 100),
          Math.round((course.bc_percent || 0) * 100),
          Math.round((course.c_percent || 0) * 100),
          Math.round((course.d_percent || 0) * 100),
          Math.round((course.f_percent || 0) * 100),
        ],
      },
    ],
  };

  const chartConfig = {
    backgroundColor: colors.surface,
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(220, 38, 38, ${opacity})`, // Cardinal red
    labelColor: (opacity = 1) => `rgba(55, 65, 81, ${opacity})`,
    style: {
      borderRadius: 8,
    },
    propsForLabels: {
      fontSize: 12,
    },
    propsForVerticalLabels: {
      fontSize: 10,
    },
    propsForHorizontalLabels: {
      fontSize: 10,
    },
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Grade Distribution</Title>
      <View style={styles.chartContainer}>
        <BarChart
          data={data}
          width={chartWidth}
          height={200}
          chartConfig={chartConfig}
          verticalLabelRotation={0}
          showValuesOnTopOfBars
          fromZero
          style={styles.chart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 12,
  },
  chartContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 8,
  },
  chart: {
    borderRadius: 8,
  },
});