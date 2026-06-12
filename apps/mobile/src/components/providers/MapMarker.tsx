import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { colors } from '../../themes';

type Props = {
  coordinate: {
    latitude: number;
    longitude: number;
  };
  avatarUri?: string;
  isSelected?: boolean;
  onPress?: () => void;
};

export const MapMarker = ({
  coordinate,
  avatarUri,
  isSelected = false,
  onPress,
}: Props) => {
  return (
    <Marker coordinate={coordinate} onPress={onPress} tracksViewChanges={false}>
      <View style={[styles.wrapper, isSelected && styles.wrapperSelected]}>
        <View style={[styles.bubble, isSelected && styles.bubbleSelected]}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder} />
          )}
        </View>
        <View style={[styles.tail, isSelected && styles.tailSelected]} />
      </View>
    </Marker>
  );
};

const BUBBLE_SIZE = 44;

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
  },
  wrapperSelected: {},
  bubble: {
    width: BUBBLE_SIZE,
    height: BUBBLE_SIZE,
    borderRadius: BUBBLE_SIZE / 2,
    borderWidth: 3,
    borderColor: colors.white,
    backgroundColor: colors.white,
    overflow: 'hidden',
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.18,
    shadowRadius: 6,
    elevation: 5,
  },
  bubbleSelected: {
    borderColor: colors.primaryDark,
    width: BUBBLE_SIZE + 6,
    height: BUBBLE_SIZE + 6,
    borderRadius: (BUBBLE_SIZE + 6) / 2,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: BUBBLE_SIZE / 2,
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.inkFaint,
  },
  tail: {
    width: 10,
    height: 10,
    backgroundColor: colors.white,
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    marginTop: -6,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tailSelected: {
    backgroundColor: colors.primaryDark,
  },
});
