import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
} from 'react-native';

const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_400 = '#9CA3AF';
const GRAY_700 = '#374151';
const WHITE   = '#FFFFFF';

interface SearchHeaderProps {
  value: string;
  onChangeText: (text: string) => void;
  onFilterPress: () => void;
  onBackPress?: () => void;
  filterActive?: boolean; // true nếu đang có bộ lọc áp dụng
}

export function SearchHeader({
  value,
  onChangeText,
  onFilterPress,
  onBackPress,
  filterActive = false,
}: SearchHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Back button */}
      {onBackPress && (
        <TouchableOpacity
          style={styles.backBtn}
          onPress={onBackPress}
          activeOpacity={0.7}
          accessibilityLabel="Quay lại"
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
      )}

      {/* Search input */}
      <View style={styles.inputWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder="Tìm khu vực, dự án, địa điểm..."
          placeholderTextColor={GRAY_400}
          returnKeyType="search"
          autoCorrect={false}
          accessibilityLabel="Ô tìm kiếm BĐS"
        />
        {value.length > 0 && (
          <TouchableOpacity
            onPress={() => onChangeText('')}
            accessibilityLabel="Xóa nội dung tìm kiếm"
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter button */}
      <TouchableOpacity
        style={[styles.filterBtn, filterActive && styles.filterBtnActive]}
        onPress={onFilterPress}
        activeOpacity={0.75}
        accessibilityLabel="Bộ lọc nâng cao"
      >
        <Text style={[styles.filterIcon, filterActive && styles.filterIconActive]}>
          ⚙️
        </Text>
        {filterActive && <View style={styles.filterDot} />}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    paddingTop: Platform.OS === 'android' ? 44 : 8,
    paddingBottom: 12,
    paddingHorizontal: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 18,
    color: GRAY_700,
    lineHeight: 22,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchIcon: {
    fontSize: 15,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: GRAY_700,
    padding: 0,
    margin: 0,
  },
  clearIcon: {
    fontSize: 13,
    color: GRAY_400,
    padding: 2,
  },
  filterBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: PRIMARY,
  },
  filterIcon: {
    fontSize: 18,
  },
  filterIconActive: {},
  filterDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: PRIMARY,
    borderWidth: 1.5,
    borderColor: WHITE,
  },
});
