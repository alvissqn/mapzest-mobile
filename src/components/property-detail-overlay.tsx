/**
 * Màn hình 10 – Chi tiết BĐS
 * Overlay toàn màn hình trượt vào từ phải
 * Nội dung: Gallery → Giá + thông số → Mô tả → Tiện ích → Môi giới → CTA sticky
 */
import { useEffect, useRef, useState } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  ScrollView, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PropertyGallery, GallerySlide } from './property-gallery';
import { GalleryOverlay } from './gallery-overlay';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

const { width: SCREEN_W } = Dimensions.get('window');
const PRIMARY  = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_500 = '#6B7280';
const GRAY_700 = '#374151';
const GRAY_800 = '#1F2937';
const GREEN    = '#16A34A';
const WHITE    = '#FFFFFF';
const BG       = '#F9FAFB';

/** Dữ liệu đầy đủ của một tin BĐS hiển thị trên màn chi tiết */
export interface PropertyDetail {
  id: string;
  title: string;
  address: string;
  price: string;
  pricePerM2?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  direction?: string;   // hướng ban công (Đông, Tây, Nam, Bắc...)
  view?: string;        // view nhìn ra (Sông, Công viên, Thành phố...)
  type: string;
  status: string;       // Đang bán / Cho thuê
  isFavorite: boolean;
  highlights: string[]; // Thông tin nổi bật (danh sách bullet)
  amenities: { emoji: string; label: string }[]; // Tiện ích nội khu
  agent: {
    name: string;
    phone: string;
    emoji: string;      // avatar đại diện (emoji thay ảnh)
  };
  slides: GallerySlide[];
  postedAt: string;
  code: string;         // Mã tin, ví dụ: "MZ-2024-001"
}

interface PropertyDetailOverlayProps {
  property: PropertyDetail | null; // null = chưa chọn tin nào
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
}

export function PropertyDetailOverlay({
  property, onClose, onToggleFavorite,
}: PropertyDetailOverlayProps) {

  // Animation trượt vào từ phải
  const slideX = useRef(new Animated.Value(SCREEN_W)).current;

  // Trạng thái gallery fullscreen (Màn 11)
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [initialGalleryIndex, setInitialGalleryIndex] = useState(0);

  useEffect(() => {
    if (property) {
      // Trượt vào
      Animated.timing(slideX, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }).start();
    } else {
      // Trượt ra
      Animated.timing(slideX, {
        toValue: SCREEN_W,
        duration: 280,
        useNativeDriver: true,
      }).start();
    }
  }, [property]);

  // Không render khi đóng và không có dữ liệu
  if (!property) return null;

  const p = property;

  function getAmenityIcon(label: string, color: string) {
    switch (label) {
      case 'Hồ bơi': return <MaterialCommunityIcons name="swim" size={20} color={color} />;
      case 'Gym': return <MaterialCommunityIcons name="dumbbell" size={20} color={color} />;
      case 'Thang máy': return <MaterialCommunityIcons name="elevator-passenger-outline" size={20} color={color} />;
      case 'Bãi xe': return <Ionicons name="car-outline" size={20} color={color} />;
      case 'Bảo vệ 24/7': return <Ionicons name="shield-outline" size={20} color={color} />;
      case 'Công viên': return <MaterialCommunityIcons name="tree-outline" size={20} color={color} />;
      default: return <Ionicons name="sparkles-outline" size={20} color={color} />;
    }
  }

  /** Hàng thông số: icon + giá trị + nhãn */
  function SpecItem({ iconName, iconType, value, label }: { iconName: string; iconType: 'ionicons' | 'material' | 'feather'; value: string | number; label: string }) {
    return (
      <View style={styles.specItem}>
        <View style={styles.specIconWrap}>
          {iconType === 'material' ? (
            <MaterialCommunityIcons name={iconName as any} size={18} color={PRIMARY} />
          ) : iconType === 'ionicons' ? (
            <Ionicons name={iconName as any} size={18} color={PRIMARY} />
          ) : (
            <Feather name={iconName as any} size={16} color={PRIMARY} />
          )}
        </View>
        <Text style={styles.specValue}>{value}</Text>
        <Text style={styles.specLabel}>{label}</Text>
      </View>
    );
  }

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateX: slideX }] }]}>
      {/* Nút back + share + yêu thích — nằm trên gallery */}
      <View style={styles.floatingHeader}>
        <SafeAreaView edges={['top']}>
          <View style={styles.floatingRow}>
            <TouchableOpacity style={styles.iconBtn} onPress={onClose} accessibilityLabel="Quay lại">
              <Feather name="arrow-left" size={20} color={GRAY_800} />
            </TouchableOpacity>
            <View style={styles.floatingRight}>
              <TouchableOpacity style={styles.iconBtn} accessibilityLabel="Chia sẻ tin đăng">
                <Feather name="share-2" size={18} color={GRAY_800} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconBtn}
                onPress={() => onToggleFavorite(p.id)}
                accessibilityLabel={p.isFavorite ? 'Bỏ yêu thích' : 'Thêm yêu thích'}
              >
                <Ionicons
                  name={p.isFavorite ? 'heart' : 'heart-outline'}
                  size={20}
                  color={p.isFavorite ? '#EF4444' : GRAY_800}
                />
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Nội dung cuộn chính */}
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Gallery ảnh */}
        <PropertyGallery 
          slides={p.slides} 
          height={260} 
          onPressItem={(index) => {
            setInitialGalleryIndex(index);
            setShowFullscreenGallery(true);
          }}
        />

        {/* Body nội dung */}
        <View style={styles.body}>

          {/* Badge loại + trạng thái + mã tin */}
          <View style={styles.badgeRow}>
            <View style={styles.typePill}><Text style={styles.typePillText}>{p.type}</Text></View>
            <View style={[styles.typePill, { backgroundColor: '#F0FDF4' }]}>
              <Text style={[styles.typePillText, { color: GREEN }]}>{p.status}</Text>
            </View>
            <Text style={styles.codeText}>#{p.code}</Text>
          </View>

          {/* Tên BĐS */}
          <Text style={styles.title}>{p.title}</Text>

          {/* Địa chỉ */}
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color="#64748B" />
            <Text style={styles.address}>{p.address}</Text>
          </View>

          {/* Giá */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>{p.price}</Text>
            {p.pricePerM2 ? <Text style={styles.pricePerM2}> · {p.pricePerM2}</Text> : null}
          </View>

          {/* Hàng thông số */}
          <View style={styles.specsRow}>
            <SpecItem iconName="ruler-square" iconType="material" value={`${p.area}m²`} label="Diện tích" />
            {p.bedrooms ? <SpecItem iconName="bed-double-outline" iconType="material" value={p.bedrooms} label="Phòng ngủ" /> : null}
            {p.bathrooms ? <SpecItem iconName="shower" iconType="material" value={p.bathrooms} label="Phòng tắm" /> : null}
            {p.floor ? <SpecItem iconName="office-building-outline" iconType="material" value={`T${p.floor}`} label="Tầng" /> : null}
            {p.direction ? <SpecItem iconName="compass-outline" iconType="material" value={p.direction} label="Hướng" /> : null}
            {p.view ? <SpecItem iconName="eye" iconType="feather" value={p.view} label="View" /> : null}
          </View>

          <Divider />

          {/* Thông tin nổi bật */}
          <Text style={styles.sectionTitle}>Thông tin nổi bật</Text>
          {p.highlights.map((hl, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{hl}</Text>
            </View>
          ))}

          <Divider />

          {/* Tiện ích nội khu */}
          <Text style={styles.sectionTitle}>Tiện ích nội khu</Text>
          <View style={styles.amenitiesGrid}>
            {p.amenities.map((a, i) => (
              <View key={i} style={styles.amenityItem}>
                <View style={styles.amenityIconBox}>
                  {getAmenityIcon(a.label, PRIMARY)}
                </View>
                <Text style={styles.amenityLabel}>{a.label}</Text>
              </View>
            ))}
          </View>

          <Divider />

          {/* Thông tin môi giới */}
          <Text style={styles.sectionTitle}>Thông tin môi giới</Text>
          <View style={styles.agentCard}>
            <View style={styles.agentAvatar}><Text style={styles.agentAvatarEmoji}>{p.agent.emoji}</Text></View>
            <View style={styles.agentInfo}>
              <Text style={styles.agentName}>{p.agent.name}</Text>
              <Text style={styles.agentPhone}>{p.agent.phone}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} accessibilityLabel="Gọi ngay cho môi giới">
              <Feather name="phone" size={14} color={WHITE} style={{ marginRight: 4 }} />
              <Text style={styles.callBtnText}>Gọi</Text>
            </TouchableOpacity>
          </View>

          {/* Thêm khoảng trống để CTA sticky không che nội dung */}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* CTA sticky dưới cùng: Liên hệ + Đặt lịch */}
      <View style={styles.ctaBar}>
        <SafeAreaView edges={['bottom']}>
          <View style={styles.ctaRow}>
            <TouchableOpacity style={styles.ctaOutline} accessibilityLabel="Đặt lịch xem nhà">
              <Feather name="calendar" size={15} color={PRIMARY} style={{ marginRight: 6 }} />
              <Text style={styles.ctaOutlineText}>Đặt lịch xem</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.ctaPrimary} accessibilityLabel="Liên hệ ngay với môi giới">
              <Feather name="message-circle" size={15} color={WHITE} style={{ marginRight: 6 }} />
              <Text style={styles.ctaPrimaryText}>Liên hệ ngay</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>

      {/* Màn 11 – Gallery xem ảnh toàn màn hình */}
      <GalleryOverlay
        visible={showFullscreenGallery}
        slides={p.slides}
        initialIndex={initialGalleryIndex}
        onClose={() => setShowFullscreenGallery(false)}
      />
    </Animated.View>
  );
}

/** Đường kẻ phân cách nhỏ */
function Divider() {
  return <View style={{ height: 1, backgroundColor: '#E5E7EB', marginVertical: 8 }} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: BG,
    zIndex: 6000,
  },

  // Header nổi trên gallery
  floatingHeader: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
  },
  floatingRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 8,
  },
  floatingRight: { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center',
  },
  iconBtnText: { fontSize: 18, color: WHITE },

  scroll: { flex: 1 },
  body: { backgroundColor: WHITE, borderTopLeftRadius: 20, borderTopRightRadius: 20, marginTop: -20, padding: 20, gap: 10 },

  // Badge row
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  typePill: { backgroundColor: '#EFF6FF', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  typePillText: { fontSize: 11, fontWeight: '700', color: PRIMARY },
  codeText: { fontSize: 11, color: GRAY_500, marginLeft: 'auto' },

  // Tên + giá
  title: { fontSize: 18, fontWeight: '800', color: GRAY_800, lineHeight: 24, letterSpacing: -0.3 },
  address: { fontSize: 13, color: GRAY_500, flex: 1 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  price: { fontSize: 22, fontWeight: '900', color: PRIMARY },
  pricePerM2: { fontSize: 12, color: GRAY_500 },

  // Thông số
  specsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 4 },
  specItem: { alignItems: 'center', gap: 2, minWidth: 58 },
  specIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  specValue: { fontSize: 14, fontWeight: '700', color: GRAY_800 },
  specLabel: { fontSize: 10, color: GRAY_500 },

  // Sections
  sectionTitle: { fontSize: 15, fontWeight: '700', color: GRAY_800, marginBottom: 6 },
  bulletRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start' },
  bulletDot: { fontSize: 14, color: PRIMARY, marginTop: 1 },
  bulletText: { fontSize: 13, color: GRAY_700, flex: 1, lineHeight: 20 },

  // Tiện ích grid
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: GRAY_100,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  amenityIconBox: {
    marginRight: 2,
  },
  amenityLabel: { fontSize: 12, fontWeight: '600', color: GRAY_700 },

  // Môi giới
  agentCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: GRAY_100, borderRadius: 14, padding: 14, gap: 12,
  },
  agentAvatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#DBEAFE',
    alignItems: 'center', justifyContent: 'center',
  },
  agentAvatarEmoji: { fontSize: 24 },
  agentInfo: { flex: 1 },
  agentName: { fontSize: 14, fontWeight: '700', color: GRAY_800 },
  agentPhone: { fontSize: 12, color: GRAY_500, marginTop: 2 },
  callBtn: {
    backgroundColor: GREEN, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  callBtnText: { color: WHITE, fontWeight: '700', fontSize: 13 },

  // CTA sticky dưới
  ctaBar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    backgroundColor: WHITE, borderTopWidth: 1, borderTopColor: GRAY_200,
    paddingTop: 10, paddingHorizontal: 16,
  },
  ctaRow: { flexDirection: 'row', gap: 10, paddingBottom: 4 },
  ctaOutline: {
    flex: 1, borderWidth: 1.5, borderColor: PRIMARY, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  ctaOutlineText: { color: PRIMARY, fontSize: 14, fontWeight: '700' },
  ctaPrimary: {
    flex: 1.4, backgroundColor: PRIMARY, borderRadius: 12,
    paddingVertical: 13, alignItems: 'center',
  },
  ctaPrimaryText: { color: WHITE, fontSize: 14, fontWeight: '700' },
});
