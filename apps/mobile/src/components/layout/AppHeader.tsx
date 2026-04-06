import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { Search, Map } from 'lucide-react-native';
import { colors, fontFamily, fontSize } from '../../themes';

type Props = {
  onSearch?: () => void;
  onMap?: () => void;
};

export function AppHeader({ onSearch, onMap }: Props) {
  const statusBarHeight = StatusBar.currentHeight ?? 44;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 8 }]}>
      <View style={styles.logo}>
        <Text style={styles.logoIcon}>🤲</Text>
        <Text style={styles.logoText}>VitaCare</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity onPress={onSearch} activeOpacity={0.7} style={styles.searchButton}>
          <Search size={20} color={colors.ink} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onMap} activeOpacity={0.7} style={styles.mapButton}>
          <Map size={16} color={colors.white} />
          <Text style={styles.mapText}>Carte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 24,
  },
  logoText: {
    fontFamily: fontFamily.bold,
    fontSize: fontSize.lg,
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchButton: {
    padding: 4,
  },
  mapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryDark,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  mapText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
});