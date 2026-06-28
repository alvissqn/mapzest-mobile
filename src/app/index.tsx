/**
 * Màn hình 05 – Trang chủ Buyer
 * Spec: Header (Logo + Bell) → Search → Map Preview → Category → Featured BĐS
 *
 * Tích hợp màn 10: nhấn vào card BĐS nổi bật → mở PropertyDetailOverlay
 * TODO: Kết nối API /api/locations để lấy danh sách BĐS thật
 */
import { useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { HomeHeader } from '@/components/home-header';
import { HomeMapPreview } from '@/components/home-map-preview';
import { HomeCategoryList } from '@/components/home-category-list';
import { HomeFeaturedList, FeaturedProperty } from '@/components/home-featured-list';
import { PropertyDetailOverlay, PropertyDetail } from '@/components/property-detail-overlay';
import { MapOverlay } from '@/components/map-overlay';
import { BottomTabInset } from '@/constants/theme';

const BG = '#F9FAFB';

/** Chuyển FeaturedProperty → PropertyDetail để hiển thị màn chi tiết */
function toDetail(p: any, isFav: boolean): PropertyDetail {
  return {
    id: p.id, title: p.title, address: p.address,
    price: p.price, pricePerM2: p.pricePerM2,
    area: p.area, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
    floor: 8, direction: 'Nam', view: 'Thành phố',
    type: p.type, status: 'Đang bán',
    isFavorite: isFav,
    code: `MZ-HOME-00${p.id}`,
    postedAt: '1 ngày trước',
    highlights: [
      'Sổ hồng chính chủ, pháp lý minh bạch',
      'Nội thất cao cấp, bàn giao đầy đủ',
      'Gần trung tâm thương mại, trường học',
      'Hệ thống tiện ích đẳng cấp',
    ],
    amenities: [
      { emoji: '🏊', label: 'Hồ bơi' },
      { emoji: '🏋️', label: 'Gym' },
      { emoji: '🛗', label: 'Thang máy' },
      { emoji: '🚗', label: 'Bãi xe' },
      { emoji: '💂', label: 'Bảo vệ 24/7' },
    ],
    agent: { name: 'Trần Thị Lan', phone: '0902 345 678', emoji: '👩‍💼' },
    slides: [
      { id: '1', bgColor: p.bgColor, bgEmoji: p.bgEmoji, label: 'Tổng quan' },
      { id: '2', bgColor: '#FEF3C7', bgEmoji: '🛋️', label: 'Phòng khách' },
      { id: '3', bgColor: '#F0FDF4', bgEmoji: '🛏', label: 'Phòng ngủ' },
    ],
  };
}

export default function HomeScreen() {
  const router = useRouter();

  // Danh mục đang chọn trên màn home
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(undefined);

  // Trạng thái hiển thị bản đồ toàn màn hình (Màn 08)
  const [showMap, setShowMap] = useState(false);

  // Tin BĐS đang xem chi tiết từ màn Home (null = đóng)
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(null);

  // Danh sách yêu thích (local state, đồng bộ API sau)
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  /** Toggle yêu thích một tin */
  function handleToggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Cập nhật nếu đang xem chi tiết
    if (selectedProperty?.id === id) {
      setSelectedProperty((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
    // TODO: POST/DELETE /api/collections/{id}
  }

  return (
    <View style={styles.root}>
      {/* Header: Logo + thông báo + tìm kiếm */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <HomeHeader
          onNotificationPress={() => {
            // TODO: mở màn Thông báo
          }}
          onSearchFocus={() => {
            // Chuyển sang tab Tìm kiếm (explore)
            router.navigate('/explore');
          }}
        />
      </SafeAreaView>

      {/* Nội dung cuộn chính */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Bản đồ mini */}
        <View style={styles.section}>
          <HomeMapPreview onOpenFullMap={() => {
            setShowMap(true);
          }} />
        </View>

        {/* Danh mục BĐS */}
        <View style={styles.section}>
          <HomeCategoryList
            selectedId={selectedCategory}
            onSelect={(cat) => {
              setSelectedCategory(cat.id);
              // Chuyển sang tab Tìm kiếm (explore) và truyền kèm categoryId để lọc
              router.navigate({
                pathname: '/explore',
                params: { categoryId: cat.id }
              });
            }}
            onSeeAll={() => {
              // Bấm xem tất cả danh mục -> chuyển sang tab explore
              router.navigate('/explore');
            }}
          />
        </View>

        {/* BĐS nổi bật */}
        <View style={styles.section}>
          <HomeFeaturedList
            onPressItem={(item) => {
              // Mở màn 10 – Chi tiết BĐS
              setSelectedProperty(toDetail(item, favorites.has(item.id)));
            }}
            onToggleFavorite={handleToggleFavorite}
            onSeeAll={() => {
              // Bấm xem tất cả BĐS nổi bật -> chuyển sang tab explore
              router.navigate('/explore');
            }}
          />
        </View>
      </ScrollView>

      {/* Màn 08 & 09 – Bản đồ toàn màn hình & Popup preview */}
      <MapOverlay
        visible={showMap}
        onClose={() => setShowMap(false)}
        onFilterPress={() => {
          setShowMap(false);
          // Chuyển sang tìm kiếm và mở bộ lọc
          router.navigate({
            pathname: '/explore',
            params: { openFilter: 'true' }
          });
        }}
        onPropertyPress={(p) => {
          // Bấm xem chi tiết từ popup map -> mở màn 10
          setSelectedProperty(toDetail(p, favorites.has(p.id)));
        }}
      />

      {/* Màn 10 – Chi tiết BĐS (mở từ Home) */}
      <PropertyDetailOverlay
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: BG },
  headerSafe:    { backgroundColor: '#FFFFFF', zIndex: 10 },
  scroll:        { flex: 1 },
  scrollContent: { gap: 24, paddingTop: 20 },
  section:       {},
});
