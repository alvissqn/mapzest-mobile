import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';

const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';

export type FilterTabId = 'all' | 'can-ho' | 'nha-pho' | 'biet-thu' | 'dat-nen' | 'du-an';

export interface FilterTab {
  id: FilterTabId;
  label: string;
}

export const FILTER_TABS: FilterTab[] = [
  { id: 'all',      label: 'Tất cả'  },
  { id: 'can-ho',   label: 'Căn hộ'  },
  { id: 'nha-pho',  label: 'Nhà phố' },
  { id: 'biet-thu', label: 'Biệt thự' },
  { id: 'dat-nen',  label: 'Đất nền' },
  { id: 'du-an',    label: 'Dự án'   },
];

interface SearchFilterTabsProps {
  selectedId: FilterTabId;
  onSelect: (id: FilterTabId) => void;
}

export function SearchFilterTabs({ selectedId, onSelect }: SearchFilterTabsProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {FILTER_TABS.map((tab) => {
          const isActive = tab.id === selectedId;
          return (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => onSelect(tab.id)}
              activeOpacity={0.75}
              accessibilityLabel={`Lọc theo ${tab.label}`}
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.label}
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
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GRAY_100,
  },
  tabActive: {
    backgroundColor: PRIMARY,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_500,
  },
  tabTextActive: {
    color: WHITE,
  },
});
