import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';

const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';

export interface Category {
  id: string;
  label: string;
  emoji: string;
  count: number;
}

const CATEGORIES: Category[] = [
  { id: 'can-ho',  label: 'Căn hộ',   emoji: '🏢', count: 1240 },
  { id: 'nha-pho', label: 'Nhà phố',  emoji: '🏠', count: 856  },
  { id: 'biet-thu',label: 'Biệt thự', emoji: '🏰', count: 312  },
  { id: 'dat-nen', label: 'Đất nền',  emoji: '🌿', count: 594  },
  { id: 'du-an',   label: 'Dự án',    emoji: '🏗️', count: 78   },
];

interface HomeCategoryListProps {
  selectedId?: string;
  onSelect?: (category: Category) => void;
  onSeeAll?: () => void;
}

export function HomeCategoryList({ selectedId, onSelect, onSeeAll }: HomeCategoryListProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.titleRow}>
        <Text style={styles.title}>Danh mục</Text>
        <TouchableOpacity activeOpacity={0.7} onPress={onSeeAll}>
          <Text style={styles.seeAll}>Xem tất cả</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {CATEGORIES.map((cat) => {
          const isActive = cat.id === selectedId;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.card, isActive && styles.cardActive]}
              onPress={() => onSelect?.(cat)}
              activeOpacity={0.75}
              accessibilityLabel={`Danh mục ${cat.label}, ${cat.count} tin`}
            >
              <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
                <Text style={styles.emoji}>{cat.emoji}</Text>
              </View>
              <Text style={[styles.label, isActive && styles.labelActive]}>
                {cat.label}
              </Text>
              <Text style={[styles.count, isActive && styles.countActive]}>
                {cat.count.toLocaleString('vi-VN')} tin
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: GRAY_800,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '600',
    color: PRIMARY,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 10,
  },

  // Card
  card: {
    width: 88,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    gap: 6,
  },
  cardActive: {
    backgroundColor: PRIMARY,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  emoji: {
    fontSize: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: GRAY_800,
    textAlign: 'center',
  },
  labelActive: {
    color: '#FFFFFF',
  },
  count: {
    fontSize: 10,
    color: GRAY_500,
    textAlign: 'center',
  },
  countActive: {
    color: 'rgba(255,255,255,0.8)',
  },
});
