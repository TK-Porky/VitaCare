import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fontFamily, fontSize } from '../../../src/themes';

type Props = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  style?: ViewStyle;
};

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = 'Rechercher votre position...',
  onFilterPress,
  style,
}: Props) => {
  return (
    <View style={[styles.container, style]}>
      <Ionicons
        name="search-outline"
        size={18}
        color={colors.inkMuted}
        style={styles.searchIcon}
      />
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkMuted}
        returnKeyType="search"
      />
      <TouchableOpacity
        style={styles.filterButton}
        onPress={onFilterPress}
        activeOpacity={0.75}
        hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
      >
        <Ionicons name="options-outline" size={18} color={colors.ink} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 999,
    paddingHorizontal: 14,
    height: 44,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: fontFamily.regular,
    fontSize: fontSize.md,
    color: colors.ink,
    padding: 0,
  },
  filterButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});