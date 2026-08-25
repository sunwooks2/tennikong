import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { Text } from '@/components/Themed';
import Colors from '@/constants/Colors';
import type { MatchTypeTrendSeries } from '@/utils/growth';

interface MatchTypeTrendChartProps {
  series: MatchTypeTrendSeries[];
  colors: (typeof Colors)['light'];
}

interface PlotPoint {
  x: number;
  y: number;
}

const CHART_HEIGHT = 120;
const CHART_PADDING_X = 12;
const CHART_PADDING_Y = 10;
const DOT_SIZE = 7;

function buildPlotPoints(values: number[], width: number): PlotPoint[] {
  const plotWidth = Math.max(width - CHART_PADDING_X * 2, 1);
  const plotHeight = CHART_HEIGHT - CHART_PADDING_Y * 2;
  const step = values.length > 1 ? plotWidth / (values.length - 1) : 0;

  return values.map((value, index) => {
    const ratio = value / 100;
    return {
      x: CHART_PADDING_X + step * index,
      y: CHART_PADDING_Y + plotHeight * (1 - ratio),
    };
  });
}

function ChartSeries({ points, color }: { points: PlotPoint[]; color: string }) {
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

export function MatchTypeTrendChart({ series, colors }: MatchTypeTrendChartProps) {
  const [chartWidth, setChartWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setChartWidth(event.nativeEvent.layout.width);
  };

  if (series.length === 0) {
    return null;
  }

  const monthLabels = series[0].points.map((point) => point.label);

  return (
    <View style={[styles.container, { borderTopColor: `${colors.muted}22` }]}>
      <Text style={[styles.title, { color: colors.text }]}>경기유형별 승률</Text>

      <View style={styles.legend}>
        {series.map((item) => (
          <View key={item.matchType} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: item.color }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>{item.label}</Text>
          </View>
        ))}
      </View>

      <View
        style={[styles.plotArea, { height: CHART_HEIGHT, backgroundColor: `${colors.muted}08` }]}
        onLayout={handleLayout}>
        {chartWidth > 0 ? (
          <>
            <View style={[styles.gridLine, { top: '25%', borderColor: `${colors.muted}18` }]} />
            <View style={[styles.gridLine, { top: '50%', borderColor: `${colors.muted}18` }]} />
            <View style={[styles.gridLine, { top: '75%', borderColor: `${colors.muted}18` }]} />
            {series.map((item) => (
              <ChartSeries
                key={item.matchType}
                points={buildPlotPoints(
                  item.points.map((point) => point.win_rate),
                  chartWidth,
                )}
                color={item.color}
              />
            ))}
          </>
        ) : null}
      </View>

      <View style={styles.labelRow}>
        {monthLabels.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.labelColumn}>
            <Text style={[styles.monthLabel, { color: colors.muted }]}>{label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
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
    height: 2,
    borderRadius: 2,
    transformOrigin: 'left center',
  },
  dot: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    borderWidth: 1.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 4,
  },
  labelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  monthLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
});
