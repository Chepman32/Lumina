import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import {
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import Animated from 'react-native-reanimated';
import {
  COLORS,
  FONT_SIZES,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../../utils/constants';

interface Props {
  onComplete: () => void;
}

export default function SimpleSplash({ onComplete }: Props) {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const particleOpacity = useSharedValue(0);

  useEffect(() => {
    // Start animation sequence
    startAnimation();
  }, []);

  const startAnimation = () => {
    // Phase 1: Logo appears
    logoOpacity.value = withTiming(1, { duration: 500 });
    logoScale.value = withSpring(1, { damping: 15, stiffness: 150 });

    // Phase 2: Particle effect
    setTimeout(() => {
      particleOpacity.value = withTiming(1, { duration: 300 });
    }, 800);

    // Phase 3: Complete
    setTimeout(() => {
      logoOpacity.value = withTiming(0, { duration: 300 });
      particleOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(onComplete)();
      });
    }, 2000);
  };

  const logoAnimatedStyle = {
    opacity: logoOpacity,
    transform: [{ scale: logoScale }],
  };

  const particleAnimatedStyle = {
    opacity: particleOpacity,
  };

  return (
    <View style={styles.container}>
      {/* Background gradient effect */}
      <View style={styles.background} />

      {/* Logo */}
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Text style={styles.logoText}>LUMINA</Text>
        <Text style={styles.tagline}>Edit with Magic</Text>
      </Animated.View>

      {/* Simple particle effect */}
      <Animated.View style={[styles.particleContainer, particleAnimatedStyle]}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.particle,
              {
                left: Math.random() * SCREEN_WIDTH,
                top: Math.random() * SCREEN_HEIGHT,
                backgroundColor: [
                  '#FF6B9D',
                  '#C44EFF',
                  '#4E9FFF',
                  '#FFC44E',
                  '#4EFFB4',
                ][i % 5],
              },
            ]}
          />
        ))}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F0F1E',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F0F1E',
    opacity: 0.9,
  },
  logoContainer: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.white,
    letterSpacing: 4,
    marginBottom: 16,
  },
  tagline: {
    fontSize: FONT_SIZES.body,
    color: COLORS.lightGray,
    letterSpacing: 1,
  },
  particleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.7,
  },
});
