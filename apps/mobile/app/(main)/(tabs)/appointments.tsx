import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
} from 'react-native';
import { colors } from '../../../src/themes';
import { APPOINTMENTS, PAST_APPOINTMENTS } from '../../../src/data/mockAppointments';
import { AppHeader } from '../../../src/components';
import { TabsSection } from '../../../src/components';
import { MonthHeader } from '../../../src/components';
import { AppointmentCard } from '../../../src/components';

// Screen
export default function AppointmentScreen() {
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  const data = activeTab === 'upcoming' ? APPOINTMENTS : PAST_APPOINTMENTS;
  const monthLabel = 'Mars';
  const count = data.length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.primary} />

      {/* Top bar */}
      <AppHeader 
        onFilter={() => {console.log('Filter pressed')}} 
        title="Rendez-vous"
      />

      {/* Tabs */}
      <TabsSection activeTab={activeTab} onTabChange={setActiveTab} />

      {/* List */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Month header */}
        <MonthHeader monthLabel={monthLabel} count={count} />

        {data.map((item) => (
          <AppointmentCard key={item.id} item={item} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 20,
  },
});