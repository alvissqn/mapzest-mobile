import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  runOnJS,
  Easing,
  Keyframe,
} from 'react-native-reanimated';

// @ts-ignore
import classes from './animated-icon.module.css';
const DURATION = 300;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SplashOverlayProps {
  /** Callback gọi khi splash screen đã ẩn hoàn toàn */
  onFinish?: () => void;
}

export function AnimatedSplashOverlay({ onFinish }: SplashOverlayProps) {
  const [visible, setVisible] = useState(true);

  // Reanimated shared values
  const fadeOutOpacity = useSharedValue(1);
  const fadeOutTranslateY = useSharedValue(0);
  
  const logoOpacity = useSharedValue(0);
  const logoScale = useSharedValue(0.6);
  
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(20);
  
  const progress = useSharedValue(0);

  useEffect(() => {
    // 1. Logo animation: Fade in & scale up
    logoOpacity.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.back(1.2)) 
    });
    logoScale.value = withTiming(1, { 
      duration: 800, 
      easing: Easing.out(Easing.back(1.2)) 
    });

    // 2. Text & Tagline animation: Fade in & slide up after logo
    textOpacity.value = withDelay(400, withTiming(1, { 
      duration: 600, 
      easing: Easing.out(Easing.quad) 
    }));
    textTranslateY.value = withDelay(400, withTiming(0, { 
      duration: 600, 
      easing: Easing.out(Easing.quad) 
    }));

    // 3. Fake Progress loading bar: 0% -> 100% in 2.2 seconds
    progress.value = withTiming(1, { 
      duration: 2200, 
      easing: Easing.inOut(Easing.quad) 
    });

    // 4. Fade out & Slide up whole splash overlay after progress finishes
    const fadeOutDelay = 2400; // 2200ms progress + 200ms delay
    fadeOutOpacity.value = withDelay(fadeOutDelay, withTiming(0, { 
      duration: 500, 
      easing: Easing.inOut(Easing.quad) 
    }));
    fadeOutTranslateY.value = withDelay(fadeOutDelay, withTiming(-SCREEN_HEIGHT, { 
      duration: 550, 
      easing: Easing.in(Easing.quad) 
    }));

    // 5. Hide splash overlay and notify parent using robust JS timer
    const timer = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, fadeOutDelay + 550);

    return () => clearTimeout(timer);
  }, []);

  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: fadeOutOpacity.value,
    transform: [{ translateY: fadeOutTranslateY.value }],
  }));

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: progress.value * (SCREEN_WIDTH * 0.5),
  }));

  if (!visible) return null;

  return (
    <Animated.View style={[styles.splashContainer, containerAnimatedStyle]}>
      {/* Full-screen Blue Gradient Background */}
      <LinearGradient
        colors={['#1E6EC8', '#1565C0', '#0D47A1', '#0A3880']}
        locations={[0, 0.3, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle glow overlays */}
      <View style={[styles.glow, styles.glowTop]} />
      <View style={[styles.glow, styles.glowCenter]} />

      <View style={styles.contentContainer}>
        {/* MapZest Logo */}
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <View style={styles.pinOuter}>
            <View style={styles.houseContainer}>
              <View style={styles.houseRoof} />
              <View style={styles.houseBody}>
                <View style={styles.houseDoor} />
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Brand Name & Tagline */}
        <Animated.View style={[styles.textWrapper, textAnimatedStyle]}>
          <Text style={styles.brandText}>MAPZEST</Text>
          <Text style={styles.taglineText}>BĐS thông minh</Text>
          <Text style={styles.taglineText}>Kết nối giá trị</Text>
        </Animated.View>
      </View>

      {/* City Skyline Silhouette */}
      <View style={styles.cityContainer} pointerEvents="none">
        <View style={styles.cityRow}>
          <View style={[styles.building, { width: 22, height: 55, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 18, height: 40, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 28, height: 80, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 20, height: 50, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 35, height: 100, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 22, height: 65, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 18, height: 45, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 30, height: 90, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 24, height: 60, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 20, height: 48, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 32, height: 85, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 18, height: 38, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 26, height: 70, marginHorizontal: 2 }]} />
          <View style={[styles.building, { width: 22, height: 55, marginHorizontal: 2 }]} />
        </View>
        <View style={[styles.cityRow, styles.cityRowFront]}>
          <View style={[styles.buildingFront, { width: 30, height: 70 }]} />
          <View style={[styles.buildingFront, { width: 24, height: 50 }]} />
          <View style={[styles.buildingFront, { width: 20, height: 40 }]} />
          <View style={[styles.buildingFront, { width: 40, height: 110 }]} />
          <View style={[styles.buildingFront, { width: 28, height: 75 }]} />
          <View style={[styles.buildingFront, { width: 22, height: 55 }]} />
          <View style={[styles.buildingFront, { width: 36, height: 95 }]} />
          <View style={[styles.buildingFront, { width: 26, height: 65 }]} />
          <View style={[styles.buildingFront, { width: 20, height: 45 }]} />
          <View style={[styles.buildingFront, { width: 32, height: 80 }]} />
          <View style={[styles.buildingFront, { width: 24, height: 58 }]} />
        </View>
      </View>

      {/* Progress Loading Bar (Bottom) */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBackground}>
          <Animated.View style={[styles.progressBarFill, progressAnimatedStyle]} />
        </View>
      </View>
    </Animated.View>
  );
}

// @ts-ignore
const keyframe = new Keyframe({
  0: {
    transform: [{ scale: 0 }],
  },
  60: {
    transform: [{ scale: 1.2 }],
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    easing: Easing.elastic(1.2),
  },
});

// @ts-ignore
const logoKeyframe = new Keyframe({
  0: {
    opacity: 0,
  },
  60: {
    transform: [{ scale: 1.2 }],
    opacity: 0,
    easing: Easing.elastic(1.2),
  },
  100: {
    transform: [{ scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(1.2),
  },
});

// @ts-ignore
const glowKeyframe = new Keyframe({
  0: {
    transform: [{ rotateZ: '-180deg' }, { scale: 0.8 }],
    opacity: 0,
  },
  [DURATION / 1000]: {
    transform: [{ rotateZ: '0deg' }, { scale: 1 }],
    opacity: 1,
    easing: Easing.elastic(0.7),
  },
  100: {
    transform: [{ rotateZ: '7200deg' }],
  },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconContainer}>
      <Animated.View entering={glowKeyframe.duration(60 * 1000 * 4)} style={styles.glowImage}>
        <Image style={styles.glowImage} source={require('@/assets/images/logo-glow.png')} />
      </Animated.View>

      <Animated.View style={styles.background} entering={keyframe.duration(DURATION)}>
        <div className={classes.expoLogoBackground} />
      </Animated.View>

      <Animated.View style={styles.imageContainer} entering={logoKeyframe.duration(DURATION)}>
        <Image style={styles.image} source={require('@/assets/images/expo-logo.png')} />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Splash Screen styles
  splashContainer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#1565C0', // Fallback blue
    zIndex: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    borderRadius: 999,
  },
  glowTop: {
    width: 350,
    height: 350,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    top: -80,
    alignSelf: 'center',
  },
  glowCenter: {
    width: 280,
    height: 280,
    backgroundColor: 'rgba(100, 180, 255, 0.08)',
    top: SCREEN_HEIGHT * 0.25,
    alignSelf: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginTop: -60,
  },
  logoWrapper: {
    width: 110,
    height: 110,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinOuter: {
    width: 84,
    height: 84,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    borderTopLeftRadius: 42,
    borderTopRightRadius: 42,
    borderBottomLeftRadius: 42,
    borderBottomRightRadius: 8,
    transform: [{ rotate: '45deg' }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  houseContainer: {
    transform: [{ rotate: '-45deg' }],
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -4,
  },
  houseRoof: {
    width: 22,
    height: 22,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
    marginBottom: -9,
  },
  houseBody: {
    width: 20,
    height: 15,
    borderWidth: 4,
    borderTopWidth: 0,
    borderColor: '#FFFFFF',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  houseDoor: {
    width: 6,
    height: 7,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  textWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  brandText: {
    fontSize: 30,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 5,
  },
  brandTextHighlight: {
    color: '#FFFFFF',
  },
  taglineText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.85)',
    letterSpacing: 0.5,
    fontWeight: '400',
    textAlign: 'center',
  },
  // City Skyline Silhouette
  cityContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
    overflow: 'hidden',
  },
  cityRow: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  cityRowFront: {
    bottom: 0,
  },
  building: {
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    marginHorizontal: 1,
  },
  buildingFront: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    marginHorizontal: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 50,
    width: '50%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 2,
  },

  // HomeScreen AnimatedIcon styles (Original kept)
  container: {
    alignItems: 'center',
    width: '100%',
    zIndex: 1000,
    position: 'absolute',
    top: 128 / 2 + 138,
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  glowImage: {
    width: 201,
    height: 201,
    position: 'absolute',
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 128,
    height: 128,
  },
  image: {
    position: 'absolute',
    width: 76,
    height: 71,
  },
  background: {
    width: 128,
    height: 128,
    position: 'absolute',
  },
});
