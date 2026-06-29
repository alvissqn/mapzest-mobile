/**
 * Màn hình 07 – Bộ lọc nâng cao
 * Hiển thị dưới dạng overlay toàn màn hình trượt lên từ dưới
 * Bao gồm: Loại BĐS, Khu vực, Khoảng giá, Diện tích, Phòng ngủ, Tiện ích, Tình trạng
 */
import { useEffect, useRef } from 'react';
import {
  StyleSheet, View, Text, TouchableOpacity,
  ScrollView, Animated, Dimensions, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FilterChipGroup, ChipOption } from './filter-chip-group';

const { height: SCREEN_H } = Dimensions.get('window');
const PRIMARY  = '#2563EB';
const GRAY_200 = '#E5E7EB';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';
const BG       = '#F9FAFB';

// --- Dữ liệu các lựa chọn bộ lọc ---
const TYPES: ChipOption[]     = [
  { id: 'can-ho',   label: 'Căn hộ',   iconName: 'office-building-outline', iconType: 'material' },
  { id: 'nha-pho',  label: 'Nhà phố',  iconName: 'home-outline', iconType: 'ionicons' },
  { id: 'biet-thu', label: 'Biệt thự', iconName: 'home-city-outline', iconType: 'material' },
  { id: 'dat-nen',  label: 'Đất nền',  iconName: 'sprout-outline', iconType: 'material' },
  { id: 'du-an',    label: 'Dự án',    iconName: 'crane', iconType: 'material' },
];
const PRICES: ChipOption[]    = [
  { id: 'lt2',  label: 'Dưới 2 tỷ' },
  { id: '2to5', label: '2 – 5 tỷ'  },
  { id: '5to10',label: '5 – 10 tỷ' },
  { id: '10to20',label:'10 – 20 tỷ'},
  { id: 'gt20', label: 'Trên 20 tỷ'},
];
const AREAS: ChipOption[]     = [
  { id: 'lt50',    label: 'Dưới 50m²'   },
  { id: '50to100', label: '50 – 100m²'  },
  { id: '100to200',label: '100 – 200m²' },
  { id: 'gt200',   label: 'Trên 200m²'  },
];
const BEDROOMS: ChipOption[]  = [
  { id: 'studio', label: 'Studio' },
  { id: '1pn',    label: '1 PN'   },
  { id: '2pn',    label: '2 PN'   },
  { id: '3pn',    label: '3 PN'   },
  { id: '4pn',    label: '4+ PN'  },
];
const AMENITIES: ChipOption[] = [
  { id: 'pool',     label: 'Hồ bơi',    iconName: 'swim', iconType: 'material' },
  { id: 'gym',      label: 'Gym',        iconName: 'dumbbell', iconType: 'material' },
  { id: 'elevator', label: 'Thang máy', iconName: 'elevator-passenger-outline', iconType: 'material' },
  { id: 'parking',  label: 'Bãi xe',    iconName: 'car-outline', iconType: 'ionicons' },
  { id: 'security', label: 'Bảo vệ',    iconName: 'shield-outline', iconType: 'ionicons' },
];
const STATUS: ChipOption[]    = [
  { id: 'all',   label: 'Tất cả'    },
  { id: 'sell',  label: 'Đang bán'  },
  { id: 'rent',  label: 'Cho thuê'  },
];

/** Trạng thái bộ lọc — dùng bởi màn Tìm kiếm để apply filter */
export interface FilterState {
  types: string[];
  prices: string[];
  areas: string[];
  bedrooms: string[];
  amenities: string[];
  status: string[];
}

export const DEFAULT_FILTER: FilterState = {
  types: [], prices: [], areas: [], bedrooms: [], amenities: [], status: ['all'],
};

interface FilterOverlayProps {
  visible: boolean;
  filter: FilterState;
  onFilterChange: (f: FilterState) => void;
  onClose: () => void;
  resultCount: number; // số kết quả ước tính để hiển thị trên nút "Xem"
}

export function FilterOverlay({
  visible, filter, onFilterChange, onClose, resultCount,
}: FilterOverlayProps) {

  // Animation trượt lên từ dưới
  const slideY = useRef(new Animated.Value(SCREEN_H)).current;
  // Theo dõi trạng thái hiển thị để tránh unmount sớm khi animation chưa xong
  const [rendered, setRendered] = useRef(false).current !== undefined
    ? [false, () => {}]
    : [false, () => {}];

  useEffect(() => {
    if (visible) {
      // Trượt lên
      Animated.timing(slideY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Trượt xuống
      Animated.timing(slideY, {
        toValue: SCREEN_H,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  /** Xóa toàn bộ bộ lọc về mặc định */
  function handleClearAll() {
    onFilterChange(DEFAULT_FILTER);
  }

  /** Helper cập nhật từng trường của filter */
  function update<K extends keyof FilterState>(key: K, val: FilterState[K]) {
    onFilterChange({ ...filter, [key]: val });
  }

  // Không render gì nếu không visible và animation đã xong
  if (!visible) return null;

  return (
    <Animated.View style={[styles.overlay, { transform: [{ translateY: slideY }] }]}>
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>

        {/* Header: tiêu đề + nút Xóa tất cả */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.backBtn} accessibilityLabel="Đóng bộ lọc">
            <Text style={styles.backIcon}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Bộ lọc nâng cao</Text>
          <TouchableOpacity onPress={handleClearAll} accessibilityLabel="Xóa tất cả bộ lọc">
            <Text style={styles.clearText}>Xóa tất cả</Text>
          </TouchableOpacity>
        </View>

        {/* Nội dung cuộn: các nhóm bộ lọc */}
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <FilterChipGroup label="Loại BĐS" options={TYPES}
            selectedIds={filter.types} multiSelect
            onSelect={(v) => update('types', v)} />
          <Divider />

          {/* Khu vực: placeholder, TODO thêm dropdown tỉnh/quận */}
          <View style={styles.areaRow}>
            <Text style={styles.sectionLabel}>Khu vực</Text>
            <TouchableOpacity style={styles.areaBtn} accessibilityLabel="Chọn khu vực">
              <Text style={styles.areaBtnText}>Chọn tỉnh / quận...</Text>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          </View>
          <Divider />

          <FilterChipGroup label="Khoảng giá" options={PRICES}
            selectedIds={filter.prices} multiSelect
            onSelect={(v) => update('prices', v)} />
          <Divider />

          <FilterChipGroup label="Diện tích" options={AREAS}
            selectedIds={filter.areas} multiSelect
            onSelect={(v) => update('areas', v)} />
          <Divider />

          <FilterChipGroup label="Số phòng ngủ" options={BEDROOMS}
            selectedIds={filter.bedrooms} multiSelect
            onSelect={(v) => update('bedrooms', v)} />
          <Divider />

          <FilterChipGroup label="Tiện ích" options={AMENITIES}
            selectedIds={filter.amenities} multiSelect
            onSelect={(v) => update('amenities', v)} />
          <Divider />

          <FilterChipGroup label="Tình trạng" options={STATUS}
            selectedIds={filter.status} multiSelect={false}
            onSelect={(v) => update('status', v)} />
        </ScrollView>

        {/* Nút xem kết quả cố định ở dưới */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.applyBtn} onPress={onClose}
            accessibilityLabel={`Xem ${resultCount} kết quả`}>
            <Text style={styles.applyBtnText}>Xem {resultCount} kết quả</Text>
          </TouchableOpacity>
        </View>

      </SafeAreaView>
    </Animated.View>
  );
}

/** Đường kẻ phân cách giữa các nhóm */
function Divider() {
  return <View style={{ height: 1, backgroundColor: GRAY_200, marginVertical: 4 }} />;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: WHITE,
    zIndex: 5000, // dưới Auth (8500) nhưng trên AppTabs
  },
  safe: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: GRAY_200,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center',
  },
  backIcon: { fontSize: 16, color: GRAY_800 },
  headerTitle: {
    flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '700', color: GRAY_800,
  },
  clearText: { fontSize: 13, fontWeight: '600', color: PRIMARY },

  // Scroll
  scroll: { flex: 1 },
  scrollContent: { padding: 20, gap: 20 },

  // Khu vực (dropdown placeholder)
  sectionLabel: { fontSize: 14, fontWeight: '700', color: GRAY_800 },
  areaRow: { gap: 10 },
  areaBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 14, paddingVertical: 12,
    borderRadius: 12, borderWidth: 1, borderColor: GRAY_200,
    backgroundColor: '#F9FAFB',
  },
  areaBtnText: { fontSize: 14, color: GRAY_500 },
  chevron: { fontSize: 18, color: GRAY_500 },

  // Footer
  footer: {
    padding: 16, borderTopWidth: 1, borderTopColor: GRAY_200,
  },
  applyBtn: {
    backgroundColor: PRIMARY, borderRadius: 14,
    paddingVertical: 15, alignItems: 'center',
  },
  applyBtnText: { color: WHITE, fontSize: 16, fontWeight: '700' },
});
