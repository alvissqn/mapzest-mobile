import { StyleSheet, View, Text, TouchableOpacity, TextInput, Platform } from 'react-native';

// Primary blue theo Design System MapZest
const PRIMARY = '#2563EB';
const BG = '#FFFFFF';
const GRAY_100 = '#F3F4F6';
const GRAY_400 = '#9CA3AF';
const GRAY_700 = '#374151';

interface HomeHeaderProps {
  onNotificationPress?: () => void;
  onSearchFocus?: () => void;
}

export function HomeHeader({ onNotificationPress, onSearchFocus }: HomeHeaderProps) {
  return (
    <View style={styles.container}>
      {/* Row: Logo + Notification */}
      <View style={styles.topRow}>
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={styles.logoPin}>
            <View style={styles.logoPinInner} />
          </View>
          <Text style={styles.logoText}>
            Map<Text style={styles.logoAccent}>Zest</Text>
          </Text>
        </View>

        {/* Notification bell */}
        <TouchableOpacity
          style={styles.notifBtn}
          onPress={onNotificationPress}
          activeOpacity={0.75}
          accessibilityLabel="Thông báo"
        >
          <View style={styles.notifIcon}>
            {/* Bell shape dùng View */}
            <View style={styles.bellTop} />
            <View style={styles.bellBody} />
            <View style={styles.bellBottom} />
          </View>
          {/* Badge số */}
          <View style={styles.badge}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Search bar */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={onSearchFocus}
        activeOpacity={0.85}
        accessibilityLabel="Tìm kiếm khu vực, dự án, địa điểm"
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>
          Tìm khu vực, dự án, địa điểm...
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: BG,
    paddingTop: Platform.OS === 'android' ? 44 : 0,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    // Shadow nhẹ
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },

  // Logo
  logoWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logoPin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPinInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: GRAY_700,
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: PRIMARY,
  },

  // Notification
  notifBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifIcon: {
    alignItems: 'center',
    gap: 1,
  },
  bellTop: {
    width: 12,
    height: 6,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: GRAY_700,
    marginBottom: 0,
  },
  bellBody: {
    width: 16,
    height: 9,
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    backgroundColor: GRAY_700,
  },
  bellBottom: {
    width: 8,
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
    backgroundColor: GRAY_700,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: BG,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '700',
  },

  // Search
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GRAY_100,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    gap: 8,
  },
  searchIcon: {
    fontSize: 16,
  },
  searchPlaceholder: {
    color: GRAY_400,
    fontSize: 14,
    flex: 1,
  },
});
