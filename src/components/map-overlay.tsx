/**
 * Màn hình 08 – Bản đồ toàn màn hình & Màn hình 09 – Property Preview on Map
 * Hiển thị dưới dạng overlay toàn màn hình trượt lên từ dưới.
 *
 * Tính năng:
 * - Bản đồ giả lập với sông, đường và các block
 * - Cluster markers theo khu vực (Thủ Đức, Quận 7, Bình Dương...)
 * - Pin markers giá cụ thể từng BĐS
 * - Tab loại BĐS ở bottom: Căn hộ, Nhà phố, Biệt thự, Đất nền để lọc nhanh
 * - Popup preview (màn 09) hiển thị ở phía dưới khi click vào Pin cụ thể
 * - Nút "Bộ lọc" mở overlay filter, nút "Hiển thị" (Danh sách) đóng bản đồ
 * - Ô tìm kiếm overlay ở top kèm nút quay lại
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  TextInput, Animated, Dimensions, Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/theme';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_300 = '#D1D5DB';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const GREEN = '#16A34A';
const WHITE = '#FFFFFF';

// Mock danh sách BĐS trên bản đồ để render Pin
interface MapProperty {
  id: string;
  title: string;
  address: string;
  price: string;
  pricePerM2: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  type: string;
  typeId: 'can-ho' | 'nha-pho' | 'biet-thu' | 'dat-nen';
  bgColor: string;
  bgEmoji: string;
  x: number; // vị trí tỷ lệ % ngang
  y: number; // vị trí tỷ lệ % dọc
}

const MOCK_MAP_PROPERTIES: MapProperty[] = [
  {
    id: 'm1',
    title: 'Vinhomes Grand Park',
    address: 'Long Bình, TP. Thủ Đức',
    price: '3.2 tỷ', pricePerM2: '52 tr/m²',
    area: 62, bedrooms: 2, bathrooms: 2,
    type: 'Căn hộ', typeId: 'can-ho',
    bgColor: '#DBEAFE', bgEmoji: '🏢',
    x: 0.35, y: 0.40,
  },
  {
    id: 'm2',
    title: 'Nhà phố Thảo Điền',
    address: 'Thảo Điền, TP. Thủ Đức',
    price: '12.5 tỷ', pricePerM2: '108 tr/m²',
    area: 115, bedrooms: 4, bathrooms: 3,
    type: 'Nhà phố', typeId: 'nha-pho',
    bgColor: '#FEF3C7', bgEmoji: '🏠',
    x: 0.58, y: 0.48,
  },
  {
    id: 'm3',
    title: 'Biệt thự Nam Sài Gòn',
    address: 'Phú Mỹ Hưng, Quận 7',
    price: '38 tỷ', pricePerM2: '95 tr/m²',
    area: 400, bedrooms: 6, bathrooms: 5,
    type: 'Biệt thự', typeId: 'biet-thu',
    bgColor: '#F0FDF4', bgEmoji: '🏰',
    x: 0.28, y: 0.68,
  },
  {
    id: 'm4',
    title: 'Đất nền Bình Dương',
    address: 'Dĩ An, Bình Dương',
    price: '1.8 tỷ', pricePerM2: '18 tr/m²',
    area: 100, bedrooms: 0, bathrooms: 0,
    type: 'Đất nền', typeId: 'dat-nen',
    bgColor: '#FDF4FF', bgEmoji: '🌿',
    x: 0.72, y: 0.25,
  },
  {
    id: 'm5',
    title: 'Căn hộ Masteri Thảo Điền',
    address: 'Thảo Điền, TP. Thủ Đức',
    price: '6.8 tỷ', pricePerM2: '113 tr/m²',
    area: 60, bedrooms: 2, bathrooms: 2,
    type: 'Căn hộ', typeId: 'can-ho',
    bgColor: '#DBEAFE', bgEmoji: '🏢',
    x: 0.62, y: 0.52,
  },
  {
    id: 'm6',
    title: 'Biệt thự Riviera Cove',
    address: 'Phước Long B, TP. Thủ Đức',
    price: '45 tỷ', pricePerM2: '120 tr/m²',
    area: 350, bedrooms: 5, bathrooms: 5,
    type: 'Biệt thự', typeId: 'biet-thu',
    bgColor: '#F0FDF4', bgEmoji: '🏰',
    x: 0.45, y: 0.58,
  },
];

// Mock cluster marker đại diện các khu vực lân cận
const MOCK_CLUSTERS = [
  { id: 'c1', name: 'Thủ Đức', count: 124, x: 0.50, y: 0.45 },
  { id: 'c2', name: 'Quận 7', count: 85, x: 0.25, y: 0.72 },
  { id: 'c3', name: 'Bình Dương', count: 52, x: 0.75, y: 0.20 },
];

const BOTTOM_TABS = [
  { id: 'can-ho',  label: 'Căn hộ',   emoji: '🏢' },
  { id: 'nha-pho', label: 'Nhà phố',  emoji: '🏠' },
  { id: 'biet-thu',label: 'Biệt thự', emoji: '🏰' },
  { id: 'dat-nen', label: 'Đất nền',  emoji: '🌿' },
] as const;

interface MapOverlayProps {
  visible: boolean;
  onClose: () => void;
  onFilterPress?: () => void;
  onPropertyPress?: (property: any) => void;
}

export function MapOverlay({ visible, onClose, onFilterPress, onPropertyPress }: MapOverlayProps) {
  const slideY = useRef(new Animated.Value(SCREEN_H)).current;

  // Lọc nhanh theo loại BĐS ở bottom tab trên bản đồ
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Pin BĐS đang được chọn để xem popup preview (null = không chọn)
  const [activeProperty, setActiveProperty] = useState<MapProperty | null>(null);

  // Từ khóa tìm kiếm trên bản đồ
  const [searchText, setSearchText] = useState('');

  // Zoom level giả lập (true = zoom sâu nhìn thấy pin, false = zoom rộng nhìn thấy cluster)
  const [isZoomedIn, setIsZoomedIn] = useState(false);

  useEffect(() => {
    if (visible) {
      // Trượt lên
      Animated.timing(slideY, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
      // Reset trạng thái ban đầu khi mở
      setIsZoomedIn(false);
      setActiveProperty(null);
      setSelectedType(null);
    } else {
      // Trượt xuống
      Animated.timing(slideY, {
        toValue: SCREEN_H,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  // Lọc danh sách Pin hiển thị trên bản đồ
  const filteredProperties = useMemo(() => {
    let list = MOCK_MAP_PROPERTIES;
    if (selectedType) {
      list = list.filter((p) => p.typeId === selectedType);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      );
    }
    return list;
  }, [selectedType, searchText]);

  function handleClusterPress(cluster: typeof MOCK_CLUSTERS[0]) {
    // Zoom vào khu vực khi nhấn cluster
    setIsZoomedIn(true);
    // Tự động set filter loại BĐS tương ứng nếu cần hoặc giữ nguyên
  }

  function handlePinPress(prop: MapProperty) {
    setActiveProperty(prop);
  }

  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateY: slideY }] }]}>
      <View style={styles.container}>
        
        {/* ======================================================== */}
        {/* 1. BẢN ĐỒ GIẢ LẬP TOÀN MÀN HÌNH (Màn hình 08)              */}
        {/* ======================================================== */}
        <TouchableOpacity 
          style={styles.mapBg} 
          activeOpacity={1} 
          onPress={() => setActiveProperty(null)} // Bấm ra ngoài map để đóng popup preview
        >
          {/* Sông Sài Gòn giả lập (đường cong màu xanh uốn lượn) */}
          <View style={styles.river} />

          {/* Đường sá & Các khối block nhà giả lập */}
          <View style={[styles.road, { top: '30%', left: 0, right: 0, height: 18 }]} />
          <View style={[styles.road, { top: 0, bottom: 0, left: '45%', width: 22 }]} />
          <View style={[styles.road, { top: '65%', left: 0, right: 0, height: 16 }]} />
          <View style={[styles.road, { top: 0, bottom: 0, left: '78%', width: 16, transform: [{ rotate: '15deg' }] }]} />

          {/* Khu công viên mảng xanh */}
          <View style={[styles.park, { top: '8%', left: '8%', width: 80, height: 80, borderRadius: 40 }]} />
          <View style={[styles.park, { top: '72%', left: '55%', width: 120, height: 60, borderRadius: 10 }]} />

          {/* Khối block nhà màu xám/lam nhẹ */}
          <View style={[styles.block, { top: '15%', left: '55%', width: 60, height: 40 }]} />
          <View style={[styles.block, { top: '40%', left: '10%', width: 50, height: 50 }]} />
          <View style={[styles.block, { top: '42%', left: '75%', width: 70, height: 45 }]} />
          <View style={[styles.block, { top: '78%', left: '20%', width: 55, height: 40 }]} />

          {/* HIỂN THỊ MARKERS TRÊN BẢN ĐỒ */}
          {!isZoomedIn ? (
            // Trạng thái ZOOM RỘNG: Hiển thị các cluster markers theo khu vực
            MOCK_CLUSTERS.map((c) => (
              <TouchableOpacity
                key={c.id}
                style={[styles.clusterWrap, { left: `${c.x * 100}%` as any, top: `${c.y * 100}%` as any }]}
                onPress={() => handleClusterPress(c)}
                activeOpacity={0.8}
                accessibilityLabel={`Khu vực ${c.name}, ${c.count} bất động sản`}
              >
                <View style={styles.clusterCircle}>
                  <Text style={styles.clusterCount}>{c.count}</Text>
                </View>
                <View style={styles.clusterLabel}>
                  <Text style={styles.clusterLabelText}>{c.name}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            // Trạng thái ZOOM SÂU: Hiển thị các pins BĐS có giá cụ thể
            filteredProperties.map((p) => {
              const isActive = activeProperty?.id === p.id;
              return (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.pinWrap, { left: `${p.x * 100}%` as any, top: `${p.y * 100}%` as any }]}
                  onPress={() => handlePinPress(p)}
                  activeOpacity={0.9}
                >
                  <View style={[styles.pinBubble, isActive && styles.pinBubbleActive]}>
                    <Text style={[styles.pinText, isActive && styles.pinTextActive]}>{p.price}</Text>
                  </View>
                  <View style={[styles.pinTail, isActive && styles.pinTailActive]} />
                </TouchableOpacity>
              );
            })
          )}
        </TouchableOpacity>

        {/* Nút điều khiển zoom giả lập (+/-) */}
        <View style={styles.zoomControl}>
          <TouchableOpacity 
            style={[styles.zoomBtn, isZoomedIn && styles.zoomBtnActive]} 
            onPress={() => setIsZoomedIn(true)}
            accessibilityLabel="Phóng to bản đồ"
          >
            <Text style={styles.zoomText}>＋</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.zoomBtn, !isZoomedIn && styles.zoomBtnActive]} 
            onPress={() => { setIsZoomedIn(false); setActiveProperty(null); }}
            accessibilityLabel="Thu nhỏ bản đồ"
          >
            <Text style={styles.zoomText}>－</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* 2. THANH TÌM KIẾM OVERLAY Ở TOP (Màn hình 08)              */}
        {/* ======================================================== */}
        <SafeAreaView style={styles.headerSafe} edges={['top']}>
          <View style={styles.searchBar}>
            {/* Nút quay lại */}
            <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Đóng bản đồ">
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>

            {/* Ô tìm kiếm */}
            <View style={styles.inputWrap}>
              <Text style={styles.searchEmoji}>🔍</Text>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm khu vực trên bản đồ..."
                placeholderTextColor={GRAY_400}
                value={searchText}
                onChangeText={(txt) => {
                  setSearchText(txt);
                  if (txt && !isZoomedIn) setIsZoomedIn(true); // Tự động zoom vào khi gõ tìm kiếm
                }}
              />
              {searchText.length > 0 && (
                <TouchableOpacity onPress={() => setSearchText('')}>
                  <Text style={styles.clearEmoji}>✕</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Nút bộ lọc nâng cao */}
            <TouchableOpacity 
              style={styles.filterBtn} 
              onPress={onFilterPress}
              accessibilityLabel="Mở bộ lọc nâng cao"
            >
              <Text style={styles.filterEmoji}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>

        {/* Nút hành động nổi ở giữa/dưới bản đồ: "Bộ lọc" và "Danh sách" (Hiển thị) */}
        <View style={[styles.floatingActionRow, activeProperty && { bottom: 250 }]}>
          <TouchableOpacity style={styles.floatBtn} onPress={onFilterPress} accessibilityLabel="Mở bộ lọc">
            <Text style={styles.floatBtnIcon}>⚙️</Text>
            <Text style={styles.floatBtnText}>Bộ lọc</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.floatBtn} onPress={onClose} accessibilityLabel="Hiển thị danh sách">
            <Text style={styles.floatBtnIcon}>📋</Text>
            <Text style={styles.floatBtnText}>Hiển thị</Text>
          </TouchableOpacity>
        </View>

        {/* ======================================================== */}
        {/* 3. POPUP PREVIEW CARD (Màn hình 09 - Property Preview)     */}
        {/* ======================================================== */}
        {activeProperty && (
          <View style={styles.previewContainer}>
            <TouchableOpacity
              style={styles.previewCard}
              activeOpacity={0.95}
              onPress={() => onPropertyPress?.(activeProperty)}
              accessibilityLabel={`Xem chi tiết ${activeProperty.title}`}
            >
              {/* Ảnh placeholder bên trái */}
              <View style={[styles.previewImg, { backgroundColor: activeProperty.bgColor }]}>
                <Text style={styles.previewEmoji}>{activeProperty.bgEmoji}</Text>
                <View style={styles.previewTypeBadge}>
                  <Text style={styles.previewTypeText}>{activeProperty.type}</Text>
                </View>
              </View>

              {/* Thông tin bên phải */}
              <View style={styles.previewInfo}>
                <Text style={styles.previewTitle} numberOfLines={1}>{activeProperty.title}</Text>
                <Text style={styles.previewAddress} numberOfLines={1}>📍 {activeProperty.address}</Text>

                {/* Hàng giá */}
                <View style={styles.previewPriceRow}>
                  <Text style={styles.previewPrice}>{activeProperty.price}</Text>
                  <Text style={styles.previewPricePerM2}>{activeProperty.pricePerM2}</Text>
                </View>

                {/* Hàng thông số */}
                <View style={styles.previewSpecs}>
                  <Text style={styles.previewSpec}>📐 {activeProperty.area}m²</Text>
                  {activeProperty.bedrooms > 0 && (
                    <Text style={styles.previewSpec}>🛏 {activeProperty.bedrooms}PN</Text>
                  )}
                  {activeProperty.bathrooms > 0 && (
                    <Text style={styles.previewSpec}>🚿 {activeProperty.bathrooms}WC</Text>
                  )}
                </View>

                {/* Nút Xem chi tiết */}
                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => onPropertyPress?.(activeProperty)}
                >
                  <Text style={styles.detailBtnText}>Xem chi tiết</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>
        )}

        {/* ======================================================== */}
        {/* 4. TAB PHÂN LOẠI BĐS Ở BOTTOM (Màn hình 08)                */}
        {/* ======================================================== */}
        {!activeProperty && (
          <View style={styles.bottomTabContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.bottomTabScroll}
            >
              <TouchableOpacity
                style={[styles.bottomChip, selectedType === null && styles.bottomChipActive]}
                onPress={() => setSelectedType(null)}
                activeOpacity={0.8}
              >
                <Text style={[styles.bottomChipText, selectedType === null && styles.bottomChipTextActive]}>
                  📍 Tất cả
                </Text>
              </TouchableOpacity>
              {BOTTOM_TABS.map((tab) => {
                const isActive = selectedType === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    style={[styles.bottomChip, isActive && styles.bottomChipActive]}
                    onPress={() => {
                      setSelectedType(tab.id);
                      setIsZoomedIn(true); // Lọc loại cụ thể thì tự zoom vào để thấy pin
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.bottomChipText, isActive && styles.bottomChipTextActive]}>
                      {tab.emoji} {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E8F0FE',
    zIndex: 4000, // trên AppTabs (index) và dưới Auth
  },
  container: {
    flex: 1,
    position: 'relative',
  },

  // Map background giả lập bằng vẽ các hình cơ bản
  mapBg: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E5F1E3', // màu cỏ/đất nền
  },
  river: {
    position: 'absolute',
    top: '25%',
    left: -100,
    width: SCREEN_W + 200,
    height: 90,
    backgroundColor: '#A8DADC', // màu nước sông
    transform: [{ rotate: '-12deg' }],
    opacity: 0.85,
  },
  road: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  park: {
    position: 'absolute',
    backgroundColor: '#C2EABD',
    borderWidth: 1.5,
    borderColor: '#A3D9A5',
  },
  block: {
    position: 'absolute',
    backgroundColor: '#D1E3F8',
    borderColor: '#B9D5F4',
    borderWidth: 1.5,
    borderRadius: 6,
  },

  // Cluster Marker
  clusterWrap: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -24 }, { translateY: -24 }],
  },
  clusterCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: 'rgba(37, 99, 235, 0.9)',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  clusterCount: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  clusterLabel: {
    backgroundColor: 'rgba(31, 41, 55, 0.85)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 4,
  },
  clusterLabelText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Pin Marker
  pinWrap: {
    position: 'absolute',
    alignItems: 'center',
    transform: [{ translateX: -30 }, { translateY: -34 }],
  },
  pinBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderWidth: 1.5,
    borderColor: GRAY_300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  pinBubbleActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  pinText: {
    fontSize: 11,
    fontWeight: '800',
    color: GRAY_800,
  },
  pinTextActive: {
    color: '#FFFFFF',
  },
  pinTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: GRAY_300,
    marginTop: -1,
  },
  pinTailActive: {
    borderTopColor: PRIMARY,
  },

  // Zoom control
  zoomControl: {
    position: 'absolute',
    right: 16,
    top: 140,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 4,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 100,
  },
  zoomBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  zoomBtnActive: {
    backgroundColor: GRAY_100,
  },
  zoomText: {
    fontSize: 18,
    fontWeight: '700',
    color: GRAY_800,
  },

  // Search header overlay at top
  headerSafe: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: Platform.OS === 'android' ? 12 : 6,
    gap: 10,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  backIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: GRAY_800,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  searchEmoji: {
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: GRAY_800,
    padding: 0,
  },
  clearEmoji: {
    fontSize: 14,
    color: GRAY_400,
    padding: 2,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  filterEmoji: {
    fontSize: 18,
  },

  // Floating Action Row
  floatingActionRow: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    zIndex: 100,
  },
  floatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(31, 41, 55, 0.9)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  floatBtnIcon: {
    fontSize: 13,
  },
  floatBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '700',
  },

  // Bottom Type Tab scroll
  bottomTabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  bottomTabScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  bottomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomChipActive: {
    backgroundColor: PRIMARY,
  },
  bottomChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_800,
  },
  bottomChipTextActive: {
    color: WHITE,
  },

  // Property Preview Container (Màn hình 09)
  previewContainer: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    zIndex: 200,
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 12,
    elevation: 6,
  },
  previewImg: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  previewEmoji: {
    fontSize: 36,
  },
  previewTypeBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  previewTypeText: {
    color: WHITE,
    fontSize: 9,
    fontWeight: '600',
  },
  previewInfo: {
    flex: 1,
    padding: 12,
    gap: 4,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY_800,
  },
  previewAddress: {
    fontSize: 11,
    color: GRAY_500,
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginTop: 2,
  },
  previewPrice: {
    fontSize: 15,
    fontWeight: '800',
    color: PRIMARY,
  },
  previewPricePerM2: {
    fontSize: 10,
    color: GRAY_400,
  },
  previewSpecs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 2,
  },
  previewSpec: {
    fontSize: 10,
    color: GRAY_500,
  },
  detailBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingVertical: 6,
    alignItems: 'center',
    marginTop: 4,
  },
  detailBtnText: {
    color: PRIMARY,
    fontSize: 11,
    fontWeight: '700',
  },
});
