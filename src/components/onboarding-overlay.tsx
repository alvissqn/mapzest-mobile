/**
 * OnboardingOverlay - Màn hình giới thiệu 3 slide
 *
 * FIX (Android crash):
 * - requestAnimationFrame trong runOnJS worklet callback KHÔNG chạy đúng trên Android.
 * - Fix: dùng useEffect[currentSlide] để trigger fade-in SAU KHI React commit render mới.
 *   useEffect chạy sau mount/update → đảm bảo content mới đã render rồi mới animate.
 *
 * FIX (Rendering):
 * - Simplify icon layout: dùng View thường, không dùng position:absolute phức tạp
 *   để tránh clipping issue trên Android.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Dimensions,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Dữ liệu từng slide ──────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 1,
    icon: 'map' as const,
    title: 'Khám phá BĐS\ntrên bản đồ',
    subtitle: 'Trải nghiệm bản đồ trực quan,\ntìm kiếm và kết nối dễ dàng.',
    accentColor: '#2563EB',
    emoji: '🗺️',
    featLabel: ['Bản đồ tương tác', 'Pin BĐS theo khu vực', 'Xem thực địa dễ dàng'],
  },
  {
    id: 2,
    icon: 'search' as const,
    title: 'Tìm kiếm\nthông minh',
    subtitle: 'Lọc theo giá, diện tích, khu vực\nvà hàng chục tiêu chí khác.',
    accentColor: '#4F46E5',
    emoji: '🔍',
    featLabel: ['Lọc nâng cao', 'Kết quả tức thì', 'So sánh nhiều BĐS'],
  },
  {
    id: 3,
    icon: 'connect' as const,
    title: 'Kết nối\nnhanh chóng',
    subtitle: 'Liên hệ trực tiếp với môi giới,\nđặt lịch xem nhà chỉ trong vài bước.',
    accentColor: '#06B6D4',
    emoji: '🤝',
    featLabel: ['50K+ BĐS niêm yết', '10K+ Môi giới uy tín', 'Đặt lịch online'],
  },
];

// ─── Feature Chip ─────────────────────────────────────────────────────────────
function FeatureChip({ label, color }: { label: string; color: string }) {
  return (
    <View style={[chipStyles.chip, { borderColor: color + '40', backgroundColor: color + '12' }]}>
      <View style={[chipStyles.dot, { backgroundColor: color }]} />
      <Text style={[chipStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
});

// ─── Slide Illustration ───────────────────────────────────────────────────────
/**
 * Illustration đơn giản, không dùng position:absolute phức tạp
 * để tránh clipping issues trên Android.
 */
function SlideIllustration({ slideIndex }: { slideIndex: number }) {
  const slide = SLIDES[slideIndex];
  if (!slide) return null;

  return (
    <View style={[illusStyles.container, { backgroundColor: slide.accentColor + '10' }]}>
      {/* Emoji large — render đơn giản, chắc chắn hiện trên mọi device */}
      <Text style={illusStyles.emoji}>{slide.emoji}</Text>

      {/* Card minh hoạ */}
      <View style={[illusStyles.card, { borderColor: slide.accentColor + '30' }]}>
        <View style={[illusStyles.cardHeader, { backgroundColor: slide.accentColor + '15' }]}>
          <View style={[illusStyles.cardDot, { backgroundColor: slide.accentColor }]} />
          <View style={[illusStyles.cardLine, { backgroundColor: slide.accentColor + '40', width: 80 }]} />
        </View>
        <View style={illusStyles.cardBody}>
          <View style={[illusStyles.cardLine, { backgroundColor: '#E2E8F0', width: 120 }]} />
          <View style={[illusStyles.cardLine, { backgroundColor: '#E2E8F0', width: 80, marginTop: 6 }]} />
          <View style={[illusStyles.cardPriceRow]}>
            <View style={[illusStyles.cardBadge, { backgroundColor: slide.accentColor }]}>
              <Text style={illusStyles.cardBadgeText}>BĐS nổi bật</Text>
            </View>
            <Text style={[illusStyles.cardPrice, { color: slide.accentColor }]}>28,5 tỷ</Text>
          </View>
        </View>
      </View>

      {/* Feature tags */}
      <View style={illusStyles.tagsRow}>
        {slide.featLabel.map((label) => (
          <FeatureChip key={label} label={label} color={slide.accentColor} />
        ))}
      </View>
    </View>
  );
}

const illusStyles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH - 48,
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    gap: 16,
  },
  emoji: {
    fontSize: 72,
    lineHeight: 88,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
  },
  cardDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  cardLine: {
    height: 8,
    borderRadius: 4,
  },
  cardBody: {
    padding: 12,
    gap: 4,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardPriceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  cardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  cardBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardPrice: {
    fontSize: 16,
    fontWeight: '800',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
});

// ─── Main Component ───────────────────────────────────────────────────────────
interface OnboardingOverlayProps {
  onFinish: () => void;
}

export function OnboardingOverlay({ onFinish }: OnboardingOverlayProps) {
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState(true);

  // Animation shared values
  const contentOpacity = useSharedValue(1);
  const overlayOpacity = useSharedValue(1);

  // Guard: chỉ cho chạy 1 transition tại 1 thời điểm
  // Dùng useSharedValue để có thể đọc/ghi từ cả worklet và JS thread (Reanimated 4.x)
  const isTransitioning = useSharedValue(false);
  // Skip useEffect on first mount
  const isFirstRender = useRef(true);
  // Ref để PanResponder đọc currentSlide mới nhất (tránh stale closure)
  const currentSlideRef = useRef(currentSlide);
  currentSlideRef.current = currentSlide;

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));
  const overlayAnimStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  /**
   * Phase 2 animation: fade-in sau khi currentSlide thay đổi.
   * useEffect chạy sau khi React commit render mới với slide content đúng.
   * Đây là cách an toàn nhất trên cả iOS và Android.
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Slide mới đã render → fade in, reset guard trong callback worklet
    contentOpacity.value = withTiming(1, { duration: 280, easing: Easing.out(Easing.quad) }, () => {
      // Worklet context — shared value an toàn
      isTransitioning.value = false;
    });
  }, [currentSlide]);

  /**
   * Chuyển slide — Phase 1: fade-out, rồi setCurrentSlide.
   * Phase 2 (fade-in) được xử lý bởi useEffect trên.
   */
  function goToSlide(next: number) {
    if (isTransitioning.value) return;  // JS thread đọc shared value — ok
    if (next < 0 || next >= SLIDES.length) return;
    isTransitioning.value = true;

    // Phase 1: fade out hoàn toàn
    contentOpacity.value = withTiming(0, { duration: 180, easing: Easing.in(Easing.quad) }, (finished) => {
      if (finished) {
        // Chuyển slide trên JS thread → triggers useEffect → Phase 2 fade-in
        runOnJS(setCurrentSlide)(next);
      } else {
        // Animation bị cancel → reset guard (worklet context)
        isTransitioning.value = false;
      }
    });
  }

  // ─── PanResponder (swipe gesture) ────────────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > Math.abs(gs.dy) && Math.abs(gs.dx) > 12,
      onPanResponderRelease: (_, gs) => {
        const threshold = SCREEN_WIDTH * 0.22;
        const cur = currentSlideRef.current;
        if (gs.dx < -threshold) {
          // Swipe trái → next
          if (cur < SLIDES.length - 1) {
            goToSlide(cur + 1);
          } else {
            doFinish();
          }
        } else if (gs.dx > threshold && cur > 0) {
          // Swipe phải → prev
          goToSlide(cur - 1);
        }
      },
    })
  ).current;

  function handleNext() {
    const cur = currentSlideRef.current;
    if (cur < SLIDES.length - 1) {
      goToSlide(cur + 1);
    } else {
      doFinish();
    }
  }

  function doFinish() {
    overlayOpacity.value = withTiming(0, { duration: 350, easing: Easing.inOut(Easing.quad) }, (done) => {
      if (done) {
        runOnJS(setVisible)(false);
        runOnJS(onFinish)();
      }
    });
  }

  if (!visible) return null;

  const slide = SLIDES[currentSlide] ?? SLIDES[0];
  const isLastSlide = currentSlide === SLIDES.length - 1;

  return (
    <Animated.View style={[styles.container, overlayAnimStyle]}>
      <LinearGradient
        colors={['#EFF6FF', '#DBEAFE', '#F0F9FF']}
        locations={[0, 0.5, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Accent decorations */}
      <View style={[styles.accent1, { backgroundColor: slide.accentColor + '12' }]} />
      <View style={[styles.accent2, { backgroundColor: slide.accentColor + '08' }]} />

      {/* Skip button */}
      <View style={[styles.skipRow, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={doFinish} style={styles.skipBtn} activeOpacity={0.7}>
          <Text style={[styles.skipText, { color: slide.accentColor }]}>Bỏ qua</Text>
        </TouchableOpacity>
      </View>

      {/* Slide content với PanResponder + fade animation */}
      <View style={styles.contentArea} {...panResponder.panHandlers}>
        <Animated.View style={[styles.contentInner, contentAnimStyle]}>
          {/* Illustration */}
          <View style={styles.illustrationWrapper}>
            <SlideIllustration slideIndex={currentSlide} />
          </View>

          {/* Text */}
          <View style={styles.textArea}>
            <Text style={styles.slideTitle}>{slide.title}</Text>
            <Text style={styles.slideSubtitle}>{slide.subtitle}</Text>
          </View>
        </Animated.View>
      </View>

      {/* Bottom controls */}
      <View style={[styles.bottomControls, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                i === currentSlide
                  ? { width: 24, height: 8, backgroundColor: slide.accentColor, borderRadius: 4 }
                  : { width: 8, height: 8, backgroundColor: slide.accentColor + '44', borderRadius: 4 },
              ]}
            />
          ))}
        </View>

        {/* Button Tiếp tục / Bắt đầu */}
        <TouchableOpacity
          onPress={handleNext}
          activeOpacity={0.85}
          style={styles.nextBtnWrapper}
        >
          <LinearGradient
            colors={[slide.accentColor, slide.accentColor + 'CC']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextBtn}
          >
            <Text style={styles.nextBtnText}>
              {isLastSlide ? 'Bắt đầu →' : 'Tiếp tục →'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {currentSlide === 0 && (
          <Text style={[styles.swipeHint, { color: slide.accentColor + '88' }]}>
            Vuốt trái/phải để xem thêm
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    zIndex: 9000,
    backgroundColor: '#EFF6FF',
  },
  accent1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
  },
  accent2: {
    position: 'absolute',
    bottom: 160,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  skipRow: {
    position: 'absolute',
    top: 0,
    right: 20,
    zIndex: 10,
  },
  skipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    paddingTop: 64,
  },
  contentInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
  },
  illustrationWrapper: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  textArea: {
    alignItems: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  slideTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  slideSubtitle: {
    fontSize: 15,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomControls: {
    paddingHorizontal: 32,
    gap: 14,
    alignItems: 'center',
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {},
  nextBtnWrapper: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  nextBtn: {
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  swipeHint: {
    fontSize: 12,
    fontWeight: '400',
  },
});
