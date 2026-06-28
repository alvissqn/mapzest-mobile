/**
 * Gallery ảnh BĐS — swipe ngang, counter "X/N", dùng cho màn Chi tiết BĐS
 * Vì chưa có ảnh thật, mỗi slide hiển thị màu nền + emoji đại diện
 */
import { useState } from 'react';
import { StyleSheet, View, Text, ScrollView, Dimensions, TouchableOpacity } from 'react-native';

const { width: SCREEN_W } = Dimensions.get('window');

/** Thông tin một slide ảnh */
export interface GallerySlide {
  id: string;
  bgColor: string;  // màu nền thay thế cho ảnh
  bgEmoji: string;  // emoji đại diện
  label?: string;   // nhãn tùy chọn (ví dụ: "Phòng khách")
}

interface PropertyGalleryProps {
  slides: GallerySlide[];
  height?: number;           // chiều cao gallery, mặc định 240
  onPageChange?: (index: number) => void;
  onPressItem?: (index: number) => void;
}

export function PropertyGallery({ slides, height = 240, onPageChange, onPressItem }: PropertyGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  /** Tính trang hiện tại từ vị trí cuộn */
  function handleScroll(event: { nativeEvent: { contentOffset: { x: number } } }) {
    const pageIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_W);
    setActiveIndex(pageIndex);
    onPageChange?.(pageIndex);
  }

  if (!slides.length) return null;

  return (
    <View style={[styles.wrapper, { height }]}>
      {/* ScrollView ngang với snap từng slide */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        accessibilityLabel="Thư viện ảnh BĐS"
      >
        {slides.map((slide, index) => (
          <TouchableOpacity
            key={slide.id}
            style={[styles.slide, { width: SCREEN_W, backgroundColor: slide.bgColor }]}
            onPress={() => onPressItem?.(index)}
            activeOpacity={0.95}
          >
            <Text style={styles.slideEmoji}>{slide.bgEmoji}</Text>
            {slide.label ? (
              <View style={styles.labelBadge}>
                <Text style={styles.labelText}>{slide.label}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Thumbnail chấm tròn ở bottom */}
      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, activeIndex === i && styles.dotActive]}
          />
        ))}
      </View>

      {/* Counter số ảnh góc phải dưới */}
      <View style={styles.counter}>
        <Text style={styles.counterText}>{activeIndex + 1}/{slides.length}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  slide: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  slideEmoji: {
    fontSize: 64,
    opacity: 0.85,
  },
  labelBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  labelText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  // Chấm trang ở dưới cùng
  dots: {
    position: 'absolute',
    bottom: 10,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#FFFFFF',
    width: 12,
  },

  // Bộ đếm X/N góc phải dưới
  counter: {
    position: 'absolute',
    bottom: 10,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  counterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
});
