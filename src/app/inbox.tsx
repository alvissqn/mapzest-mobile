/**
 * Màn hình 13 – Hộp thư (Inbox / Notifications)
 * Route: /inbox (tab Tin nhắn)
 *
 * Giao diện:
 * - Tab lọc: Tất cả | Khách hàng | Hệ thống
 * - Ô tìm kiếm trong hộp thư
 * - Danh sách thread tin nhắn (avatar, tên, preview, thời gian, badge chưa đọc)
 * - Nhấn vào thread → mở màn 14 (Chat realtime)
 *
 * TODO: GET /api/conversations để tải danh sách thread thật
 * TODO: Real-time cập nhật với WebSocket / FCM
 */
import { useState, useMemo } from 'react';
import {
  StyleSheet, View, Text, FlatList,
  TouchableOpacity, TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { InboxThreadItem, InboxThread } from '@/components/inbox-thread-item';
import { BottomTabInset } from '@/constants/theme';
import { ChatOverlay } from '@/components/chat-overlay';
import { Feather, Ionicons } from '@expo/vector-icons';

const BG       = '#F9FAFB';
const PRIMARY  = '#2563EB';
const GRAY_200 = '#E5E7EB';
const GRAY_400 = '#9CA3AF';
const GRAY_500 = '#6B7280';
const GRAY_800 = '#1F2937';
const WHITE    = '#FFFFFF';

// Các tab lọc hộp thư
type TabKey = 'all' | 'client' | 'system';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'all',    label: 'Tất cả'     },
  { key: 'client', label: 'Khách hàng' },
  { key: 'system', label: 'Hệ thống'   },
];

// Dữ liệu mock các thread tin nhắn
const MOCK_THREADS: InboxThread[] = [
  {
    id: 't1',
    name: 'Nguyễn Văn Minh',
    avatarEmoji: '👨',
    avatarBg: '#DBEAFE',
    preview: 'Anh ơi cho em hỏi căn đó còn không ạ? Em muốn đặt lịch xem cuối tuần này.',
    time: '2 phút',
    unreadCount: 3,
    type: 'client',
    propertyTitle: 'Vinhomes Grand Park – The Rainbow',
  },
  {
    id: 't2',
    name: 'Trần Thị Hoa',
    avatarEmoji: '👩',
    avatarBg: '#FEF3C7',
    preview: 'Cảm ơn anh đã tư vấn, em sẽ xem thêm rồi phản hồi sau ạ',
    time: '15 phút',
    unreadCount: 1,
    type: 'client',
    propertyTitle: 'Nhà phố Thảo Điền view sông',
  },
  {
    id: 't3',
    name: 'Lê Quang Hải',
    avatarEmoji: '🧔',
    avatarBg: '#F0FDF4',
    preview: 'Bạn có thể gửi thêm thông tin pháp lý của căn hộ không?',
    time: '1 giờ',
    unreadCount: 0,
    type: 'client',
    propertyTitle: 'Căn hộ Masteri An Phú',
  },
  {
    id: 't4',
    name: 'Hệ thống MapZest',
    avatarEmoji: '🏠',
    avatarBg: '#EFF6FF',
    preview: '✅ Tin đăng "Biệt thự Nam Sài Gòn" của bạn đã được duyệt và đang hiển thị.',
    time: '2 giờ',
    unreadCount: 0,
    type: 'system',
  },
  {
    id: 't5',
    name: 'Phạm Thanh Tú',
    avatarEmoji: '👧',
    avatarBg: '#FDF2F8',
    preview: 'Anh ơi, giá của căn đó có thể thương lượng không ạ?',
    time: '3 giờ',
    unreadCount: 0,
    type: 'client',
    propertyTitle: 'Căn hộ Q7 Boulevard',
  },
  {
    id: 't6',
    name: 'Hệ thống MapZest',
    avatarEmoji: '🏠',
    avatarBg: '#EFF6FF',
    preview: '⚠️ Tin đăng "Nhà phố Bình Thạnh" sẽ hết hạn sau 3 ngày nữa. Đăng lại để tiếp tục hiển thị.',
    time: '5 giờ',
    unreadCount: 1,
    type: 'system',
  },
  {
    id: 't7',
    name: 'Vũ Hoàng Nam',
    avatarEmoji: '👨‍💼',
    avatarBg: '#ECFDF5',
    preview: 'Ok anh, vậy em book lịch thứ 7 lúc 9 giờ sáng nhé!',
    time: '1 ngày',
    unreadCount: 0,
    type: 'client',
  },
  {
    id: 't8',
    name: 'Hệ thống MapZest',
    avatarEmoji: '🏠',
    avatarBg: '#EFF6FF',
    preview: '🎉 Tài khoản của bạn vừa đạt 50 lượt xem tin đăng trong tuần này!',
    time: '2 ngày',
    unreadCount: 0,
    type: 'system',
  },
];

export default function InboxScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab]   = useState<TabKey>('all');
  const [searchText, setSearchText] = useState('');

  // Lọc thread theo tab và từ khóa tìm kiếm
  const filteredThreads = useMemo(() => {
    let list = MOCK_THREADS;

    // Lọc theo tab
    if (activeTab !== 'all') {
      list = list.filter(t => t.type === activeTab);
    }

    // Lọc theo từ khóa tìm kiếm
    if (searchText.trim()) {
      const q = searchText.toLowerCase();
      list = list.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.preview.toLowerCase().includes(q) ||
        (t.propertyTitle?.toLowerCase().includes(q) ?? false)
      );
    }

    return list;
  }, [activeTab, searchText]);

  // Đếm tổng số tin chưa đọc trong tab hiện tại
  const totalUnread = useMemo(() =>
    filteredThreads.reduce((sum, t) => sum + t.unreadCount, 0),
    [filteredThreads]
  );

  const [selectedThread, setSelectedThread] = useState<InboxThread | null>(null);
  const [systemMessage, setSystemMessage] = useState<string | null>(null);

  // Nhấn vào một thread → mở Chat hoặc Xem tin nhắn hệ thống
  function handleThreadPress(thread: InboxThread) {
    if (thread.type === 'system') {
      setSystemMessage(thread.preview);
    } else {
      setSelectedThread(thread);
    }
  }

  return (
    <View style={styles.root}>
      {/* Header */}
      <SafeAreaView style={styles.headerSafe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Hộp thư
            {totalUnread > 0 ? (
              <Text style={styles.headerBadge}> ({totalUnread})</Text>
            ) : null}
          </Text>
        </View>

        {/* Ô tìm kiếm */}
        <View style={styles.searchWrap}>
          <Feather name="search" size={16} color={GRAY_400} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm theo tên, nội dung..."
            placeholderTextColor={GRAY_400}
            value={searchText}
            onChangeText={setSearchText}
          />
          {searchText.length > 0 ? (
            <TouchableOpacity onPress={() => setSearchText('')}>
              <Feather name="x" size={16} color={GRAY_400} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Tabs lọc */}
        <View style={styles.tabsRow}>
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>

      {/* Danh sách thread */}
      <FlatList
        data={filteredThreads}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: BottomTabInset + 16 }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        renderItem={({ item }) => (
          <InboxThreadItem thread={item} onPress={handleThreadPress} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Ionicons name="chatbox-ellipses-outline" size={60} color="#94A3B8" />
            <Text style={styles.emptyTitle}>Chưa có tin nhắn nào</Text>
          </View>
        }
      />

      {/* CHAT REALTIME OVERLAY */}
      <ChatOverlay
        visible={selectedThread !== null}
        onClose={() => setSelectedThread(null)}
        threadId={selectedThread?.id ?? null}
        partnerName={selectedThread?.name ?? 'Khách hàng'}
      />

      {/* SYSTEM MESSAGE DETAILED MODAL */}
      {systemMessage !== null && (
        <View style={styles.sysModalOverlay}>
          <View style={styles.sysModalCard}>
            <View style={styles.sysModalHeader}>
              <Ionicons name="notifications-outline" size={32} color={PRIMARY} />
              <Text style={styles.sysModalTitle}>Thông báo hệ thống</Text>
            </View>
            <Text style={styles.sysModalBody}>{systemMessage}</Text>
            <TouchableOpacity 
              style={styles.sysModalCloseBtn} 
              onPress={() => setSystemMessage(null)}
            >
              <Text style={styles.sysModalCloseText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
    borderBottomColor: GRAY_200,
    zIndex: 10,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: GRAY_800,
    letterSpacing: -0.3,
  },
  headerBadge: {
    color: PRIMARY,
    fontSize: 17,
    fontWeight: '800',
  },

  // Tìm kiếm
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    gap: 8,
    height: 40,
  },
  searchIcon: {
    fontSize: 15,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: GRAY_800,
    paddingVertical: 0,
  },
  searchClear: {
    fontSize: 13,
    color: GRAY_500,
    fontWeight: '700',
  },

  // Tabs lọc
  tabsRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 2,
    gap: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
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
    fontWeight: '700',
  },

  // Separator
  separator: {
    height: 1,
    backgroundColor: GRAY_200,
    marginLeft: 80,
  },

  // Empty state
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyEmoji: {
    fontSize: 48,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: GRAY_800,
  },
  emptySub: {
    fontSize: 14,
    color: GRAY_500,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 20,
  },

  // System message modal styles
  sysModalOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 8000,
    paddingHorizontal: 24,
  },
  sysModalCard: {
    width: '100%',
    backgroundColor: WHITE,
    borderRadius: 20,
    padding: 24,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  sysModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: GRAY_200,
    paddingBottom: 12,
  },
  sysModalEmoji: {
    fontSize: 24,
  },
  sysModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: GRAY_800,
  },
  sysModalBody: {
    fontSize: 15,
    color: GRAY_800,
    lineHeight: 22,
  },
  sysModalCloseBtn: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  sysModalCloseText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '700',
  },
});
