import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Search } from "lucide-react-native";
import { PrimaryButton } from "../../../src/components";
import { colors, fontFamily, fontSize } from "../../themes";

type Props = {
  onSearch?: () => void;
  onMap?: () => void;
};

export function AppHeader({ onSearch, onMap }: Props) {
  const statusBarHeight = StatusBar.currentHeight ?? 44;

  return (
    <View style={[styles.container, { paddingTop: statusBarHeight + 8 }]}>
      <View style={styles.logo}>
        <Ionicons name="heart-outline" size={24} color={colors.ink} />
        <Text style={styles.logoText}>VitaCare</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onSearch}
          activeOpacity={0.7}
          style={styles.searchButton}
        >
          <Search size={20} color={colors.ink} />
        </TouchableOpacity>

        {onMap && (
          <PrimaryButton
            label="Carte"
            onPress={onMap}
            icon={<Ionicons name="map" size={16} color={colors.white} />}
            style={styles.mapButton}
            size="sm"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.white,
  },
  logo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
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
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchButton: {
    padding: 4,
  },
  mapButton: {
    width: 100,
    gap: 1,
  },
  mapText: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSize.sm,
    color: colors.white,
  },
});
