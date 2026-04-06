import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    useCallback,
  } from 'react';
  import {
    View,
    StyleSheet,
    ViewStyle,
  } from 'react-native';
  import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetScrollView,
    BottomSheetBackdropProps,
  } from '@gorhom/bottom-sheet';
  import { colors } from '../../../src/themes';
  
  export type AppBottomSheetRef = {
    open: () => void;
    close: () => void;
    expand: () => void;
  };
  
  type Props = {
    snapPoints?: (string | number)[];
    initialSnapIndex?: number;
    children: React.ReactNode;
    onClose?: () => void;
    scrollable?: boolean;
    containerStyle?: ViewStyle;
  };
  
  export const AppBottomSheet = forwardRef<AppBottomSheetRef, Props>(
    (
      {
        snapPoints = ['50%', '92%'],
        initialSnapIndex = -1,
        children,
        onClose,
        scrollable = true,
        containerStyle,
      },
      ref
    ) => {
      const sheetRef = useRef<BottomSheet>(null);
  
      useImperativeHandle(ref, () => ({
        open: () => sheetRef.current?.snapToIndex(0),
        close: () => sheetRef.current?.close(),
        expand: () => sheetRef.current?.snapToIndex(1),
      }));
  
      const handleChange = useCallback(
        (index: number) => {
          if (index === -1) onClose?.();
        },
        [onClose]
      );
  
      const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
          <BottomSheetBackdrop
            {...props}
            disappearsOnIndex={-1}
            appearsOnIndex={0}
            opacity={0.35}
            pressBehavior="close"
          />
        ),
        []
      );
  
      const Content = scrollable ? BottomSheetScrollView : View;
  
      return (
        <BottomSheet
          ref={sheetRef}
          index={initialSnapIndex}
          snapPoints={snapPoints}
          enablePanDownToClose
          backdropComponent={renderBackdrop}
          onChange={handleChange}
          handleIndicatorStyle={styles.handle}
          backgroundStyle={styles.background}
          keyboardBehavior="interactive"
          keyboardBlurBehavior="restore"
        >
          <Content
            style={[styles.content, containerStyle]}
            contentContainerStyle={scrollable ? styles.scrollContent : undefined}
          >
            {children}
          </Content>
        </BottomSheet>
      );
    }
  );
  
  AppBottomSheet.displayName = 'AppBottomSheet';
  
  const styles = StyleSheet.create({
    background: {
      backgroundColor: colors.white,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      shadowColor: colors.ink,
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
      elevation: 12,
    },
    handle: {
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.inkFaint,
      alignSelf: 'center',
      marginTop: 8,
    },
    content: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
  });