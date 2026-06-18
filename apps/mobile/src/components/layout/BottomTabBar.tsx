import React from "react";
import { View, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { colors, fontFamily, fontSize } from "../../themes";

interface TabItem {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
  label: string;
}

const TABS: TabItem[] = [
  {
    name: "index",
    icon: "home-outline",
    iconActive: "home",
    label: "Accueil",
  },
  {
    name: "explore",
    icon: "search-outline",
    iconActive: "search",
    label: "Explorer",
  },
  {
    name: "appointments",
    icon: "calendar-outline",
    iconActive: "calendar",
    label: "RDV",
  },
  {
    name: "medications",
    icon: "medical-outline",
    iconActive: "medical",
    label: "Drugs",
  },
  {
    name: "profile",
    icon: "person-outline",
    iconActive: "person",
    label: "Profil",
  },
];

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 12),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const tab = TABS.find((t) => t.name === route.name);
        if (!tab) return null;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.7}
          >
            {isFocused && <View style={styles.indicator} />}
            <Ionicons
              name={isFocused ? tab.iconActive : tab.icon}
              size={22}
              color={isFocused ? colors.primary : colors.inkLight}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center", // Align items centered for larger displays (tablets)
    alignItems: "center",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    maxWidth: 100, // Keeps an elegant look on wide screens (tablets)
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    position: "relative",
  },
  tabLabel: {
    fontFamily: fontFamily.medium,
    fontSize: fontSize.xs, // Dynamic 10px standard size
    fontWeight: "500",
    color: colors.inkFaint,
    marginTop: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tabLabelActive: {
    color: colors.primary,
  },
  indicator: {
    position: "absolute",
    top: -10, // Places the indicator precisely covering the top border of the tab bar
    left: "20%",
    right: "20%",
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: colors.primary,
  },
});
