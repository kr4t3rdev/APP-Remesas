import React, { useMemo } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useResponsive, BREAKPOINTS } from '../../hooks/useResponsive';
import { gridColumns, spacing } from '../../theme';

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  gap?: number;
  padding?: number;
  maxWidth?: number;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  style,
  gap = spacing.md,
  padding = spacing.md,
  maxWidth,
}) => {
  const { breakpoint, width } = useResponsive();

  // Determine grid columns based on breakpoint
  const columns = useMemo(() => {
    switch (breakpoint) {
      case 'mobile':
        return gridColumns.mobile;
      case 'tablet':
        return gridColumns.tablet;
      case 'desktop':
      case 'wide':
        return gridColumns.desktop;
      default:
        return 1;
    }
  }, [breakpoint]);

  // Calculate item width based on columns
  const itemWidth = useMemo(() => {
    const availableWidth = maxWidth 
      ? Math.min(width, maxWidth) - padding * 2 
      : width - padding * 2;
    const totalGaps = (columns - 1) * gap;
    return (availableWidth - totalGaps) / columns;
  }, [breakpoint, width, columns, gap, padding, maxWidth]);

  // Render children as a grid
  const renderGrid = () => {
    const childArray = React.Children.toArray(children);
    const rows: React.ReactNode[][] = [];
    
    for (let i = 0; i < childArray.length; i += columns) {
      rows.push(childArray.slice(i, i + columns));
    }

    return rows.map((row, rowIndex) => (
      <View 
        key={`row-${rowIndex}`} 
        style={[styles.row, { gap, marginBottom: rowIndex < rows.length - 1 ? gap : 0 }]}
      >
        {row.map((child, colIndex) => (
          <View 
            key={`col-${colIndex}`} 
            style={[styles.item, { width: itemWidth, maxWidth: itemWidth }]}
          >
            {child}
          </View>
        ))}
      </View>
    ));
  };

  return (
    <View 
      style={[
        styles.container, 
        { padding, maxWidth: maxWidth || '100%' },
        style
      ]}
    >
      {renderGrid()}
    </View>
  );
};

// Simple responsive wrapper that passes breakpoint info
interface ResponsiveGridProps {
  children: React.ReactNode;
  minItemWidth?: number;
  style?: ViewStyle;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  minItemWidth = 200,
  style,
}) => {
  const { width, breakpoint } = useResponsive();

  const columns = useMemo(() => {
    const maxColumns = breakpoint === 'mobile' ? 1 : breakpoint === 'tablet' ? 2 : 4;
    return Math.max(1, Math.floor((width - spacing.md * 2) / (minItemWidth + spacing.md)));
  }, [width, breakpoint, minItemWidth]);

  return (
    <View style={[styles.gridContainer, style]}>
      <View style={[styles.gridRow, { gap: spacing.md }]}>
        {React.Children.map(children, (child, index) => (
          <View 
            key={index}
            style={{ 
              flex: 1,
              minWidth: minItemWidth,
              maxWidth: columns > 1 ? `${100 / columns}%` : '100%',
            }}
          >
            {child}
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    flexShrink: 0,
  },
  gridContainer: {
    width: '100%',
  },
  gridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ResponsiveContainer;
