/**
 * Màn hình Tài khoản Người bán (Seller Profile)
 * Route: /seller-profile
 *
 * Giao diện:
 * - Header thông tin cá nhân của người bán (Verified Broker)
 * - Nút "Chuyển sang giao diện Người mua" dẫn về '/'
 * - Thống kê: Tin đăng | Lượt xem | Khách hàng (Leads)
 * - Menu list: Quản lý tin, Leads CRM, Gói VIP, Hỗ trợ người bán...
 */
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, Alert, DeviceEventEmitter
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabInset } from '@/constants/theme';

const BG = '#F9FAFB';
const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const GREEN = '#16A34A';
const WHITE = '#FFFFFF';

interface MenuItemProps {
  emoji: string;
  title: string;
  subtitle?: string;
  onPress: () => void;
}

function MenuItem({ emoji, title, subtitle, onPress }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.menuLeft}>
        <View style={styles.menuIconWrap}>
          <Text style={styles.menuEmoji}>{emoji}</Text>
        </View>
        <View style={styles.menuTextWrap}>
          <Text style={styles.menuTitle}>{title}</Text>
          {subtitle ? <Text style={styles.menuSubtitle}>{subtitle}</Text> : null}
        </View>
      </View>
      <Text style={styles.menuChevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function SellerProfileScreen() {
  const router = useRouter();

  function handleMenuPress(name: string) {
    Alert.alert('Mapzest Seller', `Tính năng "${name}" đang được kết nối với API hệ thống.`);
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Cá nhân Người bán</Text>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ==================== 1. PROFILE HEADER ==================== */}
        <View style={styles.profileCard}>
          <View style={styles.avatarWrap}>
            <Text style={styles.avatarEmoji}>👨‍💼</Text>
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.profileName}>Nguyễn Văn Seller</Text>
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>✓ Môi giới chuyên nghiệp</Text>
              </View>
            </View>
            <Text style={styles.profileEmail}>seller.nguyen@mapzest.vn</Text>
          </View>
        </View>

        {/* Nút chuyển đổi vai trò về Người mua */}
        <TouchableOpacity
          style={styles.switchRoleBtn}
          onPress={() => {
            globalThis.role = 'buyer';
            DeviceEventEmitter.emit('changeRole', 'buyer');
            router.replace('/');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.switchRoleText}>🔄 Chuyển sang giao diện Người mua</Text>
        </TouchableOpacity>

        {/* ==================== 2. STATS BAR ==================== */}
        <View style={styles.statsBar}>
          <TouchableOpacity style={styles.statItem} onPress={() => router.navigate('/seller-listings')} activeOpacity={0.7}>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Tin đăng</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          
          <TouchableOpacity style={styles.statItem} onPress={() => handleMenuPress('Lượt xem tin')} activeOpacity={0.7}>
            <Text style={styles.statNumber}>2.4k</Text>
            <Text style={styles.statLabel}>Lượt xem</Text>
          </TouchableOpacity>
          <View style={styles.statDivider} />
          
          <TouchableOpacity style={styles.statItem} onPress={() => handleMenuPress('Leads CRM')} activeOpacity={0.7}>
            <Text style={styles.statNumber}>14</Text>
            <Text style={styles.statLabel}>Khách liên hệ</Text>
          </TouchableOpacity>
        </View>

        {/* ==================== 3. MENU GROUPS ==================== */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Quản lý kinh doanh</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              emoji="📋"
              title="Quản lý tin đăng"
              subtitle="Danh sách tin đăng, lịch sử, chỉnh sửa và đóng tin"
              onPress={() => router.navigate('/seller-listings')}
            />
            <View style={styles.itemDivider} />
            <MenuItem
              emoji="👥"
              title="Quản lý Khách hàng (Leads CRM)"
              subtitle="Thông tin khách liên hệ, yêu cầu mua/thuê BĐS"
              onPress={() => handleMenuPress('Quản lý Khách hàng')}
            />
            <View style={styles.itemDivider} />
            <MenuItem
              emoji="💎"
              title="Gói tin VIP & Dịch vụ"
              subtitle="Đăng ký đẩy tin VIP, nạp tiền Mapzest Coin"
              onPress={() => handleMenuPress('Gói tin VIP & Dịch vụ')}
            />
            <View style={styles.itemDivider} />
            <MenuItem
              emoji="📊"
              title="Thống kê hiệu quả"
              subtitle="Báo cáo lượt click, xem tin và leads nhận được"
              onPress={() => handleMenuPress('Thống kê hiệu quả')}
            />
          </View>
        </View>

        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>Cá nhân & Hỗ trợ</Text>
          <View style={styles.menuGroup}>
            <MenuItem
              emoji="👤"
              title="Thông tin văn phòng môi giới"
              onPress={() => handleMenuPress('Thông tin văn phòng')}
            />
            <View style={styles.itemDivider} />
            <MenuItem
              emoji="📞"
              title="Hỗ trợ đại lý / môi giới"
              onPress={() => handleMenuPress('Hỗ trợ đại lý')}
            />
            <View style={styles.itemDivider} />
            <MenuItem
              emoji="⚙️"
              title="Cài đặt thông báo"
              onPress={() => handleMenuPress('Cài đặt thông báo')}
            />
          </View>
        </View>

        {/* Nút đăng xuất */}
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Đăng xuất', style: 'destructive', onPress: () => {} }
          ])}
          activeOpacity={0.7}
        >
          <Text style={styles.logoutText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>

      </ScrollView>
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },

  // Profile Card
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarEmoji: {
    fontSize: 32,
  },
  profileDetails: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  profileName: {
    fontSize: 17,
    fontWeight: '800',
    color: GRAY_800,
    letterSpacing: -0.2,
  },
  verifiedBadge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  verifiedText: {
    color: '#D97706',
    fontSize: 10,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 13,
    color: GRAY_500,
  },

  // Switch role btn
  switchRoleBtn: {
    backgroundColor: '#EFF6FF',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: PRIMARY,
    marginTop: -8,
  },
  switchRoleText: {
    color: PRIMARY,
    fontSize: 14,
    fontWeight: '700',
  },

  // Stats bar
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: PRIMARY,
  },
  statLabel: {
    fontSize: 11,
    color: GRAY_500,
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: GRAY_200,
  },

  // Sections & Menu
  sectionWrap: {
    gap: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: GRAY_500,
    paddingLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  menuGroup: {
    backgroundColor: WHITE,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    backgroundColor: WHITE,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  menuIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuEmoji: {
    fontSize: 18,
  },
  menuTextWrap: {
    flex: 1,
    gap: 2,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY_800,
  },
  menuSubtitle: {
    fontSize: 11,
    color: GRAY_500,
    lineHeight: 14,
  },
  menuChevron: {
    fontSize: 20,
    color: GRAY_500,
    fontWeight: '300',
    paddingLeft: 8,
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginLeft: 62,
  },

  // Logout button
  logoutBtn: {
    marginTop: 8,
    backgroundColor: WHITE,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  logoutText: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '700',
  },
});
