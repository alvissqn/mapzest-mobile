/**
 * Nhóm chip bộ lọc — dùng chung cho: Loại BĐS, Phòng ngủ, Tiện ích, Tình trạng, Giá, Diện tích
 * Hỗ trợ cả chọn một (singleSelect) và chọn nhiều (multiSelect)
 */
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// --- Màu sắc theo Design System ---
const PRIMARY  = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';

export interface ChipOption {
  id: string;
  label: string;
  emoji?: string; // fallback emoji
  iconName?: string;
  iconType?: 'ionicons' | 'material' | 'feather';
}

interface FilterChipGroupProps {
  label: string;            // tiêu đề nhóm
  options: ChipOption[];    // danh sách lựa chọn
  selectedIds: string[];    // các id đang được chọn
  multiSelect?: boolean;    // true = chọn nhiều, false = chọn một
  onSelect: (ids: string[]) => void;
}

export function FilterChipGroup({
  label,
  options,
  selectedIds,
  multiSelect = true,
  onSelect,
}: FilterChipGroupProps) {

  /** Xử lý khi người dùng nhấn một chip */
  function handlePress(id: string) {
    if (multiSelect) {
      // Chọn nhiều: toggle on/off chip vừa nhấn
      if (selectedIds.includes(id)) {
        onSelect(selectedIds.filter((x) => x !== id));
      } else {
        onSelect([...selectedIds, id]);
      }
    } else {
      // Chọn một: luôn thay thế bằng chip mới nhấn
      onSelect([id]);
    }
  }

  return (
    <View style={styles.wrapper}>
      <Text style={styles.sectionLabel}>{label}</Text>
      <View style={styles.chipRow}>
        {options.map((opt) => {
          const isActive = selectedIds.includes(opt.id);
          return (
            <TouchableOpacity
              key={opt.id}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => handlePress(opt.id)}
              activeOpacity={0.75}
              accessibilityLabel={`Lọc ${label}: ${opt.label}`}
              accessibilityState={{ selected: isActive }}
            >
              {opt.iconName && opt.iconType ? (
                opt.iconType === 'material' ? (
                  <MaterialCommunityIcons
                    name={opt.iconName as any}
                    size={14}
                    color={isActive ? PRIMARY : GRAY_500}
                  />
                ) : opt.iconType === 'ionicons' ? (
                  <Ionicons
                    name={opt.iconName as any}
                    size={14}
                    color={isActive ? PRIMARY : GRAY_500}
                  />
                ) : (
                  <Feather
                    name={opt.iconName as any}
                    size={13}
                    color={isActive ? PRIMARY : GRAY_500}
                  />
                )
              ) : opt.emoji ? (
                <Text style={styles.chipEmoji}>{opt.emoji}</Text>
              ) : null}
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 10,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY_800,
    letterSpacing: -0.1,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: GRAY_100,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  chipActive: {
    backgroundColor: '#EFF6FF',
    borderColor: PRIMARY,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: GRAY_500,
  },
  chipTextActive: {
    color: PRIMARY,
  },
});
