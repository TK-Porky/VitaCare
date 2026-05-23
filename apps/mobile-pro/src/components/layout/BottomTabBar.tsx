/**
 * BottomTabBar — VitaCare Pro
 * Navigation principale : Accueil | Agenda | Patients | Profil
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import { colors, fontFamily, fontSize } from '../../themes';

interface TabItem {
  name:       string;
  path:       string;
  icon:       keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label:      string;
}

const TABS: TabItem[] = [
  { name: 'index',    path: '/(main)/(tabs)/',        icon: 'grid-outline',     iconActive: 'grid',         label: 'Accueil' },
  { name: 'agenda',   path: '/(main)/(tabs)/agenda',   icon: 'calendar-outline', iconActive: 'calendar',     label: 'Agenda' },
  { name: 'patients', path: '/(main)/(tabs)/patients', icon: 'people-outline',   iconActive: 'people',       label: 'Patients' },
  { name: 'profile',  path: '/(main)/(tabs)/profile',  icon: 'person-outline',   iconActive: 'person',       label: 'Profil' },
];

export function BottomTabBar() {
  const insets   = useSafeAreaInsets();
  const pathname = usePathname();

  const isActive = (tab: TabItem): boolean => {
    const normalized = pathname.replace(/\/$/, '');
    if (tab.name === 'index') {
      return (
        normalized === '' ||
        normalized === '/' ||
        normalized === '/(main)/(tabs)' ||
        normalized === '/(main)/(tabs)/index'
      );
    }
    return normalized.endsWith(`/${tab.name}`);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => router.replace(tab.path as any)}
            activeOpacity={0.7}
          >
            {active && <View style={styles.indicator} />}
            <Ionicons
              name={active ? tab.iconActive : tab.icon}
              size={22}
              color={active ? colors.primary : colors.inkLight}
            />
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection:   'row',
    justifyContent:  'center',
    alignItems:      'center',
    backgroundColor: colors.white,
    borderTopWidth:  1,
    borderTopColor:  colors.border,
    paddingTop:      10,
    elevation:       8,
    shadowColor:     '#000',
    shadowOffset:    { width: 0, height: -2 },
    shadowOpacity:   0.05,
    shadowRadius:    4,
  },
  tabItem: {
    flex:           1,
    maxWidth:       100,
    alignItems:     'center',
    justifyContent: 'center',
    paddingVertical:   6,
    paddingHorizontal: 8,
    position:       'relative',
  },
  label: {
    fontFamily:    fontFamily.medium,
    fontSize:      fontSize.xs,
    color:         colors.inkFaint,
    marginTop:     4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  labelActive: {
    color: colors.primary,
  },
  indicator: {
    position:              'absolute',
    top:                   -10,
    left:                  '20%',
    right:                 '20%',
    height:                3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius:3,
    backgroundColor:       colors.primary,
  },
});
