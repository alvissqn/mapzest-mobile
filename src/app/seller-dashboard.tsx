/**
 * Màn hình 16 – Trang chủ Người bán (Seller Dashboard)
 * Route: /seller-dashboard
 *
 * Giao diện:
 * - Lời chào "Xin chào, Nguyễn Văn Seller"
 * - Grid thống kê tháng: Tin đăng (8) | Leads mới (14) | Lượt xem (2.4k) | Sắp hết hạn (1)
 * - Lưới Quản lý nhanh: Đăng tin mới, Tin nhắn, Quản lý tin, Leads CRM
 * - Danh sách tin đăng đang hoạt động tóm tắt
 */
import {
  StyleSheet, View, Text, ScrollView,
  TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabInset } from '@/constants/theme';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { InboxOverlay } from '@/components/inbox-overlay';
import { SellerAnalyticsOverlay } from '@/components/seller-analytics-overlay';
import { SellerVipOverlay } from '@/components/seller-vip-overlay';
import { useState } from 'react';

const BG = '#F9FAFB';
const PRIMARY = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const GREEN = '#16A34A';
const WHITE = '#FFFFFF';
const ORANGE = '#EA580C';

export default function SellerDashboardScreen() {
  const router = useRouter();

  const [showInbox, setShowInbox] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showVip, setShowVip] = useState(false);

  function handleActionPress(name: string) {
    Alert.alert('Mapzest Seller', `Tính năng "${name}" đang được kết nối với API hệ thống.`);
  }

  return (
    <View style={styles.root}>
      {/* Header cố định */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Seller Dashboard</Text>
          <TouchableOpacity style={styles.bellBtn} onPress={() => handleActionPress('Thông báo')}>
            <Ionicons name="notifications-outline" size={18} color={GRAY_800} />
            <View style={styles.bellBadge} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: BottomTabInset + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lời chào */}
        <View style={styles.welcomeRow}>
          <Text style={styles.greeting}>Xin chào,</Text>
          <Text style={styles.sellerName}>Nguyễn Văn Seller</Text>
        </View>

        {/* ==================== 1. THỐNG KÊ THÁNG (Bento Grid) ==================== */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="list-outline" size={18} color={PRIMARY} />
            </View>
            <Text style={styles.statNumber}>8</Text>
            <Text style={styles.statLabel}>Tin đang đăng</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EFF6FF' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Ionicons name="people-outline" size={18} color={PRIMARY} />
            </View>
            <Text style={[styles.statNumber, { color: PRIMARY }]}>+14</Text>
            <Text style={styles.statLabel}>Khách mới (Leads)</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconWrap}>
              <Ionicons name="eye-outline" size={18} color={PRIMARY} />
            </View>
            <Text style={styles.statNumber}>2.4k</Text>
            <Text style={styles.statLabel}>Lượt xem tin</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#FFF7ED' }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#FFEDD5' }]}>
              <Ionicons name="warning-outline" size={18} color={ORANGE} />
            </View>
            <Text style={[styles.statNumber, { color: ORANGE }]}>1</Text>
            <Text style={styles.statLabel}>Sắp hết hạn</Text>
          </View>
        </View>

        {/* ==================== 2. QUẢN LÝ NHANH ==================== */}
        <Text style={styles.sectionTitle}>Quản lý nhanh</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={styles.quickItem} onPress={() => router.navigate('/seller-post')} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="add" size={20} color={PRIMARY} />
            </View>
            <Text style={styles.quickLabel}>Đăng tin mới</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => router.navigate('/seller-listings')} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="list-outline" size={20} color="#16A34A" />
            </View>
            <Text style={styles.quickLabel}>Quản lý tin</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => setShowInbox(true)} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: '#FAF5FF' }]}>
              <Ionicons name="chatbubble-ellipses-outline" size={20} color="#7C3AED" />
            </View>
            <Text style={styles.quickLabel}>Tin nhắn</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => router.navigate('/seller-leads')} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="people-outline" size={20} color="#EA580C" />
            </View>
            <Text style={styles.quickLabel}>Leads CRM</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => setShowAnalytics(true)} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: '#F0FDF4' }]}>
              <Ionicons name="bar-chart-outline" size={20} color="#16A34A" />
            </View>
            <Text style={styles.quickLabel}>Thống kê</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickItem} onPress={() => setShowVip(true)} activeOpacity={0.8}>
            <View style={[styles.quickIconWrap, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="diamond-outline" size={20} color="#D97706" />
            </View>
            <Text style={styles.quickLabel}>Gói VIP</Text>
          </TouchableOpacity>
        </View>

        {/* ==================== 3. TIN ĐĂNG HOẠT ĐỘNG ==================== */}
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Tin đăng hoạt động</Text>
          <TouchableOpacity onPress={() => router.navigate('/seller-listings')}>
            <Text style={styles.seeAllText}>Xem tất cả</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.listingList}>
          {/* Card tin đăng 1 */}
          <TouchableOpacity style={styles.listingCard} onPress={() => router.navigate('/seller-listings')} activeOpacity={0.9}>
            <View style={styles.listingImg}>
              <MaterialCommunityIcons name="office-building-outline" size={24} color={PRIMARY} />
            </View>
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle} numberOfLines={1}>Vinhomes Grand Park – The Rainbow</Text>
              <Text style={styles.listingPrice}>3.2 tỷ · 62m²</Text>
              <View style={styles.listingStats}>
                <View style={styles.listingStatRow}>
                  <Ionicons name="eye-outline" size={12} color={GRAY_500} style={{ marginRight: 3 }} />
                  <Text style={styles.listingStatItem}>1.2k lượt xem</Text>
                </View>
                <View style={styles.listingStatRow}>
                  <Ionicons name="chatbubble-ellipses-outline" size={12} color={GRAY_500} style={{ marginRight: 3 }} />
                  <Text style={styles.listingStatItem}>8 khách hỏi</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>

          {/* Card tin đăng 2 */}
          <TouchableOpacity style={styles.listingCard} onPress={() => router.navigate('/seller-listings')} activeOpacity={0.9}>
            <View style={[styles.listingImg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="home-outline" size={24} color="#D97706" />
            </View>
            <View style={styles.listingInfo}>
              <Text style={styles.listingTitle} numberOfLines={1}>Nhà phố Thảo Điền view sông</Text>
              <Text style={styles.listingPrice}>12.5 tỷ · 115m²</Text>
              <View style={styles.listingStats}>
                <View style={styles.listingStatRow}>
                  <Ionicons name="eye-outline" size={12} color={GRAY_500} style={{ marginRight: 3 }} />
                  <Text style={styles.listingStatItem}>850 lượt xem</Text>
                </View>
                <View style={styles.listingStatRow}>
                  <Ionicons name="chatbubble-ellipses-outline" size={12} color={GRAY_500} style={{ marginRight: 3 }} />
                  <Text style={styles.listingStatItem}>4 khách hỏi</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </View>

      </ScrollView>

      {/* RENDER CÁC OVERLAYS TOÀN MÀN HÌNH */}
      <InboxOverlay
        visible={showInbox}
        onClose={() => setShowInbox(false)}
      />

      <SellerAnalyticsOverlay
        visible={showAnalytics}
        onClose={() => setShowAnalytics(false)}
        onOpenVip={() => {
          setShowAnalytics(false);
          setShowVip(true);
        }}
      />

      <SellerVipOverlay
        visible={showVip}
        onClose={() => setShowVip(false)}
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
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GRAY_800,
    letterSpacing: -0.3,
  },
  bellBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: GRAY_100,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  bellBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: WHITE,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 20,
  },
  welcomeRow: {
    gap: 4,
  },
  greeting: {
    fontSize: 14,
    color: GRAY_500,
  },
  sellerName: {
    fontSize: 20,
    fontWeight: '800',
    color: GRAY_800,
    letterSpacing: -0.3,
  },

  // Bento Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: GRAY_800,
  },
  statLabel: {
    fontSize: 11,
    color: GRAY_500,
    fontWeight: '500',
  },

  // Quick action grid
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: GRAY_800,
    letterSpacing: -0.2,
  },
  quickGrid: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  quickItem: {
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  quickIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAY_800,
  },

  // Listing List
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllText: {
    color: PRIMARY,
    fontSize: 13,
    fontWeight: '600',
  },
  listingList: {
    gap: 10,
  },
  listingCard: {
    flexDirection: 'row',
    backgroundColor: WHITE,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  listingImg: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: GRAY_800,
  },
  listingPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: PRIMARY,
  },
  listingStats: {
    flexDirection: 'row',
    gap: 12,
  },
  listingStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listingStatItem: {
    fontSize: 10,
    color: GRAY_500,
  },
});
