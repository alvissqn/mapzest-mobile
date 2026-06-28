/**
 * Màn hình 12 – Yêu thích (Saved Properties)
 * Route: /saved (tab Yêu thích)
 *
 * Giao diện:
 * - Tab chuyển đổi: Bất động sản | Tin rao
 * - Danh sách BĐS đã lưu với thông số đầy đủ
 * - Click vào trái tim đỏ để bỏ lưu (xóa khỏi danh sách)
 * - Click vào card để mở màn 10 (PropertyDetailOverlay)
 */
import { useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, FlatList,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PropertyDetailOverlay, PropertyDetail } from '@/components/property-detail-overlay';
import { SearchResultProperty, SearchResultItem } from '@/components/search-result-item';
import { BottomTabInset } from '@/constants/theme';

const BG = '#F9FAFB';
const PRIMARY = '#2563EB';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';

// Dữ liệu mock BĐS yêu thích ban đầu
const MOCK_SAVED_PROPERTIES: SearchResultProperty[] = [
  {
    id: 's1', type: 'Căn hộ', isNew: true,
    title: 'Vinhomes Grand Park – The Rainbow',
    address: 'Long Bình, TP. Thủ Đức, TP.HCM',
    price: '3.2 tỷ', pricePerM2: '52 tr/m²',
    area: 62, bedrooms: 2, bathrooms: 2,
    isFavorite: true, bgColor: '#DBEAFE', bgEmoji: '🏢', postedAt: '2 giờ trước',
  },
  {
    id: 's2', type: 'Nhà phố', isHot: true,
    title: 'Nhà phố Thảo Điền view sông Sài Gòn',
    address: 'Thảo Điền, TP. Thủ Đức, TP.HCM',
    price: '12.5 tỷ', pricePerM2: '108 tr/m²',
    area: 115, bedrooms: 4, bathrooms: 3,
    isFavorite: true, bgColor: '#FEF3C7', bgEmoji: '🏠', postedAt: '5 giờ trước',
  },
  {
    id: 's3', type: 'Biệt thự',
    title: 'Biệt thự Nam Sài Gòn – Phú Mỹ Hưng',
    address: 'Phú Mỹ Hưng, Quận 7, TP.HCM',
    price: '38 tỷ', pricePerM2: '95 tr/m²',
    area: 400, bedrooms: 6, bathrooms: 5,
    isFavorite: true, bgColor: '#F0FDF4', bgEmoji: '🏰', postedAt: '1 ngày trước',
  },
];

/** Chuyển SearchResultProperty → PropertyDetail để hiển thị màn 10 */
function toDetail(p: SearchResultProperty, isFavorite: boolean): PropertyDetail {
  return {
    id: p.id, title: p.title, address: p.address,
    price: p.price, pricePerM2: p.pricePerM2,
    area: p.area, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
    floor: 6, direction: 'Đông', view: 'Sông Sài Gòn',
    type: p.type, status: 'Đang bán',
    isFavorite,
    code: `MZ-SAVED-00${p.id}`,
    postedAt: p.postedAt,
    highlights: [
      'Sổ hồng chính chủ, sẵn sàng giao dịch',
      'Khu dân cư an ninh, yên tĩnh',
      'Đầy đủ tiện ích cao cấp xung quanh',
    ],
    amenities: [
      { emoji: '🏊', label: 'Hồ bơi' },
      { emoji: '🚗', label: 'Bãi xe' },
      { emoji: '💂', label: 'Bảo vệ 24/7' },
    ],
    agent: { name: 'Nguyễn Văn Nam', phone: '0909 123 456', emoji: '👨‍💼' },
    slides: [
      { id: '1', bgColor: p.bgColor, bgEmoji: p.bgEmoji, label: 'Tổng quan' },
    ],
  };
}

export default function SavedScreen() {
  // Tab hiện tại: 'properties' (Bất động sản) | 'posts' (Tin rao)
  const [activeTab, setActiveTab] = useState<'properties' | 'posts'>('properties');

  // Danh sách các ID BĐS đang được yêu thích
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(MOCK_SAVED_PROPERTIES.map((p) => p.id))
  );

  // Tin BĐS đang xem chi tiết (null = đóng màn 10)
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(null);

  // Lọc danh sách BĐS yêu thích thực tế
  const savedList = useMemo(() => {
    return MOCK_SAVED_PROPERTIES.filter((p) => favorites.has(p.id))
      .map((p) => ({ ...p, isFavorite: true }));
  }, [favorites]);

  /** Xử lý click tim đỏ -> bỏ yêu thích (xóa khỏi danh sách hiển thị) */
  function handleToggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Nếu đang mở chi tiết tin bị bỏ yêu thích thì cập nhật state
    if (selectedProperty?.id === id) {
      setSelectedProperty((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
  }

  function handleOpenDetail(item: SearchResultProperty) {
    setSelectedProperty(toDetail(item, favorites.has(item.id)));
  }

  return (
    <View style={styles.root}>
      {/* Header cố định */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Đã lưu</Text>
        </View>

        {/* Tab chuyển đổi BĐS / Tin rao */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'properties' && styles.tabBtnActive]}
            onPress={() => setActiveTab('properties')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'properties' && styles.tabTextActive]}>
              Bất động sản ({savedList.length})
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'posts' && styles.tabBtnActive]}
            onPress={() => setActiveTab('posts')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              Tin rao (0)
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Danh sách các tin yêu thích */}
      {activeTab === 'properties' ? (
        <FlatList
          data={savedList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SearchResultItem
              item={item}
              onPress={() => handleOpenDetail(item)}
              onToggleFavorite={() => handleToggleFavorite(item.id)}
            />
          )}
          contentContainerStyle={[styles.listContent, { paddingBottom: BottomTabInset + 16 }]}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyEmoji}>❤️</Text>
              <Text style={styles.emptyTitle}>Chưa có bất động sản nào</Text>
              <Text style={styles.emptyHint}>
                Hãy nhấn vào biểu tượng trái tim khi xem danh sách để lưu tin đăng ở đây.
              </Text>
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        // Tab Tin rao (trống)
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyEmoji}>📰</Text>
          <Text style={styles.emptyTitle}>Chưa lưu tin rao nào</Text>
          <Text style={styles.emptyHint}>
            Các bài viết, tin tức thị trường bạn đã lưu sẽ hiển thị tại đây.
          </Text>
        </View>
      )}

      {/* Màn 10 – Chi tiết BĐS */}
      <PropertyDetailOverlay
        property={selectedProperty}
        onClose={() => setSelectedProperty(null)}
        onToggleFavorite={handleToggleFavorite}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
  },
  headerSafe: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GRAY_800,
    letterSpacing: -0.3,
  },
  tabRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderColor: 'transparent',
  },
  tabBtnActive: {
    borderColor: PRIMARY,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: GRAY_500,
  },
  tabTextActive: {
    color: PRIMARY,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: 14,
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
    paddingTop: 100,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 4,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: GRAY_800,
  },
  emptyHint: {
    fontSize: 13,
    color: GRAY_500,
    textAlign: 'center',
    lineHeight: 20,
  },
});
