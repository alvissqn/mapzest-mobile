/**
 * Màn hình 11 – Gallery (Xem ảnh toàn màn hình)
 * Hiển thị dưới dạng overlay toàn màn hình với màu nền đen tối, trượt nhẹ lên và fade-in
 *
 * Tính năng:
 * - Xem ảnh fullscreen bằng ScrollView ngang (snap từng trang)
 * - Bộ đếm số ảnh dạng "X / N" ở giữa phía trên
 * - Nút đóng (✕) ở góc trên bên trái
 * - Thanh thumbnail scroll ngang ở bottom: click vào thumbnail để chuyển nhanh tới ảnh tương ứng
 */
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  Animated, Dimensions, Platform, ScrollView, FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GallerySlide } from './property-gallery';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const WHITE = '#FFFFFF';
const PRIMARY = '#2563EB';

interface GalleryOverlayProps {
  visible: boolean;
  slides: GallerySlide[];
  initialIndex?: number;
  onClose: () => void;
}

export function GalleryOverlay({ visible, slides, initialIndex = 0, onClose }: GalleryOverlayProps) {
  // Animation hiển thị fade-in + slide-up nhẹ
  const animOpacity = useRef(new Animated.Value(0)).current;
  const animTranslateY = useRef(new Animated.Value(60)).current;

  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const mainScrollRef = useRef<ScrollView>(null);
  const thumbListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (visible) {
      setActiveIndex(initialIndex);
      // Animation hiện lên
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(animTranslateY, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Cuộn tới trang ban đầu sau khi overlay hiển thị
        if (initialIndex > 0 && mainScrollRef.current) {
          mainScrollRef.current.scrollTo({ x: initialIndex * SCREEN_W, animated: false });
        }
      });
    } else {
      // Animation ẩn đi
      Animated.parallel([
        Animated.timing(animOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(animTranslateY, {
          toValue: 40,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, initialIndex]);

  // Cuộn thanh thumbnail tới vị trí activeIndex
  useEffect(() => {
    if (thumbListRef.current && slides.length > 0) {
      thumbListRef.current.scrollToIndex({
        index: activeIndex,
        animated: true,
        viewPosition: 0.5, // căn giữa màn hình
      });
    }
  }, [activeIndex, slides.length]);

  /** Tính chỉ số trang khi người dùng vuốt ngang */
  function handleScroll(event: { nativeEvent: { contentOffset: { x: number } } }) {
    const x = event.nativeEvent.contentOffset.x;
    const idx = Math.round(x / SCREEN_W);
    if (idx >= 0 && idx < slides.length && idx !== activeIndex) {
      setActiveIndex(idx);
    }
  }

  /** Nhấn vào thumbnail nhỏ ở dưới */
  function handleSelectThumb(idx: number) {
    setActiveIndex(idx);
    mainScrollRef.current?.scrollTo({ x: idx * SCREEN_W, animated: true });
  }

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: animOpacity,
          transform: [{ translateY: animTranslateY }]
        }
      ]}
    >
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        
        {/* Header: Nút đóng & Counter */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={onClose}
            accessibilityLabel="Đóng chế độ xem ảnh"
          >
            <Text style={styles.closeText}>✕</Text>
          </TouchableOpacity>
          
          <Text style={styles.counterText}>
            {activeIndex + 1} / {slides.length}
          </Text>
          
          {/* Nút trống bên phải để căn giữa tiêu đề */}
          <View style={styles.placeholderBtn} />
        </View>

        {/* Main Content: Ảnh fullscreen vuốt ngang */}
        <ScrollView
          ref={mainScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.mainScroll}
          contentContainerStyle={styles.mainScrollContent}
        >
          {slides.map((slide) => (
            <View
              key={slide.id}
              style={[styles.slideContainer, { backgroundColor: slide.bgColor }]}
            >
              <Text style={styles.slideEmoji}>{slide.bgEmoji}</Text>
              {slide.label && (
                <Text style={styles.slideLabel}>{slide.label}</Text>
              )}
            </View>
          ))}
        </ScrollView>

        {/* Bottom Panel: Thanh Thumbnail scroll ngang */}
        <View style={styles.bottomBar}>
          <FlatList
            ref={thumbListRef}
            data={slides}
            keyExtractor={(item) => `thumb-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbList}
            getItemLayout={(_, index) => ({
              length: 64, // width 54 + gap 10
              offset: 64 * index,
              index
            })}
            renderItem={({ item, index }) => {
              const isActive = index === activeIndex;
              return (
                <TouchableOpacity
                  style={[
                    styles.thumbItem,
                    { backgroundColor: item.bgColor },
                    isActive && styles.thumbItemActive
                  ]}
                  onPress={() => handleSelectThumb(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.thumbEmoji}>{item.bgEmoji}</Text>
                  {isActive && <View style={styles.thumbDot} />}
                </TouchableOpacity>
              );
            }}
          />
        </View>

      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 7000, // trên cả PropertyDetail (6000)
  },
  safe: {
    flex: 1,
    justifyContent: 'space-between',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  closeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: WHITE,
    fontWeight: '700',
  },
  counterText: {
    fontSize: 15,
    fontWeight: '700',
    color: WHITE,
    letterSpacing: 0.5,
  },
  placeholderBtn: {
    width: 38,
  },

  // Scroll ảnh chính
  mainScroll: {
    flex: 1,
  },
  mainScrollContent: {
    alignItems: 'center',
  },
  slideContainer: {
    width: SCREEN_W,
    height: SCREEN_H * 0.55, // Chiếm khoảng 55% màn hình để giữ khung ảnh tỉ lệ vàng
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  slideEmoji: {
    fontSize: 120,
  },
  slideLabel: {
    position: 'absolute',
    bottom: 24,
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    overflow: 'hidden',
  },

  // Bottom Thumbnails
  bottomBar: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  thumbList: {
    paddingHorizontal: 16,
    gap: 10,
  },
  thumbItem: {
    width: 54,
    height: 54,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  thumbItemActive: {
    borderColor: PRIMARY,
    transform: [{ scale: 1.05 }],
  },
  thumbEmoji: {
    fontSize: 24,
  },
  thumbDot: {
    position: 'absolute',
    bottom: 3,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PRIMARY,
  },
});
