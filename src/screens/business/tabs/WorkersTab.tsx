import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import { useWorkers } from '../../../hooks/queries/useBusinessQueries';
import { useColors } from '../../../store/themeStore';

export const WorkersTab = () => {
  const { data: workers, isLoading } = useWorkers();
  const colors = useColors();

  if (isLoading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </View>
    );
  }

  if (!workers || workers.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text.secondary }}>No hay trabajadores registrados</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={workers}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text.primary, fontWeight: 'bold' }}>{item.name}</Text>
            <Text style={{ color: colors.text.secondary }}>Saldo: ${item.currentBalance}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  card: { padding: 16, margin: 8, borderRadius: 8, elevation: 2 },
});
