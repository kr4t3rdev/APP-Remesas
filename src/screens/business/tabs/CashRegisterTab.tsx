import React from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { useCashMovements } from '../../../hooks/queries/useBusinessQueries';
import { useColors } from '../../../store/themeStore';
import { Ionicons } from '@expo/vector-icons';
import { CashMovementCard } from '../components/CashMovementCard';
import { CashAuditCard } from '../components/CashAuditCard';
import { CashSafetyBuffer } from '../components/CashSafetyBuffer';

export const CashRegisterTab = () => {
  const { data: movements, isLoading } = useCashMovements();
  const colors = useColors();

  // Mocks para la UI hasta que los hooks tengan datos reales adaptados al nuevo diseño
  const mockMovements = [
    { id: '1', title: 'Petty Cash: Office Supplies', subtitle: 'Invoice #8821 • 10:45 AM', amount: 45.00, type: 'EXPENSE' as const, badgeLabel: 'Expense' },
    { id: '2', title: 'Daily Register Closing', subtitle: 'Store Terminal A • 09:12 AM', amount: 1240.00, type: 'INCOME' as const, badgeLabel: 'Income' },
    { id: '3', title: 'Cash Withdrawal (Bank Deposit)', subtitle: 'Ref: DEP-0021 • 04:30 PM', amount: 5000.00, type: 'TRANSFER' as const, badgeLabel: 'Transfer' },
  ];

  const mockAudit = {
    dateFormatted: 'Oct 23, 2023 • 06:15 PM',
    expected: 16285.50,
    actual: 16285.50,
    status: 'MATCHED' as const,
    auditorName: 'Michael Scott (Manager)',
  };

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {/* TOTAL LIQUID ASSETS SECTION */}
      <View style={styles.headerSection}>
        <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>TOTAL LIQUID ASSETS</Text>
        <Text style={[styles.headerAmount, { color: colors.text.primary }]}>$12,480.50</Text>
        <View style={styles.trendContainer}>
          <Ionicons name="trending-up" size={14} color="#10B981" />
          <Text style={styles.trendText}>+2.4% <Text style={{ color: colors.text.secondary, fontWeight: 'normal' }}>vs. last audit</Text></Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#F3F4F6' }]}>
            <Text style={[styles.actionButtonText, { color: '#1D4ED8' }]}>Add Adjustment</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#1D4ED8' }]}>
            <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Start Audit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* RECENT MOVEMENTS SECTION */}
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>Recent Movements</Text>
        <TouchableOpacity>
          <Text style={styles.viewAllText}>View All</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.dateGroupLabel, { color: colors.text.secondary }]}>TODAY, OCT 24</Text>
      {mockMovements.slice(0, 2).map(mov => (
        <CashMovementCard key={mov.id} movement={mov} />
      ))}

      <Text style={[styles.dateGroupLabel, { color: colors.text.secondary, marginTop: 12 }]}>YESTERDAY, OCT 23</Text>
      {mockMovements.slice(2).map(mov => (
        <CashMovementCard key={mov.id} movement={mov} />
      ))}

      {/* AUDIT AND SAFETY BUFFER */}
      <View style={{ marginTop: 24 }}>
        <CashAuditCard audit={mockAudit} />
        <CashSafetyBuffer percentage={82} recommendedDeposit={2000} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  headerSection: {
    marginBottom: 32,
  },
  headerSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 8,
  },
  headerAmount: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -1.5,
    marginBottom: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 24,
  },
  trendText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '700',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  dateGroupLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 12,
  },
});
