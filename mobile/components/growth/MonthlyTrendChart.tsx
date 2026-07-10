import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { MonthlyTrendPoint } from '@/utils/growth';

interface MonthlyTrendChartProps {
  points: MonthlyTrendPoint[];
  colors: (typeof Colors)['light'];
}

interface PlotPoint {
  x: number;
  y: number;
}

const CHART_HEIGHT = 132;
const CHART_PADDING_X = 12;
const CHART_PADDING_Y = 10;
const DOT_SIZE = 8;

function buildPlotPoints(
  values: number[],
  maxValue: number,
  width: number,
): PlotPoint[] {
  if (values.length === 0) return [];

  const plotWidth = Math.max(width - CHART_PADDING_X * 2, 1);
  const plotHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  return values.map((value, index) => {
    const ratio = maxValue > 0 ? value / maxValue : 0;
    return {
      x: CHART_PADDING_X + step * index,
      y: CHART_PADDING_Y + plotHeight * (1 - ratio),
    };
  });
}

function ChartLine({
  points,
  color,
}: {
  points: PlotPoint[];
  color: string;
}) {
  if (points.length < 2) return null;

  return (
    <>
      {points.slice(0, -1).map((point, index) => {
        const next = points[index + 1];
        const dx = next.x - point.x;
        const dy = next.y - point.y;
        const length = Math.hypot(dx, dy);
        const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

        return (
          <View
            key={`line-${index}`}
            style={[
              styles.lineSegment,
              {
                left: point.x,
                top: point.y,
                width: length,
                backgroundColor: color,
                transform: [{ rotate: `${angle}deg` }],
              },
            ]}
          />
        );
      })}
      {points.map((point, index) => (
        <View
          key={`dot-${index}`}
          style={[
            styles.dot,
            {
              left: point.x - DOT_SIZE / 2,
              top: point.y - DOT_SIZE / 2,
              backgroundColor: color,
              borderColor: `${color}55`,
            },
          ]}
        />
      ))}
    </>
  );
}

export function MonthlyTrendChart({ points, colors }: MonthlyTrendChartProps) {
  const [chartWidth, setChartWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  if (points.length === 0) {
    return <Text style={[styles.empty, { color: colors.muted }]}>기록이 없습니다</Text>;
  }

  const maxTotal = Math.max(...points.map((point) => point.total), 1);
  const totals = points.map((point) => point.total);
  const winRates = points.map((point) => point.win_rate);
  const totalPoints = buildPlotPoints(totals, maxTotal, chartWidth);
  const ratePoints = buildPlotPoints(winRates, 100, chartWidth);

  return (
    <View style={styles.container}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: colors.tint }]} />
          <Text style={[styles.legendText, { color: colors.muted }]}>경기수</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendLine, { backgroundColor: colors.win }]} />
          <Text style={[styles.legendText, { color: colors.muted }]}>승률</Text>
        </View>
      </View>

      <View
        style={[styles.plotArea, { height: CHART_HEIGHT, backgroundColor: `${colors.muted}08` }]}
        onLayout={handleLayout}>
        {chartWidth > 0 ? (
          <>
            <View style={[styles.gridLine, { top: '25%', borderColor: `${colors.muted}18` }]} />
            <View style={[styles.gridLine, { top: '50%', borderColor: `${colors.muted}18` }]} />
            <View style={[styles.gridLine, { top: '75%', borderColor: `${colors.muted}18` }]} />
            <ChartLine points={totalPoints} color={colors.tint} />
            <ChartLine points={ratePoints} color={colors.win} />
          </>
        ) : null}
      </View>

      <View style={styles.labelRow}>
        {points.map((point) => (
          <View key={point.key} style={styles.labelColumn}>
            <Text style={[styles.monthLabel, { color: colors.muted }]}>{point.label}</Text>
            <Text style={[styles.meta, { color: colors.tint }]}>{point.total}경기</Text>
            <Text style={[styles.meta, { color: colors.win }]}>{point.win_rate}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  legend: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendLine: {
    width: 18,
    height: 3,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
  },
  plotArea: {
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  lineSegment: {
    position: 'absolute',
    height: 2.5,
    borderRadius: 2,
    transformOrigin: 'left center',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 2,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  labelColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    minWidth: 0,
  },
  monthLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  meta: {
    fontSize: 10,
    fontWeight: '600',
  },
  empty: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
