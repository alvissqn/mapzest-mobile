/**
 * Màn hình 06 – Kết quả tìm kiếm (Search Results)
 * Route: /explore (tab Tìm kiếm)
 *
 * Tích hợp:
 * - Màn 07: FilterOverlay → mở khi nhấn icon bộ lọc
 * - Màn 10: PropertyDetailOverlay → mở khi nhấn card BĐS
 *
 * TODO: Kết nối API GET /api/locations với query params keyword, category, sort
 */
import { useState, useMemo, useEffect } from 'react';
import { StyleSheet, View, FlatList, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

import { SearchHeader } from '@/components/search-header';
import { SearchFilterTabs, FilterTabId } from '@/components/search-filter-tabs';
import { SearchSortBar, SortOption } from '@/components/search-sort-bar';
import { SearchResultItem, SearchResultProperty } from '@/components/search-result-item';
import { FilterOverlay, FilterState, DEFAULT_FILTER } from '@/components/filter-overlay';
import { PropertyDetailOverlay, PropertyDetail } from '@/components/property-detail-overlay';
import { BottomTabInset } from '@/constants/theme';

const BG = '#F9FAFB';

// ──────────────────────────────────────────
// Dữ liệu giả — sẽ thay bằng GET /api/locations
// ──────────────────────────────────────────
const MOCK_PROPERTIES: SearchResultProperty[] = [
  {
    id: '1', type: 'Căn hộ', isNew: true,
    title: 'Vinhomes Grand Park – The Rainbow',
    address: 'Long Bình, TP. Thủ Đức, TP.HCM',
    price: '3.2 tỷ', pricePerM2: '52 tr/m²',
    area: 62, bedrooms: 2, bathrooms: 2,
    isFavorite: true, bgColor: '#DBEAFE', bgEmoji: '🏢', postedAt: '2 giờ trước',
  },
  {
    id: '2', type: 'Nhà phố', isHot: true,
    title: 'Nhà phố Thảo Điền view sông Sài Gòn',
    address: 'Thảo Điền, TP. Thủ Đức, TP.HCM',
    price: '12.5 tỷ', pricePerM2: '108 tr/m²',
    area: 115, bedrooms: 4, bathrooms: 3,
    isFavorite: false, bgColor: '#FEF3C7', bgEmoji: '🏠', postedAt: '5 giờ trước',
  },
  {
    id: '3', type: 'Biệt thự',
    title: 'Biệt thự Nam Sài Gòn – Phú Mỹ Hưng',
    address: 'Phú Mỹ Hưng, Quận 7, TP.HCM',
    price: '38 tỷ', pricePerM2: '95 tr/m²',
    area: 400, bedrooms: 6, bathrooms: 5,
    isFavorite: false, bgColor: '#F0FDF4', bgEmoji: '🏰', postedAt: '1 ngày trước',
  },
  {
    id: '4', type: 'Đất nền', isNew: true,
    title: 'Đất nền khu công nghệ cao Bình Dương',
    address: 'Dĩ An, Bình Dương',
    price: '1.8 tỷ', pricePerM2: '18 tr/m²',
    area: 100,
    isFavorite: false, bgColor: '#FDF4FF', bgEmoji: '🌿', postedAt: '3 giờ trước',
  },
  {
    id: '5', type: 'Căn hộ',
    title: 'Masteri Thảo Điền – Tháp T1',
    address: 'Thảo Điền, TP. Thủ Đức, TP.HCM',
    price: '6.8 tỷ', pricePerM2: '113 tr/m²',
    area: 60, bedrooms: 2, bathrooms: 2,
    isFavorite: true, bgColor: '#DBEAFE', bgEmoji: '🏢', postedAt: '30 phút trước',
  },
  {
    id: '6', type: 'Nhà phố',
    title: 'Nhà hẻm xe hơi Gò Vấp – sổ hồng riêng',
    address: 'Phường 16, Quận Gò Vấp, TP.HCM',
    price: '5.5 tỷ', pricePerM2: '61 tr/m²',
    area: 90, bedrooms: 3, bathrooms: 2,
    isFavorite: false, bgColor: '#FEF3C7', bgEmoji: '🏠', postedAt: '2 ngày trước',
  },
  {
    id: '7', type: 'Đất nền',
    title: 'Lô đất mặt tiền đường Nguyễn Duy Trinh',
    address: 'Phường Long Trường, TP. Thủ Đức',
    price: '4.2 tỷ', pricePerM2: '35 tr/m²',
    area: 120,
    isFavorite: false, bgColor: '#FDF4FF', bgEmoji: '🌿', postedAt: '4 giờ trước',
  },
  {
    id: '8', type: 'Dự án', isNew: true,
    title: 'The Global City – Masterise Homes',
    address: 'An Phú, TP. Thủ Đức, TP.HCM',
    price: 'Từ 8 tỷ',
    area: 75, bedrooms: 2, bathrooms: 2,
    isFavorite: false, bgColor: '#EDE9FE', bgEmoji: '🏗️', postedAt: '1 giờ trước',
  },
];

/** Ánh xạ loại BĐS → id tab bộ lọc */
const TYPE_TAB_MAP: Record<string, FilterTabId> = {
  'Căn hộ':  'can-ho',
  'Nhà phố':  'nha-pho',
  'Biệt thự': 'biet-thu',
  'Đất nền':  'dat-nen',
  'Dự án':    'du-an',
};

/** Chuyển dữ liệu SearchResultProperty → PropertyDetail để hiển thị màn 10 */
function toDetail(p: SearchResultProperty, isFavorite: boolean): PropertyDetail {
  return {
    id: p.id, title: p.title, address: p.address,
    price: p.price, pricePerM2: p.pricePerM2,
    area: p.area, bedrooms: p.bedrooms, bathrooms: p.bathrooms,
    floor: 12, direction: 'Đông Nam', view: 'Công viên',
    type: p.type, status: 'Đang bán',
    isFavorite,
    code: `MZ-2024-00${p.id}`,
    postedAt: p.postedAt,
    highlights: [
      'Sổ hồng chính chủ, pháp lý đầy đủ',
      'Nội thất cao cấp, bàn giao hoàn thiện',
      'Vị trí trung tâm, giao thông thuận tiện',
      'Hệ thống tiện ích đẳng cấp nội khu',
    ],
    amenities: [
      { emoji: '🏊', label: 'Hồ bơi' },
      { emoji: '🏋️', label: 'Gym' },
      { emoji: '🛗', label: 'Thang máy' },
      { emoji: '🚗', label: 'Bãi xe' },
      { emoji: '💂', label: 'Bảo vệ 24/7' },
      { emoji: '🌳', label: 'Công viên' },
    ],
    agent: { name: 'Nguyễn Minh Khoa', phone: '0901 234 567', emoji: '👨‍💼' },
    slides: [
      { id: '1', bgColor: p.bgColor, bgEmoji: p.bgEmoji, label: 'Tổng quan' },
      { id: '2', bgColor: '#FEF3C7', bgEmoji: '🛋️',      label: 'Phòng khách' },
      { id: '3', bgColor: '#F0FDF4', bgEmoji: '🛏',       label: 'Phòng ngủ'  },
      { id: '4', bgColor: '#EFF6FF', bgEmoji: '🍽️',      label: 'Bếp + ăn'   },
      { id: '5', bgColor: '#FDF4FF', bgEmoji: '🌅',       label: 'View ban công' },
    ],
  };
}

export default function SearchScreen() {
  const { categoryId, openFilter } = useLocalSearchParams<{ categoryId?: string; openFilter?: string }>();

  // Trạng thái tìm kiếm và bộ lọc
  const [query, setQuery]               = useState('');
  const [activeTab, setActiveTab]       = useState<FilterTabId>('all');
  const [sortBy, setSortBy]             = useState<SortOption>('newest');
  const [filter, setFilter]             = useState<FilterState>(DEFAULT_FILTER);
  const [showFilter, setShowFilter]     = useState(false);

  // Tự động chọn tab danh mục tương ứng khi được truyền từ HomeScreen
  useEffect(() => {
    if (categoryId) {
      setActiveTab(categoryId as FilterTabId);
    }
  }, [categoryId]);

  // Tự động mở bộ lọc nếu được yêu cầu từ HomeScreen (khi click nút bộ lọc trên bản đồ)
  useEffect(() => {
    if (openFilter === 'true') {
      setShowFilter(true);
    }
  }, [openFilter]);

  // Yêu thích (local state, TODO: đồng bộ với API)
  const [favorites, setFavorites] = useState<Set<string>>(
    new Set(MOCK_PROPERTIES.filter((p) => p.isFavorite).map((p) => p.id))
  );

  // Tin BĐS đang xem chi tiết (null = đóng màn 10)
  const [selectedProperty, setSelectedProperty] = useState<PropertyDetail | null>(null);

  /** Lọc danh sách theo keyword + tab + filter */
  const filtered = useMemo(() => {
    let list = MOCK_PROPERTIES.map((p) => ({ ...p, isFavorite: favorites.has(p.id) }));
    if (activeTab !== 'all') {
      list = list.filter((p) => TYPE_TAB_MAP[p.type] === activeTab);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) => p.title.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
      );
    }
    // Lọc theo loại BĐS từ FilterOverlay (nếu có chọn)
    if (filter.types.length > 0) {
      list = list.filter((p) => filter.types.includes(TYPE_TAB_MAP[p.type]));
    }
    return list;
  }, [query, activeTab, favorites, filter]);

  /** Toggle yêu thích một tin */
  function handleToggleFavorite(id: string) {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Cập nhật luôn nếu đang xem chi tiết tin đó
    if (selectedProperty?.id === id) {
      setSelectedProperty((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    }
    // TODO: POST/DELETE /api/collections/{id}
  }

  /** Cycle qua các lựa chọn sắp xếp */
  function handleSortPress() {
    const OPTIONS: SortOption[] = ['newest', 'price_asc', 'price_desc', 'area_asc', 'area_desc'];
    const idx = OPTIONS.indexOf(sortBy);
    setSortBy(OPTIONS[(idx + 1) % OPTIONS.length]);
  }

  /** Mở màn Chi tiết BĐS */
  function handleOpenDetail(item: SearchResultProperty) {
    setSelectedProperty(toDetail(item, favorites.has(item.id)));
  }

  return (
    <View style={styles.root}>
      {/* Header tìm kiếm + tab + sort */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <SearchHeader
          value={query}
          onChangeText={setQuery}
          onFilterPress={() => setShowFilter(true)}
          filterActive={activeTab !== 'all' || filter.types.length > 0}
        />
        <SearchFilterTabs selectedId={activeTab} onSelect={setActiveTab} />
        <SearchSortBar resultCount={filtered.length} currentSort={sortBy} onSortPress={handleSortPress} />
      </SafeAreaView>

      {/* Danh sách kết quả */}
      <FlatList
        data={filtered}
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
            <Text style={styles.emptyEmoji}>🔍</Text>
            <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
            <Text style={styles.emptyHint}>Thử từ khóa khác hoặc xóa bộ lọc</Text>
            <TouchableOpacity style={styles.resetBtn} onPress={() => { setQuery(''); setActiveTab('all'); setFilter(DEFAULT_FILTER); }}>
              <Text style={styles.resetBtnText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />

      {/* Màn 07 – Bộ lọc nâng cao */}
      <FilterOverlay
        visible={showFilter}
        filter={filter}
        onFilterChange={setFilter}
        onClose={() => setShowFilter(false)}
        resultCount={filtered.length}
      />

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
  root:       { flex: 1, backgroundColor: BG },
  headerSafe: { backgroundColor: '#FFFFFF', zIndex: 10 },
  listContent: { paddingTop: 12 },
  emptyWrap:  { alignItems: 'center', paddingTop: 80, paddingHorizontal: 32, gap: 10 },
  emptyEmoji: { fontSize: 48, marginBottom: 4 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: '#1F2937' },
  emptyHint:  { fontSize: 13, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
  resetBtn:   { marginTop: 8, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#2563EB', borderRadius: 10 },
  resetBtnText:{ color: '#fff', fontWeight: '700', fontSize: 14 },
});
