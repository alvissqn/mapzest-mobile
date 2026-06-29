/**
 * Màn hình 23 – Lead khách hàng (CRM Leads)
 * Route: /seller-leads (tab Leads trong Seller Tab Bar)
 *
 * Giao diện:
 * - Header tìm kiếm theo tên, SĐT, nhu cầu
 * - Tab trạng thái: Tất cả | Mới | Đang liên hệ | Tiềm năng | Đã chốt | Mất
 * - Danh sách lead: avatar, tên, nhu cầu BĐS, khu vực, ngân sách, thời gian, badge màu
 * - Nhấn vào lead → Call hoặc chuyển sang Chat
 *
 * TODO: GET /api/leads để tải danh sách lead thật
 * TODO: PUT /api/leads/{id}/status để cập nhật trạng thái
 */
import { useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, FlatList, ListRenderItem,
  TouchableOpacity, TextInput, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BottomTabInset } from '@/constants/theme';
import { ChatOverlay } from '@/components/chat-overlay';

const BG       = '#F9FAFB';
const PRIMARY  = '#2563EB';
const GRAY_100 = '#F3F4F6';
const GRAY_200 = '#E5E7EB';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';

// ---- Loại trạng thái lead ----
type LeadStatus = 'new' | 'contacting' | 'potential' | 'closed' | 'lost';

// ---- Cấu hình badge màu theo trạng thái ----
const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string }> = {
  new:        { label: 'Mới',          bg: '#EFF6FF', text: '#2563EB' },
  contacting: { label: 'Đang liên hệ', bg: '#FFF7ED', text: '#EA580C' },
  potential:  { label: 'Tiềm năng',   bg: '#F0FDF4', text: '#16A34A' },
  closed:     { label: 'Đã chốt',     bg: '#F0FDF4', text: '#15803D' },
  lost:       { label: 'Mất',         bg: '#FEF2F2', text: '#DC2626' },
};

// ---- Tab lọc ----
type TabKey = 'all' | LeadStatus;
const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',        label: 'Tất cả'       },
  { key: 'new',        label: 'Mới'           },
  { key: 'contacting', label: 'Đang liên hệ' },
  { key: 'potential',  label: 'Tiềm năng'    },
  { key: 'closed',     label: 'Đã chốt'      },
  { key: 'lost',       label: 'Mất'           },
];

// ---- Kiểu dữ liệu Lead ----
interface Lead {
  id: string;
  name: string;
  phone: string;
  avatarEmoji: string;
  avatarBg: string;
  need: string;          // Nhu cầu (Mua, Thuê...)
  area: string;          // Khu vực quan tâm
  budget: string;        // Ngân sách
  propertyType: string;  // Loại BĐS
  time: string;          // Thời gian lead vào
  status: LeadStatus;
  note?: string;
}

// ---- Dữ liệu mock ----
const MOCK_LEADS: Lead[] = [
  {
    id: 'l1', name: 'Nguyễn Văn Minh', phone: '0901234567',
    avatarEmoji: '👨', avatarBg: '#DBEAFE',
    need: 'Mua', area: 'TP. Thủ Đức, TP.HCM',
    budget: '3–5 tỷ', propertyType: 'Căn hộ',
    time: '5 phút trước', status: 'new',
    note: 'Cần nhà trước Q3, muốn view sông',
  },
  {
    id: 'l2', name: 'Trần Thị Hoa', phone: '0912345678',
    avatarEmoji: '👩', avatarBg: '#FEF3C7',
    need: 'Mua', area: 'Quận 7, TP.HCM',
    budget: '10–15 tỷ', propertyType: 'Nhà phố',
    time: '30 phút trước', status: 'contacting',
    note: 'Đã xem 2 căn, còn đang cân nhắc',
  },
  {
    id: 'l3', name: 'Lê Quang Hải', phone: '0923456789',
    avatarEmoji: '🧔', avatarBg: '#F0FDF4',
    need: 'Mua', area: 'Bình Chánh, TP.HCM',
    budget: '2–3 tỷ', propertyType: 'Đất nền',
    time: '2 giờ trước', status: 'potential',
  },
  {
    id: 'l4', name: 'Phạm Thanh Tú', phone: '0934567890',
    avatarEmoji: '👧', avatarBg: '#FDF2F8',
    need: 'Thuê', area: 'Quận 3, TP.HCM',
    budget: '15–20 tr/tháng', propertyType: 'Căn hộ',
    time: '3 giờ trước', status: 'new',
  },
  {
    id: 'l5', name: 'Vũ Hoàng Nam', phone: '0945678901',
    avatarEmoji: '👨‍💼', avatarBg: '#ECFDF5',
    need: 'Mua', area: 'Nhà Bè, TP.HCM',
    budget: '5–8 tỷ', propertyType: 'Biệt thự',
    time: '1 ngày trước', status: 'closed',
    note: 'Đã ký hợp đồng đặt cọc ✅',
  },
  {
    id: 'l6', name: 'Ngô Thị Lan', phone: '0956789012',
    avatarEmoji: '👩‍💼', avatarBg: '#EFF6FF',
    need: 'Mua', area: 'Gò Vấp, TP.HCM',
    budget: '4–6 tỷ', propertyType: 'Căn hộ',
    time: '2 ngày trước', status: 'lost',
    note: 'Đã mua BĐS của đơn vị khác',
  },
  {
    id: 'l7', name: 'Đinh Văn Hùng', phone: '0967890123',
    avatarEmoji: '👱', avatarBg: '#FFF7ED',
    need: 'Mua', area: 'Bình Thạnh, TP.HCM',
    budget: '3–4 tỷ', propertyType: 'Căn hộ',
    time: '3 ngày trước', status: 'potential',
    note: 'Chờ giải ngân ngân hàng',
  },
  {
    id: 'l8', name: 'Bùi Minh Châu', phone: '0978901234',
    avatarEmoji: '🧑', avatarBg: '#F5F3FF',
    need: 'Thuê', area: 'Quận 2, TP.HCM',
    budget: '25–30 tr/tháng', propertyType: 'Nhà phố',
    time: '4 ngày trước', status: 'contacting',
  },
];

// ---- Component card Lead ----
interface LeadCardProps {
  lead: Lead;
  onCall: (lead: Lead) => void;
  onChat: (lead: Lead) => void;
}

function LeadCard({ lead, onCall, onChat }: LeadCardProps) {
  const cfg = STATUS_CONFIG[lead.status];

  return (
    <View style={cardStyles.card}>
      {/* Hàng trên: Avatar + Thông tin + Badge trạng thái */}
      <View style={cardStyles.topRow}>
        <View style={[cardStyles.avatar, { backgroundColor: lead.avatarBg }]}>
          <Text style={cardStyles.avatarEmoji}>{lead.avatarEmoji}</Text>
        </View>

        <View style={cardStyles.info}>
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.name}>{lead.name}</Text>
            <View style={[cardStyles.badge, { backgroundColor: cfg.bg }]}>
              <Text style={[cardStyles.badgeText, { color: cfg.text }]}>{cfg.label}</Text>
            </View>
          </View>
          <Text style={cardStyles.phone}>{lead.phone}</Text>
          <Text style={cardStyles.time}>{lead.time}</Text>
        </View>
      </View>

      {/* Chi tiết nhu cầu */}
      <View style={cardStyles.detailRow}>
        <View style={cardStyles.chip}>
          <Text style={cardStyles.chipText}>🏠 {lead.propertyType}</Text>
        </View>
        <View style={cardStyles.chip}>
          <Text style={cardStyles.chipText}>📍 {lead.area}</Text>
        </View>
        <View style={cardStyles.chip}>
          <Text style={cardStyles.chipText}>💰 {lead.budget}</Text>
        </View>
      </View>

      {/* Ghi chú (nếu có) */}
      {lead.note ? (
        <View style={cardStyles.noteWrap}>
          <Text style={cardStyles.note}>💬 {lead.note}</Text>
        </View>
      ) : null}

      {/* Nút hành động */}
      <View style={cardStyles.actionRow}>
        <TouchableOpacity style={cardStyles.callBtn} onPress={() => onCall(lead)} activeOpacity={0.8}>
          <Text style={cardStyles.callText}>📞 Gọi ngay</Text>
        </TouchableOpacity>
        <TouchableOpacity style={cardStyles.chatBtn} onPress={() => onChat(lead)} activeOpacity={0.8}>
          <Text style={cardStyles.chatText}>💬 Nhắn tin</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: WHITE,
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 16,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  topRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  avatar: {
    width: 48, height: 48, borderRadius: 24,
    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  avatarEmoji: { fontSize: 22 },
  info: { flex: 1, gap: 2 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  name: { fontSize: 15, fontWeight: '800', color: GRAY_800 },
  badge: {
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: 99,
  },
  badgeText: { fontSize: 11, fontWeight: '700' },
  phone: { fontSize: 13, color: GRAY_500 },
  time: { fontSize: 11, color: GRAY_400 },

  detailRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: {
    backgroundColor: GRAY_100, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  chipText: { fontSize: 11, color: GRAY_500, fontWeight: '600' },

  noteWrap: {
    backgroundColor: '#FFFBEB', borderRadius: 8,
    paddingHorizontal: 10, paddingVertical: 7,
    borderLeftWidth: 3, borderLeftColor: '#FCD34D',
  },
  note: { fontSize: 12, color: '#92400E', lineHeight: 17 },

  actionRow: { flexDirection: 'row', gap: 8 },
  callBtn: {
    flex: 1, backgroundColor: PRIMARY, borderRadius: 10,
    paddingVertical: 9, alignItems: 'center',
  },
  callText: { color: WHITE, fontSize: 13, fontWeight: '700' },
  chatBtn: {
    flex: 1, backgroundColor: '#EFF6FF', borderRadius: 10,
    paddingVertical: 9, alignItems: 'center',
    borderWidth: 1, borderColor: '#BFDBFE',
  },
  chatText: { color: PRIMARY, fontSize: 13, fontWeight: '700' },
});

// ---- Màn hình chính ----
export default function SellerLeadsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [searchText, setSearchText] = useState('');

  // Lọc leads theo tab và từ khóa
  const filteredLeads = useMemo(() => {
    let list = MOCK_LEADS;
    if (activeTab !== 'all') {
      list = list.filter(l => l.status === activeTab);
    }
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(l =>
        l.name.toLowerCase().includes(q) ||
        l.phone.includes(q) ||
        l.need.toLowerCase().includes(q) ||
        l.area.toLowerCase().includes(q) ||
        l.propertyType.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeTab, searchText]);

  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Gọi điện cho lead
  function handleCall(lead: Lead) {
    Alert.alert('Gọi điện', `Gọi cho ${lead.name} — ${lead.phone}\nTODO: Linking.openURL("tel:${lead.phone}")`);
  }

  // Mở chat với lead
  function handleChat(lead: Lead) {
    setSelectedLead(lead);
  }

  const renderItem: ListRenderItem<Lead> = ({ item }) => (
    <LeadCard lead={item} onCall={handleCall} onChat={handleChat} />
  );

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Leads khách hàng</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{MOCK_LEADS.length}</Text>
          </View>
        </View>

        {/* Tìm kiếm */}
        <View style={styles.searchWrap}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm tên, SĐT, khu vực..."
            placeholderTextColor={GRAY_400}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Text style={styles.clearBtn}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tabs lọc trạng thái */}
        <View style={styles.tabScrollWrap}>
          <FlatList
            horizontal
            data={TABS}
            keyExtractor={t => t.key}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 6, gap: 6 }}
            renderItem={({ item: tab }) => (
              <TouchableOpacity
                style={[styles.tab, activeTab === tab.key && styles.tabActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </SafeAreaView>

      {/* Danh sách leads */}
      <FlatList
        data={filteredLeads}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: BottomTabInset + 16 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyEmoji}>👥</Text>
            <Text style={styles.emptyTitle}>Không có lead nào</Text>
            <Text style={styles.emptySub}>
              {searchText ? 'Thử tìm với từ khóa khác.' : 'Leads mới sẽ xuất hiện ở đây khi có khách hàng quan tâm.'}
            </Text>
          </View>
        }
      />
      {/* CHAT REALTIME OVERLAY */}
      <ChatOverlay
        visible={selectedLead !== null}
        onClose={() => setSelectedLead(null)}
        threadId={selectedLead?.id ?? null}
        partnerName={selectedLead?.name ?? 'Khách hàng'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  headerSafe: {
    backgroundColor: WHITE,
    borderBottomWidth: 1, borderBottomColor: GRAY_200,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingTop: 4, paddingBottom: 10,
    justifyContent: 'center', gap: 8,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: GRAY_800, letterSpacing: -0.3 },
  countBadge: {
    backgroundColor: PRIMARY, borderRadius: 10,
    paddingHorizontal: 8, paddingVertical: 2,
  },
  countText: { color: WHITE, fontSize: 12, fontWeight: '800' },

  searchWrap: {
    flexDirection: 'row', alignItems: 'center',
    marginHorizontal: 16, marginBottom: 8,
    backgroundColor: GRAY_100, borderRadius: 12,
    paddingHorizontal: 12, gap: 8, height: 40,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: GRAY_800, paddingVertical: 0 },
  clearBtn: { fontSize: 13, color: GRAY_500, fontWeight: '700' },

  tabScrollWrap: {},
  tab: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 20, backgroundColor: GRAY_100,
  },
  tabActive: { backgroundColor: PRIMARY },
  tabText: { fontSize: 13, fontWeight: '600', color: GRAY_500 },
  tabTextActive: { color: WHITE, fontWeight: '700' },

  emptyWrap: {
    alignItems: 'center', paddingTop: 80, gap: 8,
  },
  emptyEmoji: { fontSize: 48 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: GRAY_800 },
  emptySub: {
    fontSize: 14, color: GRAY_500,
    textAlign: 'center', paddingHorizontal: 32, lineHeight: 20,
  },
});
