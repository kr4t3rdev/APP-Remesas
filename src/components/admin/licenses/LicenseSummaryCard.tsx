import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LicenseDetail } from '../../../types/licenses';
import { useColors } from '../../../store/themeStore';

interface LicenseSummaryCardProps {
  license: LicenseDetail;
}

export const LicenseSummaryCard: React.FC<LicenseSummaryCardProps> = ({ license }) => {
  const colors = useColors();
  const isDark = colors.background === '#0f172a';
  const progress = Math.min(1, license.usedUsers / license.maxUsers);
  
  return (
    <View style={[styles.card, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: isDark ? '#334155' : '#dbeafe' }]}>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Ionicons name="ribbon" size={24} color="#fff" />
        </View>
        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: isDark ? '#fff' : '#1e3a8a' }]}>Licencia {license.planName}</Text>
            {license.planName.includes('Enterprise') && (
              <View style={[styles.proBadge, { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.2)' : '#dbeafe' }]}>
                <Text style={styles.proText}>PRO</Text>
              </View>
            )}
          </View>
          <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
            {license.billingCycle} • ID: {license.licenseKey}
          </Text>
        </View>
      </View>

      <View style={styles.usageRow}>
        <Text style={[styles.usageLabel, { color: colors.text.secondary }]}>Cupos utilizados</Text>
        <Text style={styles.usageValue}>
          <Text style={[styles.used, { color: colors.text.primary }]}>{license.usedUsers}</Text>
          <Text style={[styles.total, { color: colors.text.secondary }]}> / {license.maxUsers}</Text>
        </Text>
      </View>

      <View style={[styles.progressBarBg, { backgroundColor: isDark ? '#334155' : '#dbeafe' }]}>
        <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  info: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  proBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  proText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 13,
  },
  usageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 12,
  },
  usageLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  usageValue: {
    fontSize: 16,
  },
  used: {
    fontWeight: '700',
    fontSize: 20,
  },
  total: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
});
