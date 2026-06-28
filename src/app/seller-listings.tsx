/**
 * Màn hình 22 – Quản lý tin đăng (My Listings)
 * Route: /seller-listings
 *
 * Giao diện:
 * - Tabs lọc trạng thái: Đang hiển thị | Đợi duyệt | Nháp | Đã đóng
 * - Tìm kiếm & sắp xếp tin đăng
 * - Danh sách tin kèm số liệu thống kê (lượt xem, cuộc gọi)
 * - Nút hành động nhanh: Đẩy tin (VIP), Đóng tin, Xóa tin, Chỉnh sửa
 */
import { useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, FlatList,
  TouchableOpacity, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabInset } from '@/constants/theme';

const BG = '#F9FAFB';
const PRIMARY = '#2563EB';
const GRAY_200 = '#E5E7EB';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const GREEN = '#16A34A';
const WHITE = '#FFFFFF';

interface SellerProperty {
  id: string;
  code: string;
  title: string;
  price: string;
  area: number;
  type: string;
  status: 'active' | 'pending' | 'draft' | 'closed'; // Trạng thái tin
  views: number;
  leads: number;
  bgColor: string;
  bgEmoji: string;
  date: string;
}

const INITIAL_LISTINGS: SellerProperty[] = [
  {
    id: 'l1', code: 'MZ-001', title: 'Vinhomes Grand Park – The Rainbow',
    price: '3.2 tỷ', area: 62, type: 'Căn hộ', status: 'active',
    views: 1240, leads: 8, bgColor: '#DBEAFE', bgEmoji: '🏢', date: '20/06/2026'
  },
  {
    id: 'l2', code: 'MZ-002', title: 'Nhà phố Thảo Điền view sông Sài Gòn',
    price: '12.5 tỷ', area: 115, type: 'Nhà phố', status: 'active',
    views: 856, leads: 4, bgColor: '#FEF3C7', bgEmoji: '🏠', date: '18/06/2026'
  },
  {
    id: 'l3', code: 'MZ-003', title: 'Biệt thự Nam Sài Gòn – Phú Mỹ Hưng',
    price: '38 tỷ', area: 400, type: 'Biệt thự', status: 'active',
    views: 312, leads: 2, bgColor: '#F0FDF4', bgEmoji: '🏰', date: '15/06/2026'
  },
  {
    id: 'l4', code: 'MZ-004', title: 'Căn hộ Masteri Thảo Điền – Tháp T1',
    price: '6.8 tỷ', area: 60, type: 'Căn hộ', status: 'active',
    views: 450, leads: 1, bgColor: '#DBEAFE', bgEmoji: '🏢', date: '19/06/2026'
  },
  {
    id: 'l5', code: 'MZ-005', title: 'Nháp: Đất nền Nhơn Trạch Đồng Nai',
    price: '1.2 tỷ', area: 100, type: 'Đất nền', status: 'draft',
    views: 0, leads: 0, bgColor: '#FDF4FF', bgEmoji: '🌿', date: '20/06/2026'
  }
];

export default function SellerListingsScreen() {
  const [listings, setListings] = useState<SellerProperty[]>(INITIAL_LISTINGS);
  const [activeTab, setActiveTab] = useState<'active' | 'pending' | 'draft' | 'closed'>('active');
  const [query, setQuery] = useState('');

  // Lọc danh sách theo tab + keyword tìm kiếm
  const filteredListings = useMemo(() => {
    return listings.filter((item) => {
      const matchTab = item.status === activeTab;
      const matchQuery = item.title.toLowerCase().includes(query.toLowerCase()) || item.code.toLowerCase().includes(query.toLowerCase());
      return matchTab && matchQuery;
    });
  }, [listings, activeTab, query]);

  /** Thao tác đẩy tin VIP */
  function handlePromoteListing(id: string, title: string) {
    Alert.alert('Đẩy tin VIP', `Bạn có muốn dùng 1 lượt đẩy tin để đưa bài đăng "${title}" lên vị trí nổi bật nhất?`, [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đẩy tin', onPress: () => {
          Alert.alert('Thành công', 'Tin đăng của bạn đã được đẩy lên đầu trang tìm kiếm!');
        }
      }
    ]);
  }

  /** Thao tác đóng tin */
  function handleCloseListing(id: string) {
    Alert.alert('Đóng tin đăng', 'Khách hàng sẽ không nhìn thấy tin đăng này nữa. Bạn có chắc chắn muốn đóng?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Đóng tin', style: 'destructive', onPress: () => {
          setListings((prev) => prev.map((p) => p.id === id ? { ...p, status: 'closed' as const } : p));
        }
      }
    ]);
  }

  /** Thao tác xóa tin */
  function handleClearListing(id: string) {
    Alert.alert('Xóa tin đăng', 'Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa vĩnh viễn?', [
      { text: 'Hủy', style: 'cancel' },
      {
        text: 'Xóa tin', style: 'destructive', onPress: () => {
          setListings((prev) => prev.filter((p) => p.id !== id));
        }
      }
    ]);
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tin đăng của tôi</Text>
        </View>

        {/* Ô Tìm kiếm */}
        <View style={styles.searchWrap}>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tiêu đề, mã tin MZ-..."
            placeholderTextColor={GRAY_500}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Tabs trạng thái */}
        <View style={styles.tabRow}>
          {(['active', 'pending', 'draft', 'closed'] as const).map((tab) => {
            const labelMap = { active: 'Đang đăng', pending: 'Chờ duyệt', draft: 'Bản nháp', closed: 'Đã đóng' };
            const count = listings.filter((p) => p.status === tab).length;
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab)}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                  {labelMap[tab]} ({count})
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>

      {/* Danh sách tin đăng */}
      <FlatList
        data={filteredListings}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {/* Hàng thông tin chính */}
            <View style={styles.cardMain}>
              <View style={[styles.img, { backgroundColor: item.bgColor }]}>
                <Text style={styles.imgEmoji}>{item.bgEmoji}</Text>
              </View>
              <View style={styles.info}>
                <View style={styles.codeRow}>
                  <Text style={styles.code}>#{item.code}</Text>
                  <Text style={styles.date}>{item.date}</Text>
                </View>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.price}>{item.price} · <Text style={styles.area}>{item.area}m²</Text></Text>
                
                {/* Stats */}
                <View style={styles.statsRow}>
                  <Text style={styles.statText}>👁️ {item.views} lượt xem</Text>
                  <Text style={styles.statText}>📞 {item.leads} khách hỏi</Text>
                </View>
              </View>
            </View>

            {/* Hàng nút thao tác nhanh */}
            <View style={styles.actionRow}>
              {item.status === 'active' && (
                <TouchableOpacity style={styles.actionBtn} onPress={() => handlePromoteListing(item.id, item.title)}>
                  <Text style={[styles.actionBtnText, { color: PRIMARY }]}>⚡ Đẩy VIP</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Chỉnh sửa', 'Chuyển sang màn sửa tin.')}>
                <Text style={styles.actionBtnText}>✏️ Sửa</Text>
              </TouchableOpacity>
              {item.status !== 'closed' ? (
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleCloseListing(item.id)}>
                  <Text style={[styles.actionBtnText, { color: '#EA580C' }]}>📴 Đóng</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleClearListing(item.id)}>
                  <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>🗑️ Xóa</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        contentContainerStyle={[styles.listContent, { paddingBottom: BottomTabInset + 20 }]}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>📋</Text>
            <Text style={styles.emptyTitle}>Không có tin đăng nào</Text>
            <Text style={styles.emptyHint}>Không có tin đăng nào trùng khớp ở mục này.</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  headerSafe: { backgroundColor: WHITE, borderBottomWidth: 1, borderBottomColor: GRAY_200, zIndex: 10 },
  header: { paddingHorizontal: 16, paddingVertical: 12, alignItems: 'center' },
  headerTitle: { fontSize: 17, fontWeight: '800', color: GRAY_800 },
  
  // Search
  searchWrap: { paddingHorizontal: 16, paddingBottom: 8 },
  searchInput: { backgroundColor: BG, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, fontSize: 13, color: GRAY_800 },
  
  // Tabs
  tabRow: { flexDirection: 'row', paddingHorizontal: 12, gap: 4 },
  tabBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderBottomWidth: 2.5, borderColor: 'transparent' },
  tabBtnActive: { borderColor: PRIMARY },
  tabText: { fontSize: 11, fontWeight: '600', color: GRAY_500 },
  tabTextActive: { color: PRIMARY, fontWeight: '700' },
  
  // List
  listContent: { paddingTop: 12 },
  card: { backgroundColor: WHITE, marginHorizontal: 16, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  cardMain: { flexDirection: 'row', padding: 12, gap: 12 },
  img: { width: 70, height: 70, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  imgEmoji: { fontSize: 32 },
  info: { flex: 1, gap: 3 },
  codeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  code: { fontSize: 10, color: GRAY_500, fontWeight: '600' },
  date: { fontSize: 10, color: GRAY_500 },
  title: { fontSize: 14, fontWeight: '700', color: GRAY_800 },
  price: { fontSize: 13, fontWeight: '700', color: PRIMARY },
  area: { color: GRAY_800 },
  statsRow: { flexDirection: 'row', gap: 12, marginTop: 2 },
  statText: { fontSize: 10, color: GRAY_500 },
  
  // Action Row
  actionRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#F3F4F6', backgroundColor: '#FAFAFA' },
  actionBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { fontSize: 11, fontWeight: '700', color: GRAY_800 },
  
  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 8, paddingTop: 100 },
  emptyEmoji: { fontSize: 44, opacity: 0.8 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: GRAY_800 },
  emptyHint: { fontSize: 12, color: GRAY_500, textAlign: 'center' }
});
