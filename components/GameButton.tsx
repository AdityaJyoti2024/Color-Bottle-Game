import React from 'react';
import { Pressable, Text, StyleSheet, View, Animated, ViewStyle, TextStyle } from 'react-native';

interface GameButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'success';
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
}

export function GameButton({
  children,
  onPress,
  variant = 'primary',
  icon,
  style,
  textStyle,
  disabled = false,
}: GameButtonProps) {
  const animatedScale = React.useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (disabled) return;
    Animated.spring(animatedScale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    if (disabled) return;
    Animated.spring(animatedScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondary;
      case 'success':
        return styles.success;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const getVariantTextStyles = () => {
    switch (variant) {
      case 'secondary':
        return styles.secondaryText;
      case 'success':
        return styles.successText;
      case 'primary':
      default:
        return styles.primaryText;
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: animatedScale }], opacity: disabled ? 0.5 : 1 }}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[styles.base, getVariantStyles(), style]}
      >
        <View style={styles.contentContainer}>
          {icon && <View style={styles.iconContainer}>{icon}</View>}
          <Text style={[styles.text, getVariantTextStyles(), textStyle]}>
            {children}
          </Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 9999, // full
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
  },
  primary: {
    backgroundColor: '#4A6CF7',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondary: {
    backgroundColor: '#FFFFFF',
  },
  secondaryText: {
    color: '#4A6CF7',
  },
  success: {
    backgroundColor: '#4DFF88',
  },
  successText: {
    color: '#111827', // text-gray-900
  },
});
