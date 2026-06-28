import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';

const PRIMARY  = '#2563EB';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'area_asc' | 'area_desc';

const SORT_LABELS: Record<SortOption, string> = {
  newest:     'Mới nhất',
  price_asc:  'Giá thấp → cao',
  price_desc: 'Giá cao → thấp',
  area_asc:   'Diện tích nhỏ → lớn',
  area_desc:  'Diện tích lớn → nhỏ',
};

interface SearchSortBarProps {
  resultCount: number;
  currentSort: SortOption;
  onSortPress: () => void;
}

export function SearchSortBar({
  resultCount,
  currentSort,
  onSortPress,
}: SearchSortBarProps) {
  return (
    <View style={styles.container}>
      {/* Result count */}
      <Text style={styles.countText}>
        <Text style={styles.countNumber}>
          {resultCount.toLocaleString('vi-VN')}
        </Text>{' '}
        kết quả tìm thấy
      </Text>

      {/* Sort button */}
      <TouchableOpacity
        style={styles.sortBtn}
        onPress={onSortPress}
        activeOpacity={0.75}
        accessibilityLabel={`Sắp xếp theo ${SORT_LABELS[currentSort]}`}
      >
        <Text style={styles.sortIcon}>↕️</Text>
        <Text style={styles.sortText}>{SORT_LABELS[currentSort]}</Text>
        <Text style={styles.sortChevron}>▾</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#FAFAFA',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  countText: {
    fontSize: 13,
    color: GRAY_500,
  },
  countNumber: {
    fontWeight: '700',
    color: GRAY_800,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: WHITE,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sortIcon: {
    fontSize: 12,
  },
  sortText: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  sortChevron: {
    fontSize: 10,
    color: PRIMARY,
    marginTop: 1,
  },
});
