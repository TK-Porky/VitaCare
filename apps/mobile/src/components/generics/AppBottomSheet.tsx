import React, {
  forwardRef,
  useImperativeHandle,
  useState,
} from 'react';
import {
  View,
  StyleSheet,
  TouchableWithoutFeedback,
  ViewStyle,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import { colors } from '../../../src/themes';

export type AppBottomSheetRef = {
  open: () => void;
  close: () => void;
  expand: () => void;
};

type Props = {
  snapPoints?: string[];
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose?: () => void;
  scrollable?: boolean;
  containerStyle?: ViewStyle;
};

export const AppBottomSheet = forwardRef<AppBottomSheetRef, Props>(
  ({ children, footer, onClose, scrollable = true, containerStyle }, ref) => {
    const [visible, setVisible] = useState(false);

    const handleClose = () => {
      setVisible(false);
      onClose?.();
    };

    useImperativeHandle(ref, () => ({
      open: () => setVisible(true),
      close: handleClose,
      expand: () => setVisible(true),
    }));

    const Content = scrollable ? ScrollView : View;

    return (
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={handleClose}
      >
        <View style={styles.root}>
          {/* Backdrop */}
          <TouchableWithoutFeedback onPress={handleClose}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Sheet */}
          <View style={styles.sheet}>
            <View style={styles.handleArea}>
              <View style={styles.handle} />
            </View>

            <Content
              style={[styles.content, containerStyle]}
              {...(scrollable
                ? {
                    showsVerticalScrollIndicator: false,
                    keyboardShouldPersistTaps: 'handled' as const,
                    bounces: false,
                    contentContainerStyle: [
                      styles.scrollContent,
                      footer ? styles.scrollContentWithFooter : undefined,
                    ],
                  }
                : {})}
            >
              {children}
            </Content>

            {!!footer && <View style={styles.footer}>{footer}</View>}
          </View>
        </View>
      </Modal>
    );
  }
);

AppBottomSheet.displayName = 'AppBottomSheet';

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    elevation: 24,
    shadowColor: colors.ink,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
  },
  handleArea: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.inkFaint,
  },
  content: {
    flexShrink: 1,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  scrollContentWithFooter: {
    paddingBottom: Platform.OS === 'ios' ? 128 : 112,
  },
  footer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 16,
    backgroundColor: colors.white,
  },
});