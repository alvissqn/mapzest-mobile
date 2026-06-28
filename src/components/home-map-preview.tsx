import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_300 = '#D1D5DB';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';

// Mock pin positions (tỷ lệ %)
const MOCK_PINS = [
  { id: '1', x: 0.25, y: 0.35, price: '2.5 tỷ', active: true  },
  { id: '2', x: 0.55, y: 0.50, price: '4.1 tỷ', active: false },
  { id: '3', x: 0.70, y: 0.28, price: '1.8 tỷ', active: false },
  { id: '4', x: 0.40, y: 0.65, price: '3.2 tỷ', active: false },
];

interface HomeMapPreviewProps {
  onOpenFullMap?: () => void;
}

export function HomeMapPreview({ onOpenFullMap }: HomeMapPreviewProps) {
  const MAP_H = 180;
  const MAP_W_PERCENT = 1; // full width

  return (
    <View style={styles.wrapper}>
      {/* Map area */}
      <TouchableOpacity
        style={[styles.mapContainer, { height: MAP_H }]}
        onPress={onOpenFullMap}
        activeOpacity={0.92}
        accessibilityLabel="Mở bản đồ toàn màn hình"
      >
        {/* Grid pattern giả lập bản đồ */}
        <View style={styles.mapBg}>
          {/* Đường ngang */}
          {[0.25, 0.5, 0.75].map((y) => (
            <View
              key={`h-${y}`}
              style={[styles.gridLineH, { top: `${y * 100}%` as any }]}
            />
          ))}
          {/* Đường dọc */}
          {[0.2, 0.4, 0.6, 0.8].map((x) => (
            <View
              key={`v-${x}`}
              style={[styles.gridLineV, { left: `${x * 100}%` as any }]}
            />
          ))}

          {/* Khối block giả lập block nhà */}
          <View style={[styles.block, { top: '30%', left: '15%', width: 48, height: 28 }]} />
          <View style={[styles.block, { top: '55%', left: '35%', width: 36, height: 20 }]} />
          <View style={[styles.block, { top: '20%', left: '60%', width: 52, height: 32 }]} />
          <View style={[styles.block, { top: '60%', left: '65%', width: 40, height: 24 }]} />
        </View>

        {/* Pin markers */}
        {MOCK_PINS.map((pin) => (
          <View
            key={pin.id}
            style={[
              styles.pinContainer,
              {
                left: `${pin.x * 100}%` as any,
                top: `${pin.y * 100}%` as any,
              },
            ]}
          >
            <View style={[styles.pinBubble, pin.active && styles.pinBubbleActive]}>
              <Text style={[styles.pinText, pin.active && styles.pinTextActive]}>
                {pin.price}
              </Text>
            </View>
            <View style={[styles.pinTail, pin.active && styles.pinTailActive]} />
          </View>
        ))}

        {/* Overlay gradient bottom */}
        <View style={styles.mapGradient} />

        {/* Button mở bản đồ */}
        <View style={styles.openMapBtn}>
          <Text style={styles.openMapIcon}>🗺️</Text>
          <Text style={styles.openMapText}>Mở bản đồ</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
  },
  mapContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#E8F0FE',
    position: 'relative',
  },
  mapBg: {
    ...StyleSheet.absoluteFill,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  block: {
    position: 'absolute',
    backgroundColor: '#BFDBFE',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#93C5FD',
  },

  // Pin
  pinContainer: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -28 }, { translateY: -32 }],
  },
  pinBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderWidth: 1.5,
    borderColor: GRAY_300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  pinBubbleActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  pinText: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY_800,
  },
  pinTextActive: {
    color: '#FFFFFF',
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: GRAY_300,
    marginTop: -1,
  },
  pinTailActive: {
    borderTopColor: PRIMARY,
  },

  // Gradient overlay
  mapGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },

  // Open map button
  openMapBtn: {
    position: 'absolute',
    bottom: 10,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  openMapIcon: {
    fontSize: 13,
  },
  openMapText: {
    fontSize: 12,
    fontWeight: '700',
    color: PRIMARY,
  },
});
